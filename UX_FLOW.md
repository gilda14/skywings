# SkyWings Airline Booking App — UX Flow

## User Journey

```
  1. LOGIN                 2. SEARCH               3. SELECT
  ┌─────────────┐          ┌─────────────┐         ┌─────────────┐
  │ ✈ SkyWings  │          │ From ──→ To  │         │ ┌─────────┐ │
  │             │  ──→     │ Date         │  ──→    │ │ Flight  │ │
  │ Email       │          │ Passengers   │         │ │ $465    │ │
  │ Password    │          │ Cabin Class  │         │ └─────────┘ │
  │ [Sign In]   │          │ [Search]     │         │ [Continue]  │
  └─────────────┘          └─────────────┘         └─────────────┘
                                                           │
                                                           ▼
  4. DATE/TIME             5. BAGGAGE              6. PAYMENT
  ┌─────────────┐          ┌─────────────┐         ┌─────────────┐
  │  Mo  Tu  We  │          │ 🛄  🧳  🧳   │         │ Booking     │
  │  12   13  14 │          │ 7kg 15kg 23kg│         │ Summary     │
  │              │  ──→     │              │  ──→    │ ● Card      │
  │ 06:00 07:30  │          │ Extra bags:  │         │ ○ PayPal    │
  │ 09:00 10:30  │          │ [−] 0 [+]    │         │ ○ Apple Pay │
  │ [Continue]   │          │ [Continue]   │         │ [Pay $xxx]  │
  └─────────────┘          └─────────────┘         └──────┬──────┘
                                                           │
                                                           ▼
                                                  7. CONFIRMED
                                                  ┌─────────────┐
                                                  │ ✅ Confirmed│
                                                  │ SW-ABC123   │
                                                  │ Flight info │
                                                  │ [Book Again]│
                                                  └─────────────┘
```

## Design System

- **Colors:** Navy Blue (#1a56db) — trust & professionalism
  - Accent: Gold (#f59e0b) — premium feel
  - Background: Light gray (#f8fafc) — clean, airy
- **Typography:** System fonts, clean sans-serif hierarchy
- **Shapes:** Rounded corners (12px cards), soft shadows
- **Responsive:** Works on desktop and mobile

## Key UX Decisions

1. **Dual-panel login** — Brand showcase on left builds trust while user signs in
2. **Progressive step indicator** — Always visible so users know where they are
3. **Search results with filters** — Price range slider, stops filter, sort options
4. **Baggage comparison cards** — Visual comparison makes picking easy; "Most Popular" badge nudges toward standard
5. **Booking summary before payment** — No surprises; full cost breakdown
6. **Payment method selection** — Multiple gateways with visual distinction; card form only shows when needed
7. **Confirmation with reference number** — Clear next step: book another or email receipt

## Pages

| # | Page | File | Purpose |
|---|------|------|---------|
| 1 | Login + Register | `index.html` | Authentication |
| 2 | Flight Search | `index.html` | Search form |
| 3 | Results | `index.html` | Flight selection |
| 4 | Date/Time | `index.html` | Calendar + time slots |
| 5 | Baggage | `index.html` | Weight selection |
| 6 | Payment | `index.html` | Gateway + card form |
| 7 | Confirmation | `index.html` | Booking receipt |

All pages are in a single SPA (`index.html`) for rapid prototyping. Each could be extracted into separate HTML files for production.
