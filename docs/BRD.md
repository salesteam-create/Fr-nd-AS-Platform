# Business Requirements Document
## Frænd Digital Corporate Lunch Platform

| | |
|---|---|
| Client | Frænd AS (Stavanger, Norway) |
| Prepared by | Kilowott |
| Version | 0.1 (draft for internal review) |
| Date | 20 October 2026 |
| Source | Client requirements specification "Kravspesifikasjon Frænd Digital Bedriftslunsj" (October 2026) |

---

## 1. Purpose of this document

This document translates Frænd's requirements specification into a structured set of business requirements. It serves three purposes:

1. Align the Kilowott team on what Frænd needs and why.
2. Define the scope of the **demo prototype** we will build first.
3. Capture open questions and assumptions to resolve with Frænd before the proposal and v1 build.

Each requirement is tagged with a phase:

- **Demo**: included in the clickable prototype (front-end with mock data).
- **v1**: required for the first production release.
- **Later**: valuable, but can follow after launch.

---

## 2. Background

Frænd is a social enterprise in the Stavanger region that produces and delivers lunch. It wants to grow its corporate (B2B) lunch business and needs a digital solution for selling and managing lunch deliveries to companies.

Today, orders, production planning, delivery and invoicing are handled with significant manual effort. Frænd wants one system that gives corporate customers a simple, professional ordering experience and gives Frænd full control of ordering, production, delivery and invoicing.

The client has pointed to Foodfe (foodfe.app) as an example of the type of product they have in mind.

## 3. Business objectives

| ID | Objective | How we will know |
|---|---|---|
| BO-1 | Reduce administration for Frænd and for customers | Orders, lists and invoices are generated without manual re-entry |
| BO-2 | Minimise food waste | Production quantities come from locked orders, not estimates |
| BO-3 | Make ordering quick and easy for companies | A customer can place a weekly order in 1 to 2 minutes without training |
| BO-4 | Automate invoicing | Invoices are created in Tripletex and sent as PDF or EHF automatically |
| BO-5 | Scale with the business | Handles growth to several hundred daily lunches without rebuilding |

## 4. Scope

### In scope

- Customer-facing ordering portal, embedded in or linked from fraend.no (web, responsive; no native app)
- Company registration and user accounts
- Weekly menu publishing
- One-off and recurring (standing) orders with special diets
- Order change deadlines and locking
- Production, packing and delivery lists
- Invoicing schedules (weekly, monthly, by agreement), PDF and EHF
- Tripletex integration (customers, invoices, customer ledger, reporting data)
- Admin panel, dashboard and reports with export

### Out of scope (unless agreed otherwise)

- Native mobile apps (explicitly not wanted by the client)
- Individual employee meal choice (see open question Q1)
- Online card payment (see Q4)
- Route optimisation or driver apps
- Inventory, recipe costing and purchasing
- Redesign of the existing fraend.no website

## 5. Users and roles

| Role | Who | Main goals |
|---|---|---|
| Company admin | Office manager or contact person at a customer company | Register the company, place and adjust orders, manage addresses, view history and invoices |
| Company user | Additional users at the same company (optional) | Place or adjust orders on behalf of the company |
| Frænd admin | Frænd management | Manage customers, prices, menus, campaigns and delivery areas; view dashboard and reports |
| Frænd kitchen | Production staff | See what to cook and pack each day |
| Frænd driver / logistics | Delivery staff | See where to deliver, how much and to whom |

Customer segments named by the client: shared office spaces, commercial buildings, public sector organisations, private companies and industrial companies.

---

## 6. Functional requirements

### 6.1 Registration and login

| ID | Requirement | Phase |
|---|---|---|
| FR-01 | A company can self-register with: company name, organisation number, contact person, email, phone, delivery address, billing address and optional EHF details | Demo |
| FR-02 | Organisation number is validated (format, and lookup in the Brønnøysund register to prefill name and address) | v1 |
| FR-03 | Users log in with email and password | Demo |
| FR-04 | Users can alternatively log in with Microsoft 365 or Google Workspace | Later |
| FR-05 | A company admin can invite additional users from the same company | v1 |
| FR-06 | A company can manage several delivery addresses (for example, two office locations) | v1 |
| FR-07 | New registrations can be approved by Frænd before the first order (to check delivery area and credit) | v1 |

### 6.2 Weekly menu

| ID | Requirement | Phase |
|---|---|---|
| FR-10 | Frænd can publish a weekly menu with a main dish and a vegetarian option for each weekday | Demo |
| FR-11 | Each dish has a name, description, photo, allergens and labels (vegetarian, vegan, halal, gluten-free, lactose-free) | Demo |
| FR-12 | Allergens follow the 14 allergens defined in Norwegian food labelling rules | v1 |
| FR-13 | Menus can be prepared in advance and published at a set time | v1 |
| FR-14 | Frænd can copy a previous week's menu as a starting point | Later |

### 6.3 Ordering

| ID | Requirement | Phase |
|---|---|---|
| FR-20 | A company can pick delivery days for a given week and enter the number of portions per day | Demo |
| FR-21 | For each day, the company can specify how many portions are special diets: vegetarian, vegan, gluten-free, lactose-free, halal, and other (free text) | Demo |
| FR-22 | The company can add a comment per delivery (for example, "deliver to reception, 2nd floor") | Demo |
| FR-23 | The order summary shows total portions and estimated price before confirming | Demo |
| FR-24 | The company receives an email confirmation for every new order and every change | v1 |
| FR-25 | Ordering a full week takes no more than 1 to 2 minutes for a returning customer | Demo |

### 6.4 Standing (recurring) orders

| ID | Requirement | Phase |
|---|---|---|
| FR-30 | A company can set up a standing order with fixed portions per weekday (for example, 20 every day, Monday to Friday) | Demo |
| FR-31 | The standing order repeats automatically every week | Demo |
| FR-32 | The company can change the quantities for a single day or week without changing the standing order | Demo |
| FR-33 | The company can change, pause or cancel the standing order going forward | Demo |
| FR-34 | Public holidays and Frænd closure days are skipped automatically, with notice to the customer | v1 |

### 6.5 Change deadline and locking

| ID | Requirement | Phase |
|---|---|---|
| FR-40 | Orders can be changed until a deadline, by default 12:00 the day before delivery | Demo |
| FR-41 | After the deadline, the order for that day is locked and cannot be changed by the customer | Demo |
| FR-42 | The deadline is clearly shown on every order screen, with a countdown when it is close | Demo |
| FR-43 | Frænd admin can change the deadline rule globally and override a locked order when needed | v1 |

### 6.6 Production management

| ID | Requirement | Phase |
|---|---|---|
| FR-50 | Frænd sees a daily production list with portions per dish and per special diet (for example, chicken stew 110, vegetarian stew 18, gluten-free 8) | Demo |
| FR-51 | The production list updates automatically as orders change, and is final once the deadline passes | Demo |
| FR-52 | Frænd sees a packing list with portions per company (for example, Company A: 20, Company B: 17) | Demo |
| FR-53 | Lists can be printed and exported as PDF | v1 |

### 6.7 Delivery management

| ID | Requirement | Phase |
|---|---|---|
| FR-60 | The system generates a daily delivery list showing company name, contact person, delivery address, phone, number of portions, special diets and comments | Demo |
| FR-61 | The delivery list can be sorted or grouped by delivery area | v1 |
| FR-62 | The delivery list is usable on a phone (for the driver) | v1 |

### 6.8 Invoicing

| ID | Requirement | Phase |
|---|---|---|
| FR-70 | Each customer has an invoicing frequency: weekly, monthly or by agreement | Demo |
| FR-71 | Invoices are based on delivered (locked) orders for the period | Demo |
| FR-72 | Invoices can be sent as PDF (email) or EHF (electronic invoice via the Peppol network) | v1 |
| FR-73 | The customer can see invoice history in the portal | Demo |

### 6.9 Tripletex integration

| ID | Requirement | Phase |
|---|---|---|
| FR-80 | New customers are created automatically in Tripletex | v1 (simulated in Demo) |
| FR-81 | Invoices are created automatically in Tripletex and sent through the customer's chosen channel (PDF or EHF) | v1 (simulated in Demo) |
| FR-82 | Customer ledger data (invoice status, payments) is synchronised back to the platform | v1 |
| FR-83 | Data for revenue, invoicing and customer overview can be exported to Tripletex | v1 |
| FR-84 | Sync status and errors are visible to Frænd admin | v1 (simulated in Demo) |

### 6.10 Administration

| ID | Requirement | Phase |
|---|---|---|
| FR-90 | Frænd can create, edit and deactivate customers | Demo |
| FR-91 | Frænd can set prices: a standard price per portion, and customer-specific prices | Demo |
| FR-92 | Frænd can create campaigns (definition to be confirmed, see Q7) | Later |
| FR-93 | Frænd can manage menus | Demo |
| FR-94 | Frænd can define delivery areas (for example, by postcode) and limit registration to those areas | v1 |
| FR-95 | Frænd can view and edit all orders | Demo |
| FR-96 | Frænd can view and manage standing-order customers | Demo |

### 6.11 Dashboard

| ID | Requirement | Phase |
|---|---|---|
| FR-100 | Tomorrow: number of lunches, number of customers, production needs | Demo |
| FR-101 | Next week: total lunches ordered, revenue forecast | Demo |
| FR-102 | Key figures: revenue, active customers, average order value, best-selling dishes | Demo |

### 6.12 Reports

| ID | Requirement | Phase |
|---|---|---|
| FR-110 | Revenue per customer and per month | Demo |
| FR-111 | Number of lunches delivered | Demo |
| FR-112 | Production and delivery overviews | Demo |
| FR-113 | Customer profitability (requires cost data, see Q8) | Later |
| FR-114 | Export to Excel, CSV and PDF | v1 (CSV in Demo) |

---

## 7. Key business rules

| ID | Rule |
|---|---|
| BR-1 | The default change deadline is 12:00 on the working day before delivery. Monday deliveries lock at 12:00 on Friday (assumption, to be confirmed). |
| BR-2 | A standing order generates a weekly order automatically. Changes to a single week override the standing order for that week only. |
| BR-3 | Special diet portions are part of the total, not added on top. Example: 20 portions, of which 3 vegetarian and 1 gluten-free. |
| BR-4 | Production, packing and delivery lists for a day are final once that day's deadline has passed. |
| BR-5 | Only delivered (locked) orders are invoiced. Price is the customer-specific price if set, otherwise the standard price. |
| BR-6 | Customers can only register delivery addresses inside Frænd's delivery areas. |
| BR-7 | Prices are shown excluding VAT in the portal for business customers, with VAT shown on the summary and invoice. |

## 8. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-1 | Usability: easy to understand without training; a returning customer orders a week in 1 to 2 minutes. |
| NFR-2 | Responsive: works well on mobile, tablet and desktop. |
| NFR-3 | Branding: modern design that matches Frænd's brand, and feels like part of fraend.no. |
| NFR-4 | Scalability: supports growth from today's volume to several hundred daily lunches without rebuilding. |
| NFR-5 | Privacy: GDPR compliant, with personal data stored in the EU/EEA. |
| NFR-6 | Security: encrypted connections, hashed passwords, role-based access. |
| NFR-7 | Availability: the ordering portal is reliable around the daily deadline (the busiest time). |
| NFR-8 | Language: Norwegian (bokmål) for the production release. The demo is in English. |
| NFR-9 | Cost: the client prefers a cost-effective solution based on existing technology over extensive custom development. |

## 9. Integrations

| System | Purpose | Notes |
|---|---|---|
| fraend.no | Entry point for customers | The site runs on Wix, which limits deep embedding. Recommended: a branded subdomain (for example, bestill.fraend.no) linked from the site. |
| app.fraend.no (Cateringportal) | Existing catering ordering portal | Frænd already runs a catering portal for its departments. We need to decide whether corporate lunch extends it, replaces it, or runs beside it (Q12). |
| Tripletex | Customers, invoices, ledger, reporting | Tripletex has a REST API. Requires an API consumer token and an employee token from Frænd. |
| EHF / Peppol | Electronic invoices | Normally sent through Tripletex, so no separate integration is expected. |
| Brønnøysund register | Look up company details by organisation number | Free public API. |
| Email service | Order confirmations and notifications | Standard transactional email provider. |
| Microsoft / Google | Optional single sign-on | Later phase. |

---

## 10. Demo prototype scope

The demo is a working front-end with realistic mock data. Its goal is to let Frænd see and click through the full flow before committing to the build. It does not store real data and does not connect to Tripletex.

**Customer side**

1. Landing page in Frænd style, with a call to action to register or log in
2. Company registration form (FR-01)
3. This week's and next week's menu with dish details and allergens (FR-10, FR-11)
4. Weekly order: days, portions, special diets, comments, price summary (FR-20 to FR-23)
5. Standing order setup and one-week override (FR-30 to FR-33)
6. Deadline display and locked days (FR-40 to FR-42)
7. Order and invoice history (FR-73)

**Frænd admin side**

1. Dashboard: tomorrow, next week, key figures (FR-100 to FR-102)
2. Production list and packing list (FR-50 to FR-52)
3. Delivery list (FR-60)
4. Menu management (FR-93)
5. Customers and prices (FR-90, FR-91, FR-96)
6. Orders overview (FR-95)
7. Invoicing view with a simulated "Send to Tripletex" action and sync status (FR-70, FR-71, FR-80, FR-81, FR-84)
8. Reports with CSV export (FR-110 to FR-112)

**Demo flow to show the client.** A customer changes Tuesday from 20 to 25 portions before the deadline. The production list, packing list, delivery list and dashboard update immediately. After the deadline, the day is locked. At month end, the invoice is generated and "sent" to Tripletex.

**Proposed demo stack:** Next.js, TypeScript and Tailwind CSS, with seeded mock data in the browser. Deployed to a shareable link.

---

## 11. Assumptions

| ID | Assumption |
|---|---|
| A-1 | The company admin orders total portions per day for the company. Employees do not choose individually. |
| A-2 | There is one main dish and one vegetarian option per day. Special diets (vegan, gluten-free, lactose-free, halal) are prepared as variants. |
| A-3 | Payment is by invoice only. No card payments. |
| A-4 | Deliveries are on weekdays only (Monday to Friday). |
| A-5 | Pricing is per portion, with optional customer-specific agreements. |
| A-6 | Frænd has an active Tripletex subscription that includes API access. |
| A-7 | The demo uses the Frænd design system (logo, colours, photos). Fonts are stand-ins (Jost, Sacramento) until Frænd supplies the real ones, and dish photos are samples. |

## 12. Open questions for Frænd

| ID | Question | Why it matters |
|---|---|---|
| Q1 | Does the company order total counts, or should each employee choose their own dish? | Biggest single driver of scope and UX |
| Q2 | Who manages the Wix site (fraend.no), and can we add a link or subdomain? | Decides how customers reach the platform. Platform confirmed as Wix from the design system. |
| Q3 | Is there a minimum order (portions per day or per delivery)? | Business rule and validation |
| Q4 | Invoice only, or also card payment for smaller customers? | Payment integration scope |
| Q5 | Which areas do you deliver to, and is there a delivery fee? | Delivery areas and pricing |
| Q6 | Does the customer choose between the main dish and vegetarian option, or is the split decided by Frænd? | Order form design and production list |
| Q7 | What does "campaigns" mean: discount codes, introductory prices, or promoted dishes? | Admin feature scope |
| Q8 | For customer profitability reports, will you provide cost per portion? | Report feasibility |
| Q9 | What is today's daily volume, and what is the target in 12 months? | Sizing and hosting |
| Q10 | Is a fully custom platform preferred, or would a configured standard solution be acceptable if it meets the requirements? | The spec asks for both; this decides approach, price and timeline |
| Q11 | What is the target launch date? | Phasing and resourcing |
| Q12 | How should corporate lunch relate to the existing Cateringportal (app.fraend.no): extend it, replace it, or run beside it? | Affects scope, login, menus and data migration |

## 13. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Scope grows beyond v1 (individual choice, SSO, campaigns, profitability) | Higher cost and later launch | Clear v1 / Later phasing agreed up front |
| Tripletex API access or setup delays | Invoicing cannot go live | Request API access early; build invoicing to work standalone first |
| Unknown website platform limits embedding | Poor integration with fraend.no | Default to a branded subdomain linked from the site |
| Client expectation of speed and low price versus a custom build | Mismatch in proposal | Present a lean v1 with the demo as proof, and clear phasing |

---

## 14. Next steps

1. Internal review of this BRD (Kilowott).
2. Build the demo prototype (section 10).
3. Send open questions (section 12) to Frænd, ideally alongside the demo.
4. Prepare proposal, timeline and commercials based on the answers.
