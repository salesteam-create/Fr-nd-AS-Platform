# Frænd Corporate Lunch Platform (demo prototype)

Clickable demo of the B2B lunch ordering platform described in [`docs/BRD.md`](docs/BRD.md). It is a front-end only prototype: all data is fictional mock data stored in the browser (localStorage), and Tripletex, email, EHF and the Brønnøysund lookup are simulated.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Hosting (GitHub Pages)

Live demo: https://salesteam-create.github.io/Fr-nd-AS-Platform/

The app is a static export (`npm run build` writes to `out/`). The workflow in `.github/workflows/pages.yml` builds and deploys it on every push to the working branch or `main`. GitHub Pages must use **Settings → Pages → Source: GitHub Actions**.

To preview the export locally under the same sub-path: `PAGES_BASE_PATH=/Fr-nd-AS-Platform npm run build`, then serve the parent of `out/` so the site sits at `/Fr-nd-AS-Platform/`.

## What is in the demo

**Customer portal** (`/portal`, log in from `/login` with the prefilled demo account)
- Landing page, company registration with simulated org. number lookup and delivery-area check
- Overview: next delivery, deadline countdown, standing order, latest invoice
- Order lunch: portions and special diets per day, delivery comments, copy last week, price summary, deadline locking
- Standing order: weekly pattern that repeats automatically, with start date and pause
- Menu with allergens and labels, order history, invoices, company details, addresses and users

**Frænd admin** (`/admin`)
- Dashboard: next delivery day, production needs, next week forecast, key figures, best sellers
- Production and packing lists, delivery list grouped by area (print and CSV)
- Orders grid for the week, with override after the deadline
- Menu planning and publishing, customers and prices, settings (deadline, VAT, delivery areas)
- Invoicing: build invoices from delivered orders, send to Tripletex (simulated), ledger sync, sync log
- Reports: revenue per month and per customer, delivery by area, CSV export

## Demo controls

The dark **Demo** button (bottom left) opens demo controls:
- Move the demo clock (+1 h, +1 day, "2 min before next deadline", +5 min) to show orders locking
- Switch between the customer portal and admin
- Reset all demo data

## Suggested demo script

1. Landing page, then register a new company (org. number "Look up" fills the details).
2. Set up a standing order, then open **Order lunch** and change one day.
3. Open **Frænd admin → Production & packing**: the numbers have updated.
4. Use **Demo → 2 min before next deadline**, then **+5 min**: the day locks for the customer, and the production list shows as final.
5. **Invoicing & Tripletex**: create draft invoices for last month, then send them to Tripletex.

## Notes

- Placeholder branding (colours in `tailwind.config.ts`, wordmark in `src/components/Logo.tsx`, food photos in `src/components/DishImage.tsx`). Swap these when Frænd's assets arrive.
- The UI is in English for the demo. Production will be Norwegian (bokmål).
- Times follow the viewer's browser time zone.
- Assumptions follow BRD section 11 (company-level portion counts, invoice only, weekdays, Monday orders lock on Friday).

## Code map

- `src/lib/types.ts` data model
- `src/lib/logic.ts` business rules: effective order, deadlines, production, invoicing
- `src/lib/seed.ts` fictional demo data
- `src/lib/store.ts` app state (Zustand, persisted to localStorage) and simulated integrations
- `src/app/portal/*` customer pages, `src/app/admin/*` Frænd admin pages
