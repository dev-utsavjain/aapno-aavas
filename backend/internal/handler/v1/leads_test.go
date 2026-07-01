package v1

import "testing"

func TestCsvSafe(t *testing.T) {
	cases := map[string]string{
		"+919812345678": "'+919812345678", // phone: formula-injection vector
		"=1+1":          "'=1+1",
		"-5":            "'-5",
		"@handle":       "'@handle",
		"Ravi Kumar":    "Ravi Kumar", // normal text untouched
		"":              "",
	}
	for in, want := range cases {
		if got := csvSafe(in); got != want {
			t.Errorf("csvSafe(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestItoa(t *testing.T) {
	if got := itoa(uint(0)); got != "0" {
		t.Errorf("itoa(0) = %q", got)
	}
	if got := itoa(uint(12345)); got != "12345" {
		t.Errorf("itoa(12345) = %q", got)
	}
}
