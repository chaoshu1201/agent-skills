---
name: academic-trip-planner
description: >-
  Comprehensive academic trip & conference travel planning, flight & accommodation inspection,
  professional membership renewal trade-off analysis, visa & transfer research, and interactive HTML budget web application generator.
---

# Academic Trip Planner

An autonomous end-to-end agent skill for researching, organizing, and generating interactive budget and itinerary packages for academic conferences, research visits, and academic travel worldwide.

---

## 1. Input Collection Protocol

Before initiating web research, prompt the user to provide or confirm the following inputs:

1. **Conference / Event Website URL**: The primary website for the conference or academic event (e.g. `https://fie-conference.org/2026`).
2. **Flight Booking Source / Portal**: Preferred booking portal (e.g. Key Travel, Google Flights, Skyscanner, university/institutional travel system) or home airport preference (e.g. London airports LGW/LHR/LTN).
3. **Professional Memberships**: Relevant professional organizations (e.g. IEEE, ACM, ASEE, ACM SIGs) and current membership/renewal status (e.g. expired member, full renewal rate $194 USD).
4. **Flight Preferences**: Constraints such as:
   - No early-morning departure flights (e.g. after 08:00 AM).
   - Arrival time preferences (e.g. return flights arriving before midnight).
   - Direct flights vs. connecting flights allowed.
   - Maximum flight budget cap.
5. **Accommodation Preferences**: Constraints such as:
   - Maximum distance to conference / event venue (e.g. within 2.0 km or 15 minutes walk/shuttle).
   - Preference for Host Venue vs. nearby 4-star options.
   - Room occupancy (single occupancy vs shared rooming).
6. **Strict Verification Directive**:
   - **Zero Guessing**: Every schedule, flight number, nightly hotel rate, registration tier, exchange rate, and visa fee MUST be empirically verified from authoritative web pages.
   - **Pause & Clarify**: If any requirement or website data is ambiguous or unavailable, pause execution and ask the user for clarification immediately.

---

## 2. Execution Workflow

### Step 1: Conference / Event Website Research & Inspection
Use browser navigation / web search to inspect the official conference website across all relevant tabs, menus, and subpages:
- **Venue & Location**: Extract full physical address, distance to airport, and key venue facilities.
- **Key Dates**: Extract abstract submission, paper acceptance, early bird registration deadline, and main event dates.
- **Registration Rates**: Extract full fee matrix (Member vs. Non-Member, Student, Early Bird vs. Standard/Late), confirming whether rates cover paper publication and social events (e.g. Gala Banquet).
- **Official Hotels**: Extract conference partner hotel list, nightly room rates (in EUR/USD/GBP), room types, inclusions (breakfast, V.A.T., Wi-Fi), and distance to venue. Apply the user's distance filter strictly to discard distant options.

### Step 2: Flight Option Inspection & Schedule Filtering
Search the flight portal / web sources according to the user's origin, destination, and travel dates:
- Inspect outbound flights on Day 1 (Arrival) and return flights on Day 4 (3-night option) / Day 5 (4-night option).
- Filter out flights violating user preferences (e.g. early morning departures, late night arrivals after midnight).
- Extract exact flight numbers, operating airlines, outbound/return departure/arrival times, airport codes, and total round-trip fares.

### Step 3: Professional Membership Trade-off Analysis
Calculate the exact net out-of-pocket trade-off for renewing a professional membership:
$$\text{Option A (Non-Member)} = \text{Non-Member Registration Rate}$$
$$\text{Option B (Renew Membership)} = \text{Member Registration Rate} + \text{Annual Membership Renewal Dues}$$
$$\text{Net Difference} = \text{Option B} - \text{Option A}$$

- Highlight the net difference in local currency.
- Summarize additional membership privileges gained (e.g. IEEE Xplore / ACM Digital Library access, monthly magazines, member discounts for future events).

### Step 4: Airport Transfers & Visa Fee Research
- **Airport Transfers**: Calculate distance and travel time from airport to venue. Detail transfer options and prices:
  1. Private Taxi / Airport Taxi Stand
  2. Official Shared Conference Shuttle (via registration portal)
  3. Public Express Bus / Regional Transit
- **Visa Requirements**: Research short-stay visa requirements for the destination country based on nationality:
  - Consular application fee
  - VFS / TLS service provider appointment fee
  - Invitation letter issuance details upon registration

---

## 3. Output Artifacts Generation

### Master Markdown Guide (`conference_itinerary_and_budget.md` / `academic_trip_itinerary_and_budget.md`)
Generate a comprehensive markdown document containing:
1. Executive Summary Table with merged flight schedule column (`Flight No. & Schedule`).
2. Accommodation Options Table with Nightly Rate and Total 3-Night / 4-Night Costs.
3. Verified Flight Options Table with flight numbers and schedules.
4. Detailed Airport Transfer & Transport Breakdown.
5. Registration Rate Schedule & Membership Renewal Math.
6. Visa Application Fee Breakdown & Checklist.
7. Detailed Daily Conference Itinerary.

### Interactive HTML Web Application (`index.html`)
Generate a single-file interactive web application adhering to modern web design standards:
- **Design System**: Dark glassmorphism interface, CSS custom properties (`--bg-primary: #0b0f19`, `--accent-blue: #38bdf8`, `--accent-dark-blue: #0284c7`), Google Fonts (*Outfit* and *Inter*).
- **Layout Architecture**: 2-Column Split Grid with a wider calculator pane (`1.15fr` main content & tabs on the left, `1fr` sticky live receipt-style budget calculation pane on the right).
- **Text-Only Category Tabs (No Emojis)**: Category tab buttons MUST be clean text-only (`Summary`, `Transfers`, `Visa Fee`, `Registration`, `Flights`, `Hotels`, `Itinerary`) without emojis to save space and widen the receipt pane.
- **Metric Summary Bar**: Top row displaying key highlights (`Dates`, `Host Hotel / Night`, `Member Early Rate`, `Visa Allowance`).
- **Sticky Receipt-Style Live Budget Calculator**:
  - Right-hand side sticky card (`aside.receipt-card`).
  - **All Controls Use Select Dropdowns**: Flight options, Hotel choices, Registration & Membership options, Transfers, and Visa fee MUST use `<select>` dropdown options (NO numeric text inputs).
  - High-contrast large total price (`#totalGbp`) and currency equivalent (`#totalEur`).
  - Itemized receipt breakdown list (`.receipt-breakdown`) showing `Flight`, `Hotel`, `Registration`, `Renewal Dues`, `Transfers`, and `Visa`.
  - Dynamic JavaScript recalculation on dropdown selection change.
- **Card-Style Information Blocks & TOP CHOICE Badges**:
  - Category sections (Flights, Hotels, Registration, Transfers, Visa) use `.cards-grid` with `.item-card` components.
  - Featured recommended choices MUST include the `.item-card.featured::after` ribbon displaying **`"TOP CHOICE"`** at top right.
- **Table Recommendation Rows**: Highlighting top recommendations in summary and detail tables using `tr.recommended` / `tr.highlight-row`.

---

## 4. Common Pitfalls & Guidelines

- ❌ **Do NOT infer missing prices or schedules**: Always fetch exact numbers from official sites.
- ❌ **Do NOT use plain/unformatted default tables**: Use clean CSS with hover effects, badges, and highlighted recommended rows.
- ❌ **Do NOT omit currency conversions**: Always state prices in local transaction currency (e.g. EUR/USD) alongside the converted user currency (e.g. GBP) using live exchange rates.
