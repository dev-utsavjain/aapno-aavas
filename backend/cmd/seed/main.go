// Seed demo content: sample projects + media + CMS pages (about/privacy/terms) + a banner.
// Idempotent per slug. Run once after migration: `go run ./cmd/seed`.
package main

import (
	"imagine_backend/config"
	"imagine_backend/internal/db"
	"imagine_backend/internal/models"
	"log"

	"gorm.io/gorm/clause"
)

func main() {
	config.LoadConfig()
	db.ConnectToDB()

	seedProjects()
	seedPages()
	seedBanner()
	log.Println("Seed complete")
}

func seedProjects() {
	type seedProject struct {
		p     models.Project
		media []string // gallery URLs (served from the SPA public dir)
	}
	items := []seedProject{
		{
			p: models.Project{
				Slug: "aravali-greens-jagatpura", Title: "Aravali Greens", DeveloperName: "Shree Balaji Group",
				City: "Jaipur", Locality: "Jagatpura", Type: "residential", BHKConfig: "2 & 3 BHK",
				PriceMin: 4500000, PriceMax: 7200000, Status: "ongoing",
				ReraNo: "RAJ/P/2024/1234", ReraAuthorityURL: "https://rera.rajasthan.gov.in",
				Description: "Contemporary 2 & 3 BHK residences in the fast-growing Jagatpura corridor, minutes from the Ring Road and the upcoming metro extension. Thoughtfully planned homes with abundant natural light, landscaped courtyards and a full amenities deck.",
				Amenities:  models.StringList{"Clubhouse", "Swimming Pool", "Gymnasium", "Landscaped Gardens", "Kids Play Area", "24x7 Security", "Power Backup", "Covered Parking"},
				Tags:       models.StringList{"Ready-to-move soon", "Family", "Gated Community"},
				Lat:        26.7853, Lng: 75.8497, IsPublished: true, Featured: true,
			},
			media: []string{"/gallery/g1.jpg", "/gallery/g2.jpg", "/gallery/g3.jpg", "/gallery/g4.jpg"},
		},
		{
			p: models.Project{
				Slug: "mansarovar-heights", Title: "Mansarovar Heights", DeveloperName: "Kalyan Developers",
				City: "Jaipur", Locality: "Mansarovar", Type: "residential", BHKConfig: "3 & 4 BHK",
				PriceMin: 8500000, PriceMax: 14000000, Status: "ready",
				ReraNo: "RAJ/P/2023/0891", ReraAuthorityURL: "https://rera.rajasthan.gov.in",
				Description: "Ready-to-move premium apartments in the heart of Mansarovar, Jaipur's most established residential hub. Spacious layouts, imported fittings and a rooftop sky-lounge with Aravali views.",
				Amenities:  models.StringList{"Sky Lounge", "Clubhouse", "Swimming Pool", "Gymnasium", "Indoor Games", "Jogging Track", "Visitor Parking", "Rainwater Harvesting"},
				Tags:       models.StringList{"Ready-to-move", "Luxury", "Premium"},
				Lat:        26.8505, Lng: 75.7628, IsPublished: true, Featured: true,
			},
			media: []string{"/gallery/g5.jpg", "/gallery/g6.jpg", "/gallery/g7.jpg", "/gallery/g8.jpg"},
		},
		{
			p: models.Project{
				Slug: "vaishali-signature", Title: "Vaishali Signature", DeveloperName: "Manglam Build Developers",
				City: "Jaipur", Locality: "Vaishali Nagar", Type: "residential", BHKConfig: "4 BHK",
				PriceMin: 15000000, PriceMax: 22000000, Status: "upcoming",
				ReraNo: "RAJ/P/2025/0042", ReraAuthorityURL: "https://rera.rajasthan.gov.in",
				Description: "Limited-edition 4 BHK signature residences launching in Vaishali Nagar. Double-height living, private decks and a curated amenities collection for those who want the best address in west Jaipur.",
				Amenities:  models.StringList{"Concierge", "Infinity Pool", "Spa", "Banquet", "EV Charging", "Smart Home", "Landscaped Terraces"},
				Tags:       models.StringList{"Upcoming", "Luxury", "Signature"},
				Lat:        26.9124, Lng: 75.7398, IsPublished: true, Featured: false,
			},
			media: []string{"/gallery/g9.jpg", "/gallery/g10.jpg", "/gallery/g11.jpg", "/gallery/g12.jpg"},
		},
	}

	for _, it := range items {
		var existing models.Project
		if err := db.DB.Where("slug = ?", it.p.Slug).First(&existing).Error; err == nil {
			continue // already seeded
		}
		if err := db.DB.Create(&it.p).Error; err != nil {
			log.Printf("seed project %s failed: %v", it.p.Slug, err)
			continue
		}
		for i, url := range it.media {
			db.DB.Create(&models.Media{ProjectID: it.p.ID, URL: url, Kind: "image", SortOrder: i, Alt: it.p.Title})
		}
		log.Printf("seeded project %s (%d media)", it.p.Slug, len(it.media))
	}
}

func seedPages() {
	pages := []models.Page{
		{
			Slug: "about", Title: "About Aapno Aavas",
			MetaTitle:       "About Aapno Aavas — Jaipur Property Advisory",
			MetaDescription: "Aapno Aavas is a trusted Jaipur real-estate advisory & channel partner.",
			Body:            `<p>Aapno Aavas is a Jaipur-based real-estate advisory and channel partner. We help home buyers and investors discover, evaluate and secure the right residential and commercial properties across the city.</p><p>As a channel partner we represent developers' projects — we are not the developer — and we stay with you end to end: shortlisting, site visits, negotiations and paperwork.</p>`,
		},
		{
			Slug: "privacy", Title: "Privacy Policy",
			MetaTitle:       "Privacy Policy — Aapno Aavas",
			MetaDescription: "How Aapno Aavas collects, uses and protects your personal data under DPDPA 2023.",
			Body: `<h2>Privacy Policy</h2><p>Your privacy is important to us. Any personal information collected through this website — including your name, mobile number and email — is processed and protected in accordance with the Digital Personal Data Protection Act, 2023 and applicable IT laws of India.</p><h3>What we collect &amp; why</h3><p>We collect the details you submit through our inquiry forms or WhatsApp to respond to your property inquiry and share relevant options.</p><h3>Your consent &amp; rights</h3><p>By submitting an inquiry you consent to our processing your data and to being contacted by call, SMS, WhatsApp and email regarding real-estate projects and advisory services. You may withdraw consent or unsubscribe at any time by writing to us.</p><h3>Retention &amp; grievances</h3><p>We retain lead data only as long as needed to serve your inquiry and for legal compliance. For any data request or grievance, contact our team via the details on the Contact page.</p>`,
		},
		{
			Slug: "terms", Title: "Terms & Conditions",
			MetaTitle:       "Terms & Conditions — Aapno Aavas",
			MetaDescription: "Terms of use, RERA and disclaimer information for the Aapno Aavas website.",
			Body: `<h2>Terms &amp; Conditions</h2><p>By using this website you agree to these terms. Aapno Aavas operates solely as a real-estate agent / channel partner / advisory firm for various developers and is <strong>not</strong> the developer, builder or promoter of the projects shown.</p><h3>Invitation to offer</h3><p>All content constitutes an "Invitation to Offer" and does not form a binding offer or agreement. Any transaction is governed exclusively by the Agreement for Sale / Allotment Letter executed with the respective developer.</p><h3>RERA</h3><p>Project details, including RERA registration and approvals, are sourced from developers or public sources. Buyers must independently verify the current RERA status on the official State RERA Authority website before booking.</p><h3>Visuals, area &amp; pricing</h3><p>All images, renders and walkthroughs are artistic impressions and may differ from the actual development. Carpet/built-up areas, floor plans and pricing are tentative and may vary per final approvals and developer terms.</p><h3>Telecom consent</h3><p>By submitting your details you authorise Aapno Aavas and its representatives to contact you by call, SMS, WhatsApp and email; this consent overrides any DND/NDNC registration (TRAI/TCCCPR).</p><h3>Limitation of liability</h3><p>To the fullest extent permitted by law, Aapno Aavas is not liable for any loss arising from reliance on the information provided or from the developer's acts, delays or defaults.</p>`,
		},
	}
	for _, pg := range pages {
		if err := db.DB.Clauses(clause.OnConflict{Columns: []clause.Column{{Name: "slug"}}, DoNothing: true}).Create(&pg).Error; err != nil {
			log.Printf("seed page %s failed: %v", pg.Slug, err)
		}
	}
	log.Println("seeded CMS pages")
}

func seedBanner() {
	var count int64
	db.DB.Model(&models.Banner{}).Count(&count)
	if count > 0 {
		return
	}
	db.DB.Create(&models.Banner{
		ImageURL: "/img/hero.jpg", Headline: "Find a home that feels like yours",
		Subtext: "Curated residential & commercial properties across Jaipur.", Link: "/projects",
		Placement: "home_hero", Active: true, SortOrder: 0,
	})
	log.Println("seeded home banner")
}
