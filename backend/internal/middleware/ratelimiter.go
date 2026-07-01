package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// visitor holds a per-IP limiter plus a lastSeen stamp so idle entries can be evicted
// (the original template leaked memory with an unbounded, never-cleared map).
type visitor struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

type ipRateLimiter struct {
	mu       sync.Mutex
	visitors map[string]*visitor
	r        rate.Limit
	burst    int
}

func newIPRateLimiter(r rate.Limit, burst int) *ipRateLimiter {
	l := &ipRateLimiter{visitors: make(map[string]*visitor), r: r, burst: burst}
	go l.cleanupLoop()
	return l
}

func (l *ipRateLimiter) get(ip string) *rate.Limiter {
	l.mu.Lock()
	defer l.mu.Unlock()
	v, ok := l.visitors[ip]
	if !ok {
		v = &visitor{limiter: rate.NewLimiter(l.r, l.burst)}
		l.visitors[ip] = v
	}
	v.lastSeen = time.Now()
	return v.limiter
}

func (l *ipRateLimiter) cleanupLoop() {
	// ponytail: global sweep every 3 min; fine for a single-instance service.
	for range time.Tick(3 * time.Minute) {
		l.mu.Lock()
		for ip, v := range l.visitors {
			if time.Since(v.lastSeen) > 10*time.Minute {
				delete(l.visitors, ip)
			}
		}
		l.mu.Unlock()
	}
}

func (l *ipRateLimiter) middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !l.get(c.ClientIP()).Allow() {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "Too many requests"})
			return
		}
		c.Next()
	}
}

// Global limiter: generous, protects against blunt floods on read traffic. Static /assets are
// excluded at registration time (they aren't behind this middleware).
var globalLimiter = newIPRateLimiter(20, 40)

// Strict limiter: for abuse-prone write endpoints (POST /leads, POST /admin/login). ~10/min.
var strictLimiter = newIPRateLimiter(rate.Limit(10.0/60.0), 5)

func RateLimiterMiddleware() gin.HandlerFunc { return globalLimiter.middleware() }

// StrictRateLimiter throttles sensitive endpoints far harder than general traffic.
func StrictRateLimiter() gin.HandlerFunc { return strictLimiter.middleware() }
