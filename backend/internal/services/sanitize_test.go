package services

import "strings"

import "testing"

func TestSanitizeHTMLStripsScripts(t *testing.T) {
	in := `<h2>Privacy</h2><p onclick="steal()">Hi</p><script>alert(1)</script><a href="/x">ok</a>`
	out := SanitizeHTML(in)
	if strings.Contains(out, "<script") || strings.Contains(out, "onclick") {
		t.Fatalf("sanitizer left dangerous content: %q", out)
	}
	if !strings.Contains(out, "<h2>Privacy</h2>") || !strings.Contains(out, "ok") {
		t.Fatalf("sanitizer stripped safe content: %q", out)
	}
}
