# Admin Guide — Aapno Aavas CMS

A short guide for the Aapno Aavas team to manage the website. No coding required.

## Logging in

Go to `https://<your-site>/admin/login` and sign in with the email + password provided to you.
You'll land on the **Dashboard** (totals + recent inquiries). Use **Logout** (bottom of the sidebar)
when done, especially on shared computers.

## Projects (the properties you showcase)

**Projects → New Project.** Fill in:

- **Title, Developer, City, Locality** — shown on cards and the project page.
- **Type** — Residential or Commercial. **Config** — e.g. `2, 3 & 4 BHK`.
- **Price (min/max)** — in rupees; shown formatted (e.g. ₹45 L – ₹1.2 Cr). Leave 0 for "On Request".
- **Status** — Upcoming / Under Construction / Ready to Move.
- **RERA No. + RERA Authority URL** — displayed with a "verify" link in the legal block.
- **Description** — the write-up on the project page.
- **Amenities / Tags** — comma-separated (e.g. `Clubhouse, Gym, Kids Play Area`). Tags power the
  category filters (e.g. `Luxury, Ready-to-move`).
- **Meta title / description** — used for Google + social sharing. Leave blank to auto-generate.
- **Published** — the project only appears on the public site when this is on.
- **Featured** — featured projects surface first on the home page + listings.

Save. Then **edit the project again** to manage its **Media** (photos/videos):
- **Add by URL** — paste an image/video URL.
- **Upload** — choose a file (JPG/PNG/WebP up to 10 MB, MP4 up to 60 MB). *(Requires storage set up;
  if you see a storage message, use Add by URL instead.)*
- The **first image** (lowest sort order) is the cover + the social-share image.
- Delete removes a media item.

> **Never delete** the legal disclaimer — it appears automatically on every project page and is required.

## Leads (customer inquiries)

**Leads** shows every inquiry from the website forms and WhatsApp.
- Change **status** (New → Contacted → Qualified → Closed/Lost) with the dropdown.
- Add **notes** per lead (call summaries, follow-up dates).
- Filter by status / source / search by name or phone.
- **Export CSV** downloads all leads (opens in Excel) — includes the consent record for each lead.

> Leads carry two consents (data processing + call/WhatsApp/DND override). Only contact leads that
> submitted the form or messaged on WhatsApp — the consent is logged with a timestamp for compliance.

## Banners

**Banners** manages promotional images (e.g. the home hero). Set image, headline, subtext, link,
placement, order, and Active. Only Active banners show on the site.

## Pages (About / Privacy / Terms / info pages)

**Pages** lets you edit informational pages by their slug (`about`, `privacy`, `terms`, …).
- **Body** accepts basic HTML (headings, paragraphs, lists, links). It's automatically cleaned for
  safety on save.
- **Meta title/description** control how the page appears in search + shares.

## Tips

- Changes are **live immediately** — no developer or redeploy needed.
- Use good, real photos — the site is designed around large imagery.
- Keep RERA numbers accurate; buyers rely on the verify link.
