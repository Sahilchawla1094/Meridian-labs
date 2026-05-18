# Meridian Labs — Tech Stack

A full breakdown of every technology used to build and run this platform.

---

## Frontend

| Layer | Technology | Notes |
|---|---|---|
| Markup | **HTML5** | Semantic, single-file architecture |
| Styling | **CSS3** | Custom properties, Grid, Flexbox, animations |
| Scripting | **Vanilla JavaScript (ES6+)** | No frameworks, no libraries |
| Fonts | **Google Fonts** | Cormorant Garamond · DM Mono · Outfit |
| Icons | **Inline SVG** | WhatsApp icon, no external icon library |

### Key frontend features built from scratch
- Custom cursor (gold dot + animated ring)
- Scroll-triggered reveal animations via `IntersectionObserver`
- Marquee ticker (duplicated for seamless loop)
- Hamburger menu (mobile nav overlay)
- Navbar shrink on scroll (frosted-glass effect)
- Rate card renderer (reads from `localStorage`)
- PDF generation via `window.print()` with print-scoped CSS

---

## Admin Dashboard (`admin.html`)

| Feature | Implementation |
|---|---|
| Auth | Client-side email + password check, `sessionStorage` session |
| Lead storage | **Neon (Postgres)** — synced via `/api/leads` |
| Lead cache | `localStorage` — instant render while Neon fetches |
| Project tracker | `localStorage` — deadlines, countdowns, money tracking |
| Rate card | `localStorage` — editable, PDF-printable |
| Sign-off PDFs | `window.open()` + `window.print()` with cream-themed HTML |
| Countdown timers | `setInterval` refreshing every 60 seconds |

---

## Backend / API

| Layer | Technology | Notes |
|---|---|---|
| Serverless runtime | **Vercel Functions** (Node.js) | `api/leads.js` |
| Database driver | **@neondatabase/serverless** `^0.10.4` | HTTP-based Postgres driver |
| Database | **Neon** (serverless Postgres) | Free tier, auto-suspend |
| Email delivery | **FormSubmit.co** | Zero-backend, no signup required |

### API routes
| Method | Route | Action |
|---|---|---|
| `GET` | `/api/leads` | Fetch all leads (newest first) |
| `POST` | `/api/leads` `{ action: 'add' }` | Insert new lead |
| `POST` | `/api/leads` `{ action: 'update' }` | Update status / notes / full record |
| `POST` | `/api/leads` `{ action: 'delete' }` | Delete lead by ID |
| `POST` | `/api/leads` `{ action: 'clear' }` | Delete all leads |

### Database schema
```sql
CREATE TABLE IF NOT EXISTS leads (
  id          BIGINT PRIMARY KEY,       -- Date.now() timestamp
  date        TEXT,                     -- ISO 8601 string
  name        TEXT,
  email       TEXT,
  phone       TEXT    DEFAULT '',
  brief       TEXT,
  status      TEXT    DEFAULT 'New',    -- New · Contacted · In Discussion · Proposal Sent · Won · Lost
  notes       TEXT    DEFAULT '',
  source      TEXT    DEFAULT 'contact-form',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Infrastructure & Deployment

| Layer | Technology | Notes |
|---|---|---|
| Hosting | **Vercel** | Static site + serverless functions |
| Source control | **GitHub** | Auto-deploys on push to `master` |
| Repo | `github.com/Sahilchawla1094/Meridian-labs` | |
| Domain registrar | **GoDaddy** | `sahilchawla.xyz` |
| Live URL | `meridian.sahilchawla.xyz` | Vercel custom subdomain |
| Env secrets | Vercel Environment Variables | `DATABASE_URL` (Neon connection string) |

---

## Integrations

| Service | Purpose |
|---|---|
| **FormSubmit.co** | Delivers contact form submissions to `sahilchawla1094@gmail.com` |
| **Neon** | Persistent lead storage across devices |
| **WhatsApp** (`wa.me/919799558521`) | Floating CTA button on public site |
| **Google Fonts CDN** | Cormorant Garamond, DM Mono, Outfit |

---

## Design System

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#080808` | Page background |
| `--gold` | `#c9a84c` | Primary accent |
| `--gold-dim` | `rgba(201,168,76,0.15)` | Subtle gold fills |
| `--text` | `#f0ece4` | Body text |
| `--muted` | `rgba(240,236,228,0.5)` | Secondary text |
| `--border` | `rgba(201,168,76,0.2)` | Card/divider borders |
| `--card-bg` | `rgba(255,255,255,0.025)` | Card backgrounds |

**Visual style:** Dark luxury — noise texture overlay, scroll animations, custom cursor, gold accents.

---

## What is NOT used

- No React / Vue / Angular
- No Tailwind / Bootstrap
- No build tool (Webpack / Vite / Parcel)
- No CMS
- No authentication service (Auth0, Supabase Auth, etc.)
- No external JS libraries (jQuery, Lodash, etc.)
- No dedicated backend server — Vercel Functions only
