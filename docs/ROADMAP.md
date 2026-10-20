# Roadmap: from demo to v1

Status: 20 October 2026. The demo prototype covers every requirement tagged **Demo** in the BRD. It runs in the browser only, with mock data and simulated integrations. This roadmap lists what is still needed, in order.

Sizes are relative effort, for planning only: **S** about 1 to 3 days, **M** about 1 to 2 weeks, **L** about 3 weeks or more. They are not a quote.

---

## Phase 0: Before and at the client meeting

Goal: show the demo, agree on scope, and collect what we need to price v1.

**Decisions needed from Frænd**

| # | Decision | Why it matters |
|---|---|---|
| Q1 | Company orders total counts, or each employee chooses their own dish? | Biggest scope driver. The demo assumes company totals. |
| Q10 | Custom platform, or a configured standard solution if it fits? | Decides approach, price and timeline. |
| Q12 | Extend, replace, or run beside the existing Cateringportal (app.fraend.no)? | Affects login, menus, data and scope. |
| Q4 | Invoice only, or card payment for small customers? | Adds a payment integration if yes. |
| Q3, Q5 | Minimum order, delivery areas and any delivery fee | Business rules and pricing. |
| Q9, Q11 | Today's daily volume, 12 month target, launch date | Sizing and phasing. |

**Inputs needed from Frænd**

- Tripletex: confirm the subscription includes API access, and who can create the API tokens.
- Brand: real font files, food photos per dish (or a shoot), and approval of the demo look.
- Commercial basics: standard price per portion, VAT treatment (the demo assumes 15%), invoice terms.
- Website: who manages the Wix site, and agreement on a subdomain such as bestill.fraend.no.

**Our side**

- Present the demo using the script in the README (Norwegian toggle on).
- Proposal and commercials for v1, with phase 2 as optional items.

---

## Phase 1: v1 production release

Goal: a live, secure system Frænd can run daily, with real data and Tripletex.

### 1. Foundation (L)
- Backend and database (EU-hosted, for GDPR). Move all logic from the browser to the server, including deadline enforcement so a locked order can never be changed by a customer.
- Accounts and login: email and password, password reset, invited company users (FR-03, FR-05).
- Roles: Frænd admin, kitchen, driver, company admin, company user. Admin is currently open in the demo.
- Audit log of order changes (who changed what, and when). Useful for disputes about deadlines.
- Hosting, backups, monitoring, error alerts.

### 2. Ordering rules (M)
- Server-side change deadline, with Frænd override (FR-40 to FR-43).
- Holidays and closure days managed by Frænd, with notice to standing order customers (FR-34).
- Delivery per address: the demo always delivers to the first address. v1 lets a company pick the address per order day (FR-06).
- Minimum order and delivery fee rules, once decided (Q3, Q5).
- Registration approval before the first order (FR-07).

### 3. Notifications (S)
- Emails for registration, order confirmation, order change, and invoice sent (FR-24).
- Optional reminder before the deadline ("Your order for tomorrow locks at 12:00").

### 4. Tripletex integration (L)
- Create and update customers in Tripletex (FR-80).
- Create invoices and send them by PDF or EHF through Tripletex (FR-81, FR-72).
- Sync payments and the customer ledger back (FR-82).
- Export data for revenue, invoicing and customer overview (FR-83).
- Sync status and error handling visible to Frænd (FR-84). Start with the Tripletex test environment.

### 5. Operations tools (M)
- PDF export and print layouts for production, packing and delivery lists (FR-53).
- Driver view of the delivery list on a phone, grouped by area (FR-61, FR-62).
- Excel export of reports in addition to CSV (FR-114).
- Menu photo upload and scheduled menu publishing (FR-13).

### 6. Company lookup and validation (S)
- Real Brønnøysund register lookup on registration (FR-02).
- Postcode check against delivery areas (FR-94).

### 7. Launch readiness (M)
- Norwegian copy review by Frænd. The demo translation is ours, not proofread.
- GDPR: privacy policy, data processing agreement, cookie notice.
- Accessibility check (WCAG 2.1 AA basics) and mobile testing on real devices.
- Link from fraend.no and the subdomain set up.
- Pilot with 2 or 3 existing customers before opening registration.

---

## Phase 2: After launch

| Feature | BRD ref | Notes |
|---|---|---|
| Single sign-on with Microsoft 365 and Google Workspace | FR-04 | Easy win for larger customers. |
| Campaigns (discount codes, intro prices, featured dishes) | FR-92 | Needs a definition from Frænd (Q7). |
| Customer profitability reports | FR-113 | Needs cost per portion and delivery cost (Q8). |
| Copy last week's menu, menu templates | FR-14 | Saves admin time. |
| Individual employee meal choice | Q1 | Only if Frænd wants it. Large change to ordering. |
| Card payment for small or one-off customers | Q4 | Adds a payment provider. |
| Shared login or merge with the Cateringportal | Q12 | Depends on the Phase 0 decision. |
| Route planning for drivers | Out of scope today | Only if volume grows a lot. |

---

## Known demo limitations

These are fine for a demo, but each needs fixing in v1 (covered above):

- Data is stored in each viewer's browser. Nothing is shared between people, and "Reset data" restores the start state.
- Login accepts any password, and the admin area has no login.
- Tripletex, email, EHF and the company register lookup are simulated.
- Deliveries always go to the company's first address.
- The VAT rate (15%) and standard price (149 kr) are placeholders.
- Fonts are stand-ins (Jost, Sacramento) and dish photos are samples.
- Times follow the viewer's browser time zone, not Norway's.
