# Locum Ops — Tentative Infrastructure & Third-Party Pricing

**Prepared by:** Shraddha IT Solutions  
**Date:** September 2026  
**Note:** All prices are estimates. Actual costs depend on usage volume and chosen providers.

---

## Section A — One-Time Costs

| # | Item | Provider | Cost (USD) | Cost (INR approx.) | Notes |
|---|------|----------|------------|---------------------|-------|
| A1 | Google Play Developer Account | Google | **$25 one-time** | ₹2,100 | One-time registration for Android app |
| A2 | Apple Developer Account | Apple | **$99/year** | ₹8,300/year | Required for iOS app + Apple Sign In + Push (APNs) |
| A3 | Domain Name (e.g. `locumops.com`) | GoDaddy / Namecheap | **$12/year** | ₹1,000/year | Covers API domain + admin web domain |
| A4 | SSL Certificate | Let's Encrypt | **FREE** | ₹0 | Recommended — trusted & auto-renewing |

**One-time total (Year 1):** ~$136 (~₹11,400)  
**Annual renewal (from Year 2):** ~$111/year (~₹9,300/year) — Apple + Domain only

---

## Section B — Hosting Options

We have two hosting options. Client can choose either one based on preference.

---

### Option 1 — DigitalOcean + Vercel + AWS S3

A widely used combination — backend on DigitalOcean, frontend on Vercel (free), documents on AWS S3.

| What | Where | Cost/month |
|------|-------|------------|
| Backend (FastAPI) + MySQL | DigitalOcean Droplet (2 GB RAM, 1 vCPU) | **$12** (~₹1,000) |
| Admin Web Panel (React.js) | Vercel — free static hosting | **$0** |
| File Storage (documents) | AWS S3 | **$1–2** (~₹85–170) |
| **Total** | | **~$13–14/month** (~₹1,085–1,170) |

**How it works:**
- `api.locumops.com` → DigitalOcean (FastAPI backend)
- `admin.locumops.com` → Vercel (React admin panel)
- Doctor documents → AWS S3 (licenses, certifications, ID proofs)

---

### Option 2 — Hostinger VPS + Cloudflare R2 ✅ Recommended

A simpler and cheaper setup — everything on one Hostinger VPS, document storage on Cloudflare R2.

| What | Where | Cost/month |
|------|-------|------------|
| Backend (FastAPI) + MySQL + Admin Panel | Hostinger VPS KVM 1 (4 GB RAM, 1 vCPU, 50 GB NVMe) | **~$5** (~₹420) |
| File Storage (documents) | Cloudflare R2 | **FREE** up to 10 GB |
| **Total** | | **~$5/month** (~₹420) |

**How it works:**
- `api.locumops.com` → Hostinger VPS (FastAPI backend via Nginx)
- `admin.locumops.com` → Same Hostinger VPS (React admin panel via Nginx)
- Doctor documents → Cloudflare R2 (free, no download charges)
- Mobile App → Google Play Store + Apple App Store (no server needed)

**Why Cloudflare R2 over AWS S3 for file storage:**

| | AWS S3 | Cloudflare R2 |
|---|---|---|
| Storage cost | $0.023/GB/month | $0.015/GB/month |
| Download (egress) cost | $0.09/GB | **FREE** |
| Free tier | 5 GB (12 months only) | **10 GB forever** |
| Verdict | Standard | **Cheaper — no download fees** |

> Every time a doctor's document is viewed or downloaded, AWS S3 charges egress fees. Cloudflare R2 charges nothing for downloads — better for a document-heavy app.

---

### Option 3 — Vultr VPS + Cloudflare R2

Vultr is a VPS provider similar to Hostinger — good global data centres including Mumbai (India).

| What | Where | Cost/month |
|------|-------|------------|
| Backend (FastAPI) + MySQL + Admin Panel | Vultr Cloud Compute (2 GB RAM, 1 vCPU, 55 GB SSD) | **~$6** (~₹500) |
| File Storage (documents) | Cloudflare R2 | **FREE** up to 10 GB |
| **Total** | | **~$6/month** (~₹500) |

> Vultr has a Mumbai data centre — good for India-based users. Slightly more expensive than Hostinger but well-established with good support.

---

### Option 4 — DigitalOcean Droplet + Spaces (All-in-One DO)

DigitalOcean has its own file storage called **Spaces** (S3-compatible). You can keep everything within DigitalOcean.

| What | Where | Cost/month |
|------|-------|------------|
| Backend (FastAPI) + MySQL + Admin Panel | DigitalOcean Droplet (2 GB RAM, 1 vCPU) | **$12** (~₹1,000) |
| File Storage (documents) | DigitalOcean Spaces | **$5** (~₹420) — includes 250 GB |
| **Total** | | **~$17/month** (~₹1,420) |

> Convenient — everything managed in one DigitalOcean dashboard. Spaces includes 250 GB storage + 1 TB outbound transfer for $5/month.

---

### Option 5 — AWS EC2 + S3 (All AWS)

Full AWS setup — enterprise grade, used by large companies. More complex to manage.

| What | Where | Cost/month |
|------|-------|------------|
| Backend (FastAPI) + MySQL + Admin Panel | AWS EC2 t3.small (2 GB RAM, 2 vCPU) | **~$15** (~₹1,250) |
| File Storage (documents) | AWS S3 | **$1–2** (~₹85–170) |
| **Total** | | **~$16–17/month** (~₹1,335–1,420) |

> Most powerful and scalable option. Best if client expects very large user base in future. Complex setup — not needed at launch scale.

---

### Option 6 — Linode (Akamai) VPS + Cloudflare R2

Linode (now Akamai Cloud) is a reliable VPS provider, popular among developers.

| What | Where | Cost/month |
|------|-------|------------|
| Backend (FastAPI) + MySQL + Admin Panel | Linode Nanode (1 GB RAM) or Linode 2 GB | **$5–10** (~₹420–840) |
| File Storage (documents) | Cloudflare R2 | **FREE** up to 10 GB |
| **Total** | | **~$5–10/month** (~₹420–840) |

> Linode is reliable and developer-friendly. Mumbai data centre available. 1 GB RAM (Nanode) may be too tight for FastAPI + MySQL — recommend the 2 GB plan at $10/month.

---

### Option Comparison — All Options

| | Option 1 | Option 2 ✅ | Option 3 | Option 4 | Option 5 | Option 6 |
|---|---|---|---|---|---|---|
| Server | DigitalOcean | **Hostinger VPS** | Vultr | DigitalOcean | AWS EC2 | Linode |
| Frontend | Vercel | **Same VPS** | Same VPS | Same VPS | Same VPS | Same VPS |
| File Storage | AWS S3 | **Cloudflare R2** | Cloudflare R2 | DO Spaces | AWS S3 | Cloudflare R2 |
| RAM | 2 GB | **4 GB** | 2 GB | 2 GB | 2 GB | 2 GB |
| Monthly Cost | ~$13–14 | **~$5** | ~$6 | ~$17 | ~$16–17 | ~$5–10 |
| Annual (infra) | ~₹13,000 | **~₹5,040** | ~₹6,000 | ~₹17,040 | ~₹16,000 | ~₹5,000–10,000 |
| India Data Centre | Yes | Yes | **Yes (Mumbai)** | Yes | Yes | Yes |
| Best for | Established stack | **Best value** | India speed | All-in-one DO | Large scale | Developer-friendly |

---

## Section C — Other Monthly Services

These apply to both hosting options above.

### Email — Transactional (OTP + Notifications)

**Used for:** OTP on signup, forgot-password links, shift booking confirmations, credential expiry alerts.

| Tier | Provider | Emails/month | Cost/month |
|------|----------|-------------|------------|
| **Free (Launch)** | **SendGrid** | **Up to 3,000/month** | **$0** |
| Essentials | SendGrid | Up to 50,000/month | $19.95 (~₹1,670) |

> SendGrid free tier (3,000 emails/month) is sufficient at launch.

---

### Push Notifications — Firebase FCM

| Item | Cost |
|------|------|
| Firebase Cloud Messaging (FCM) | **FREE — unlimited messages** |

---

### Google Maps API

| Usage | Cost |
|-------|------|
| Up to $200 free credit/month | **FREE** |
| Above free tier | $7 per 1,000 requests |

> Free credit covers Maps usage completely at small scale.

---

### Error Monitoring (Optional)

| Item | Provider | Cost |
|------|----------|------|
| Error tracking | Sentry | **FREE** (5,000 errors/month) |
| Analytics | Firebase Analytics | **FREE** |

---

## Section D — Full Monthly Cost Summary

### Option 1 — DigitalOcean + Vercel + AWS S3

| Item | Host | Cost/month |
|------|------|------------|
| Backend + MySQL | DigitalOcean Droplet | $12 (~₹1,000) |
| Admin Web Panel | Vercel | $0 |
| File Storage | AWS S3 | $1–2 (~₹85–170) |
| Email | SendGrid | $0 |
| Push Notifications | Firebase FCM | $0 |
| Google Maps | Google Cloud | $0 |
| **Total** | | **~$13–14/month (~₹1,085–1,170)** |

---

### Option 2 — Hostinger VPS + Cloudflare R2 ✅ Recommended

| Item | Host | Cost/month |
|------|------|------------|
| Backend + Frontend + MySQL | Hostinger VPS | $5 (~₹420) |
| File Storage | Cloudflare R2 | $0 (free 10 GB) |
| Email | SendGrid | $0 |
| Push Notifications | Firebase FCM | $0 |
| Google Maps | Google Cloud | $0 |
| **Total** | | **~$5/month (~₹420)** |

---

## Section E — Annual Cost Comparison (Including One-Time Fees)

| Item | Opt 1 | Opt 2 ✅ | Opt 3 | Opt 4 | Opt 5 | Opt 6 |
|------|-------|---------|-------|-------|-------|-------|
| Server (12 months) | ₹12,000 | **₹5,040** | ₹6,000 | ₹12,000 | ₹15,000 | ₹5,000–10,000 |
| File Storage (12 months) | ₹1,500 | **₹0** | **₹0** | ₹5,040 | ₹1,500 | **₹0** |
| Google Play (one-time) | ₹2,100 | ₹2,100 | ₹2,100 | ₹2,100 | ₹2,100 | ₹2,100 |
| Apple Developer (annual) | ₹8,300 | ₹8,300 | ₹8,300 | ₹8,300 | ₹8,300 | ₹8,300 |
| Domain (annual) | ₹1,000 | ₹1,000 | ₹1,000 | ₹1,000 | ₹1,000 | ₹1,000 |
| **Grand Total Year 1** | **~₹24,900** | **~₹16,440** | **~₹17,400** | **~₹28,440** | **~₹27,900** | **~₹16,400–21,400** |

> **Option 2 (Hostinger + Cloudflare R2) is the most cost-effective** — saves approximately ₹8,460 compared to Option 1 in the first year.

---

## Note on SMS

After reviewing all the mobile app screens and admin panel screens in detail, **SMS is not used anywhere in this project** — not for OTP, not for notifications. The OTP verification screen sends the 6-digit code to the user's **email address**, and shift notifications are handled via **Firebase Push Notifications (FCM)**, which are free. Therefore, SMS pricing is not included in this estimate.

However, if SMS is required in the future, please note that TRAI (India's telecom regulator) mandates **DLT (Distributed Ledger Technology) registration** before any business can send commercial SMS in India. This registration must be done in the business's name before any SMS provider (MSG91, Fast2SMS, Twilio, etc.) can be used. The cost for DLT registration is approximately **₹5,900 + 18% GST = ₹6,962 one-time**, plus the same amount annually for renewal.

---

*This is a tentative estimate. Final costs will vary based on actual usage, chosen providers, and any plan upgrades. All pricing as of September 2026.*
