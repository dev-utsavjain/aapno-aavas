package v1

import "testing"

func TestSlugify(t *testing.T) {
	cases := []struct{ explicit, title, want string }{
		{"", "The Grand Vista Residency", "the-grand-vista-residency"},
		{"", "Palm Court — Phase 2!", "palm-court-phase-2"},
		{"custom-slug", "Ignored Title", "custom-slug"},
		{"", "  Sky   Villas  ", "sky-villas"},
		{"", "A/B & C", "ab-c"},
	}
	for _, c := range cases {
		if got := slugify(c.explicit, c.title); got != c.want {
			t.Errorf("slugify(%q,%q) = %q, want %q", c.explicit, c.title, got, c.want)
		}
	}
}
