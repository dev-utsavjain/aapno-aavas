package services

import "github.com/microcosm-cc/bluemonday"

// ugcPolicy allows the formatting a rich-text CMS page needs, and strips scripts/handlers to
// prevent stored XSS on public pages (Privacy/Terms/About bodies).
var ugcPolicy = func() *bluemonday.Policy {
	p := bluemonday.UGCPolicy()
	p.AllowAttrs("class").Globally()
	p.AllowElements("h1", "h2", "h3", "h4", "figure", "figcaption")
	p.RequireNoFollowOnLinks(true)
	p.AllowStandardURLs()
	return p
}()

// SanitizeHTML cleans admin-authored HTML before it is persisted and later rendered publicly.
func SanitizeHTML(in string) string {
	return ugcPolicy.Sanitize(in)
}
