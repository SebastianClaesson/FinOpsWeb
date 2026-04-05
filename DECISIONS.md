# DECISIONS.md — Technical Choices & Justification

Every significant technical decision for this project is documented here, including what was chosen, what alternatives were considered, and why.

---

## 1. Framework: Next.js 16 (App Router)

**Chosen:** Next.js 16 with App Router
**Alternatives considered:**
- **Vite + React** — Lighter, faster dev server, but no built-in SSR, API routes, or file-based routing. We'd need to add a separate backend later for API proxy/auth.
- **Remix** — Good full-stack framework, but smaller ecosystem and fewer UI component libraries are optimized for it.
- **Astro** — Excellent for static content, but less suited for highly interactive dashboards with client-side filtering.
- **SvelteKit** — Great performance, but smaller ecosystem for enterprise charting/UI components and less familiar to most contributors.

**Why Next.js:**
- **API routes** — Critical for Phase 3 (Azure Billing APIs). Next.js Route Handlers let us proxy API calls server-side, keeping secrets off the client.
- **File-based routing** — Each report page maps naturally to a route (`/reports/cost-summary/subscriptions`).
- **MSAL integration** — `@azure/msal-react` has first-class Next.js examples and middleware support.
- **SSR/SSG flexibility** — Can pre-render static report shells and hydrate with data client-side.
- **Ecosystem** — Largest React framework ecosystem; shadcn/ui, Recharts, and most component libraries are built for Next.js.

**Risk:** Next.js is opinionated and heavy for what's currently a client-side-only app. If we never need SSR or API routes, Vite would have been simpler. This bet is on the roadmap (API integration, auth).

---

## 2. Language: TypeScript (strict)

**Chosen:** TypeScript
**Alternatives considered:**
- **JavaScript** — Less friction for beginners, but no type safety for the FOCUS schema (40+ columns).

**Why TypeScript:**
- The FOCUS schema has 40+ columns with specific types. TypeScript catches mistyped column names at compile time.
- Auto-completion in VS Code for record fields is essential for productivity.
- All dependencies (Next.js, shadcn/ui, Recharts) ship with TypeScript types.

**Tradeoff:** Slightly higher learning curve for contributors unfamiliar with TypeScript. We mitigate this by keeping types simple (interfaces, not advanced generics).

---

## 3. Styling: Tailwind CSS v4

**Chosen:** Tailwind CSS v4
**Alternatives considered:**
- **CSS Modules** — Good encapsulation, but verbose for responsive utilities and no design system.
- **Styled Components / Emotion** — CSS-in-JS adds runtime overhead and complicates SSR.
- **Vanilla CSS** — Maximum flexibility, but slower to build responsive layouts.
- **Tailwind CSS v3** — Stable, but v4 is the default for new Next.js projects and has better performance.

**Why Tailwind v4:**
- **Responsive design** — Mobile-first utilities (`sm:`, `md:`, `lg:`) make responsive layouts trivial.
- **shadcn/ui compatibility** — shadcn/ui is built on Tailwind.
- **v4 is the new default** — Next.js 16 scaffolds with Tailwind v4. Using v3 would require fighting the defaults.
- **Performance** — v4 uses native CSS features (cascade layers, `@theme`) and produces smaller output.

**Risk:** Tailwind v4 is newer, and some blog posts/tutorials still reference v3 syntax. We use the official shadcn/ui setup which handles v4 correctly.

---

## 4. UI Components: shadcn/ui

**Chosen:** shadcn/ui
**Alternatives considered:**
- **Material UI (MUI)** — Full component library, but opinionated styling that's hard to customize and adds significant bundle weight.
- **Ant Design** — Comprehensive, but heavily styled with a Chinese enterprise aesthetic that's difficult to theme.
- **Radix UI (raw)** — Unstyled primitives, great accessibility, but requires building all visual design from scratch.
- **Headless UI** — Similar to Radix but Tailwind-oriented; fewer components available.

**Why shadcn/ui:**
- **Copy-paste model** — Components live in our codebase, not in `node_modules`. We own the code and can modify anything.
- **Built on Radix** — Inherits accessibility (keyboard nav, ARIA, screen reader support) from Radix UI primitives.
- **Tailwind-native** — All styling via Tailwind classes; no CSS-in-JS runtime.
- **Chart components** — shadcn/ui includes a `chart` component that wraps Recharts with consistent theming (CSS variables for colors).
- **Active maintenance** — v4 was released recently with Tailwind v4 support.

**Tradeoff:** Not a "batteries included" library. We assemble pages from primitives rather than using pre-built dashboard templates. This is intentional — the Power BI report layout is custom, so we need flexibility.

---

## 5. Charts: Recharts (via shadcn/ui chart components)

**Chosen:** Recharts (2.x)
**Alternatives considered:**
- **Chart.js (react-chartjs-2)** — Popular, lightweight, but imperative API feels less React-native.
- **Nivo** — Beautiful charts, but heavy and opinionated styling.
- **Apache ECharts** — Most powerful option for complex financial charts, but large bundle and steep learning curve.
- **Tremor** — Dashboard-focused, but has merged into shadcn/ui's chart approach.
- **Victory** — Good React charts, but less active maintenance.
- **D3 (raw)** — Maximum control, but requires building every chart from scratch.

**Why Recharts:**
- **React-native** — Declarative JSX API matches our component model.
- **shadcn/ui integration** — The `ChartContainer`, `ChartTooltip`, and `ChartLegend` wrappers in shadcn/ui are built on Recharts. Using anything else would mean discarding these.
- **Good chart types** — BarChart, LineChart, AreaChart, PieChart, Treemap — all needed for Cost Summary.
- **Reasonable bundle size** — ~40KB gzipped for the charts we use.
- **Responsive** — `ResponsiveContainer` handles resizing automatically.

**Risk:** Recharts performance degrades with very large datasets (>10K points per chart). For our use case (aggregated data, not raw records), this is fine. If we hit performance issues, we can switch individual charts to ECharts without changing the overall architecture.

---

## 6. Date Handling: date-fns

**Chosen:** date-fns
**Alternatives considered:**
- **dayjs** — Lightweight, moment-like API. Slightly smaller, but less tree-shakeable.
- **Luxon** — Rich API, good timezone support, but heavier.
- **Temporal API (native)** — Not yet shipped in all runtimes (Node 20 / latest browsers only).
- **Native Date** — No library needed, but formatting/parsing is verbose.

**Why date-fns:**
- **Tree-shakeable** — Import only the functions you use.
- **Immutable** — Returns new Date objects, avoiding mutation bugs.
- **Standard Date objects** — Works with native Date, unlike dayjs/Luxon which wrap in custom objects.

**Note:** Currently using mostly native `Intl.DateTimeFormat` for display formatting (in `format.ts`). date-fns is available for more complex date math if needed.

---

## 7. Data Storage (Phase 1): Generated In-Memory Dummy Data

**Chosen:** TypeScript module that generates data deterministically at runtime
**Alternatives considered:**
- **Static JSON files** — Simpler, but 6 months × 30 resources × daily = ~5400 records of JSON would be a large committed file.
- **CSV files with a parser** — More realistic (matches Azure exports), but requires adding a CSV parser dependency for Phase 1.
- **SQLite / Dexie (IndexedDB)** — Overkill for dummy data.

**Why generated data:**
- **Deterministic** — Same data every time, using seeded randomness. No test flakiness.
- **Realistic patterns** — Weekend dips for dev resources, slight upward cost trend, variance per resource, commitment discounts.
- **Easy to modify** — Change a resource definition and the entire dataset adjusts.
- **No large files in git** — The generator is ~300 lines of TypeScript.

**Future:** Phase 2 will replace this with real CSV parsing (Azure exports). Phase 3 will add API calls. The data layer (`cost-data.ts`) is designed to be swapped.

---

## 8. State Management: React Context

**Chosen:** React Context for shared filter state
**Alternatives considered:**
- **Zustand** — Minimal, fast, great DX. Would be the choice if state complexity grows.
- **Jotai** — Atomic state model, good for fine-grained reactivity.
- **Redux Toolkit** — Overkill for our use case (one filter object shared across pages).
- **URL search params** — Good for shareable links, but complex for multi-select filters.

**Why Context:**
- **Zero dependencies** — Built into React.
- **Simple use case** — One filter state object shared across report pages via a layout.
- **Sufficient** — With `useMemo` for derived data, there are no performance issues at our data scale.

**When to upgrade:** If we add multiple independent reports, user preferences, or real-time data, Zustand would be a better fit.

---

## 9. Routing: File-Based (Next.js App Router)

**Chosen:** Each report tab is a separate route (`/reports/cost-summary/subscriptions`)
**Alternatives considered:**
- **Client-side tabs** — All tabs in one page, switched with React state. Faster navigation, but URL doesn't reflect the current tab.
- **Hash routing** — `#subscriptions` suffix. Doesn't trigger server navigation, but less clean.

**Why file-based routes:**
- **Deep linkable** — Users can bookmark or share a specific report tab.
- **Browser back/forward** — Works as expected.
- **Code splitting** — Each page loads only its own code (automatic with Next.js).
- **Shared layout** — The filter bar and header are in a layout that persists across tab navigation.

---

## 10. Export: Client-Side CSV/JSON/HTML

**Chosen:** Client-side file generation and download
**Alternatives considered:**
- **Server-side export** — Generate files on the server. More control, but requires API routes and adds complexity.
- **xlsx library** — For native Excel export. Adds ~80KB dependency.
- **Power BI export** — Complex, would require a Power BI Embedded license.

**Why client-side:**
- **No server needed** — Works with static dummy data.
- **Instant** — No round-trip to server.
- **CSV** — Universal, opens in Excel/Google Sheets.
- **JSON** — For programmatic consumption.
- **HTML** — Styled table that can be opened in a browser or imported into other tools.

**Future:** Excel (.xlsx) export could be added with the `xlsx` or `exceljs` library. Power BI .pbix export is not practical (proprietary format).

---

## 11. Authentication (Future): MSAL.js

**Chosen (planned):** `@azure/msal-browser` + `@azure/msal-react`
**Alternatives considered:**
- **NextAuth.js / Auth.js** — General-purpose auth, supports Azure AD. But MSAL gives direct access to Azure tokens for API calls.
- **Clerk** — Hosted auth service. Clean DX, but external dependency and cost.
- **Custom OAuth2** — Full control, but reimplements what MSAL already does.

**Why MSAL:**
- **Azure-native** — Built by Microsoft for Azure AD / Entra ID.
- **Token acquisition** — MSAL handles token caching, refresh, and scopes. Essential for Phase 3 (Billing API calls need `https://management.azure.com/.default` scope).
- **React hooks** — `@azure/msal-react` provides `useMsal()`, `AuthenticatedTemplate`, etc.
- **MCA support** — Works with Microsoft Customer Agreement (MCA) billing accounts.

---

## Open Questions

These decisions may need revisiting:

1. **Should we add a database?** Currently all data is in-memory. For Phase 2 (Azure exports), we may need IndexedDB (client-side) or a server-side database to handle large datasets efficiently.

2. **Should chart rendering move to server-side?** For very large reports or PDF export, server-side chart rendering (e.g., with Puppeteer or a headless chart renderer) could be valuable.

3. **Should we use URL search params for filters?** This would make filtered views shareable via URL. Adds complexity but improves UX.

4. **Cost optimization advisories** — This feature (planned) may require integration with Azure Advisor APIs or a local rules engine. The data schema supports it, but the advisory logic needs design.

5. **Generation advisories for SKUs** — Checking if a VM SKU has a newer generation requires a mapping table (e.g., Dv4 → Dv5). This could come from the FinOps Toolkit open data or a custom lookup table.

---

## 12. Data Layer: Pre-Aggregation Architecture

**Chosen:** Server-side pre-aggregation during CSV streaming parse

**Problem:** Real Azure Cost Management FOCUS CSV exports are 200 MB–1 GB+. Loading all raw records into memory (server-side parsing + JSON API response + browser memory) exhausts RAM and freezes the UI.

**Solution:** The CSV streaming parser aggregates records on-the-fly into a compact "fact table" (~20K–50K rows with 15 dimensions) plus small detail tables (resources, prices, purchases, usage, tags). The API returns ~5 MB instead of ~500 MB — a 50–100x reduction.

**Key files:**
- `src/lib/data/aggregate.ts` — Aggregation engine (per-record upsert into Maps)
- `src/lib/data/csv-stream-parser.ts` — `parseAndAggregate()` streams CSV without building a record array
- `src/lib/data/fact-helpers.ts` — Client-side grouping/filtering on the fact table
- `src/lib/types/aggregated.ts` — Type definitions for all pre-aggregated structures

**Trade-offs:**
- Cannot perform arbitrary ad-hoc queries on raw fields not in the fact table (e.g., ChargeDescription full-text search)
- Tag cross-filtering with dimension filters is limited — tag analysis is a standalone workflow on the Tags page
- Raw record export requires pointing users to the original CSV files

---

## 13. Production Data Backend Roadmap

The current pre-aggregation approach works for the PoC but has scaling limits — it locks into predefined groupings and requires re-aggregation when new dimensions are needed.

**Recommended production options (in order of fit):**

| Option | Cost | Best For | Why |
|---|---|---|---|
| **Azure SQL Serverless** | ~$0.50/hr active, $0 idle | Best overall | Full SQL aggregation on demand, auto-pause when unused, familiar tooling, Azure Cost Management exports can pipe directly in |
| **Azure Data Explorer (ADX/Kusto)** | Higher baseline | Large-scale analytics | Purpose-built for time-series analytics. Azure Cost Management itself uses Kusto internally. Best query performance at scale |
| **DuckDB-WASM (client-side)** | $0 (client CPU) | No backend needed | SQL queries on Parquet/CSV directly in the browser. Good for single-user scenarios but limited by client hardware |
| **Azure Cosmos DB** | Moderate | Global distribution | Better than Table Storage for queries but still not great for aggregation-heavy workloads |

**Not recommended:**
- **Azure Table Storage** — No aggregation support (no SUM, GROUP BY). Would require pre-aggregating anyway, adding infrastructure cost with no benefit over the current approach.

**Migration path:**
1. Current: Pre-aggregation in Node.js (PoC — works today, zero infra cost)
2. Next: Azure SQL Serverless — swap the API route to query SQL instead of parsing CSVs. The client-side fact-helpers and report pages stay unchanged.
3. Future: ADX/Kusto for customers with large multi-tenant datasets

---

## 14. Report Implementation Roadmap

Report pages are scaffolded with navigation and layout but many are still placeholders (`<ComingSoon>`). Below is the implementation status and priority.

### Implemented (data-driven)

| Report Group | Page | Status |
|---|---|---|
| **Cost Summary** | Summary, Services, Subscriptions, Resource Groups, Regions, Charge Breakdown, Running Total, Resources (grouped by type), Inventory, Prices, Purchases, Usage Analysis, Tag Compliance, Data Quality | Done |
| **Invoicing** | Summary, Chargeback, Invoice Recon, Services, Tags, Prices, Purchases | Done |
| **Rate Optimization** | Summary, Total Savings, Commitment Savings, Utilization, Chargeback, Purchases, Prices, Resources, Hybrid Benefit, Recommendations | Done |

### Placeholder — blocked on external APIs

**Governance** (6 pages — requires Azure Resource Graph API + MSAL auth):
- `page.tsx` (summary) — Governance overview dashboard
- `managed-disks` — Disk tier and encryption compliance
- `network-security` — NSG rules and public IP audit
- `policy-compliance` — Azure Policy compliance status
- `sql-databases` — SQL tier and security configuration
- `virtual-machines` — VM sizing, generation, and configuration audit

**Workload Optimization** (2 pages — requires Azure Advisor API + MSAL auth):
- `page.tsx` (summary) — Optimization opportunities overview
- `unattached-disks` — Orphaned/unattached disk detection

### Implementation notes
- Rate Optimization: Hybrid Benefit page approximates AHUB from commitment data; full tracking needs `x_PricingSubcategory` in the fact table. Recommendations page shows on-demand spend analysis; full recommendations need Azure Advisor API.
- Governance and Workload Optimization pages are blocked on the MSAL authentication milestone (see section 17).

---

## 15. Feature Roadmap — Planned Enhancements

### Completed

- ~~Data freshness indicator~~ — Export date range shown in cost-summary header, parsed from manifest.json
- ~~URL-shareable filter state~~ — Filters sync to URL search params via `useFilterSync` hook
- ~~Tagging compliance report~~ — New page at `/reports/cost-summary/tag-compliance` with compliance scores, configurable required tags, untagged resource drill-down
- ~~Savings plan / reservation coverage~~ — Built as the Rate Optimization > Utilization page
- ~~Anomaly detection / cost alerts~~ — Anomalies page with timeline chart + threshold slider, banner on Summary page
- ~~Amortized cost view~~ — Global toggle in filter bar, excludes Purchase charges from all reports
- ~~Showback/chargeback PDF export~~ — Print-optimized branded report on both chargeback pages
- ~~Parquet file support~~ — hyparquet parser, auto-detected alongside CSV in exports dir
- ~~MSAL / Entra ID auth foundation~~ — AuthProvider, login/logout, tenant selector, API proxy (anonymous mode until configured)

### Open — can be built with existing data

**1. Cost forecasting**
Project next month's spend based on historical trend. Linear regression or exponential smoothing on the daily fact table. Show as a dashed "forecast" line on the Summary daily trend chart and a dedicated Forecasting page with confidence intervals.

**2. Budget alerts with thresholds**
Budgets exist in the Settings page but lack threshold warnings. Add configurable alert levels (80%, 90%, 100%) that show as colored bands on budget progress bars. Surface warnings as banners on the Summary page when thresholds are crossed.

**3. Currency conversion toggle**
The FOCUS data includes `x_BillingExchangeRate` and `x_*CostInUsd` fields. Add a "View in USD" toggle that switches all cost displays to the USD-equivalent values. Useful for multi-currency environments where leadership needs a single-currency view.

**4. Saved filter presets**
Let users name and save filter combinations (e.g., "Q1 Production", "Dev Europe"). Store in localStorage. Show as a dropdown in the filter bar for quick switching. Complements the URL-shareable filters.

**5. Dashboard customization**
Let users pin, reorder, or hide KPI cards and charts on the Summary page. Store layout preferences in localStorage. Default layout stays as-is for new users.

**6. Commitment planner / what-if calculator**
"If I buy X reservation, how much would I save?" Based on historical on-demand spend by service, compute potential savings at various coverage levels (50%, 70%, 90%). Renders as an interactive chart with a coverage slider.

**7. Data retention / archival**
What happens with 12+ months of exports? Options: automatic rollup of old months into monthly summaries, configurable retention window, or archive old exports to a separate directory. Prevents unbounded cache growth.

### Open — needs additional infrastructure

**8. Multi-tenant / multi-billing-account support**
Auth foundation and tenant selector built. Still needs: billing account list API call, data partitioning per tenant (separate cache files / IndexedDB stores), tenant management UI in Settings.

**9. Scheduled report delivery**
Email or Teams webhook with a weekly cost digest. Options: Azure Functions timer trigger, Logic Apps, or GitHub Actions cron. Needs service principal for unattended access. Blocked on auth configuration.

**10. Notification / alert rules**
Anomaly detection exists but has no notification delivery. Add configurable alert rules: "notify me when daily spend exceeds X" or "when anomaly detected". Delivery via email (SendGrid / Azure Communication Services) or Teams webhook. Blocked on backend scheduler.

**11. Automated export sync**
Instead of manual azcopy, build a scheduled job (Azure Functions or Next.js cron route) that pulls new exports from Blob Storage automatically. Would eliminate the manual download step from the setup guide.

### Open — needs auth + external APIs

**12. Azure Forecast API integration**
Replace the local linear regression on the Forecasting page with Microsoft's Cost Management Forecast API (`POST /providers/Microsoft.CostManagement/forecast`). The API uses ML models trained on actual usage patterns, reservation schedules, and seasonal trends — significantly more accurate than simple regression. Architecture: use the API as primary source when authenticated, fall back to local linear regression for CSV-only / anonymous mode. Reference: https://learn.microsoft.com/en-us/rest/api/cost-management/forecast/usage

**13. 6 Governance pages** (Azure Resource Graph API)
Resource inventory, compliance state, NSG rules, VM config, SQL config, disk encryption. See section 16.

**14. 2 Workload Optimization pages** (Azure Advisor API)
Right-sizing recommendations, unattached disk detection. See section 16.

**15. Audit log**
Track who viewed what, when. Important once authentication is live. Store in a server-side log (database or append-only file). Show in a Settings > Audit page for admins.

### Operations & deployment

**16. Deployment guide**
How to deploy to Azure App Service, Azure Static Web Apps, or Vercel. Include Dockerfile, `azure-pipelines.yml` or GitHub Actions workflow, and environment variable configuration.

**17. CI/CD pipeline**
GitHub Actions workflow: lint, type-check, build on PR. Auto-deploy to staging on merge to main. Production deploy on release tag.

**18. Showback dashboard for cost center owners**
A simplified, read-only view filtered to a specific cost center's scope. Lighter than the full app — just KPI cards, monthly trend, and top resources. Could be a separate route (`/showback/:costCenter`) or a standalone mini-app.

### FinOps framework alignment

**19. FinOps maturity assessment**
Self-assessment page mapping the organization's capabilities to the FinOps Framework phases (Inform, Optimize, Operate). Interactive checklist with scoring and recommendations for next steps. Reference: https://www.finops.org/framework/

### Implementation order suggestion

**Phase A — Quick wins (no new dependencies):**
1. Cost forecasting (trend line on existing charts)
2. Budget alerts with thresholds (enhance existing budget feature)
3. Saved filter presets (localStorage, UI only)
4. Currency conversion toggle (FOCUS data has USD fields)

**Phase B — After auth configured (needs app registration):**
5. Azure Forecast API integration (replace local regression)
6. Multi-tenant billing account support
7. Governance pages (Resource Graph)
8. Workload Optimization pages (Advisor)
9. Audit log

**Phase C — Infrastructure additions:**
9. CI/CD pipeline + deployment guide
10. Automated export sync
11. Scheduled report delivery + notifications
12. Showback dashboard for cost center owners

**Phase D — Advanced features:**
13. Dashboard customization
14. Commitment planner / what-if calculator
15. Data retention / archival
16. FinOps maturity assessment

---

## 16. Azure Advisor API Integration Milestone

Several report pages are blocked or limited without Azure Advisor and Resource Graph API data. This is a prerequisite milestone that must be completed before these reports can be fully implemented.

### Reports requiring Azure Advisor API
| Report | Page | What's Missing |
|---|---|---|
| **Rate Optimization** | Recommendations | Reservation/savings plan purchase recommendations (VM, SQL, App Service sizing) |
| **Rate Optimization** | Hybrid Benefit | Full AHUB license tracking (currently approximated from commitment data) |
| **Workload Optimization** | Summary | Right-sizing, idle resource, and cost optimization recommendations |
| **Workload Optimization** | Unattached Disks | Orphaned disk detection and cleanup recommendations |

### Reports requiring Azure Resource Graph API
| Report | Page | What's Missing |
|---|---|---|
| **Governance** | All 6 pages | Resource inventory, compliance state, NSG rules, VM config, SQL config, disk encryption |

### Prerequisites
1. **MSAL / Entra ID authentication** — Required to obtain tokens for Azure API calls
2. **API proxy routes** — Next.js Route Handlers to call Azure APIs server-side (secrets stay off client)
3. **Permission model** — User must have Reader role on subscriptions or Advisor Contributor for recommendations

### Implementation approach
1. Implement MSAL auth (see CLAUDE.md Authentication section)
2. Add API proxy routes: `/api/azure/advisor`, `/api/azure/resource-graph`
3. Create a shared Azure API client with token caching and retry logic
4. Extend report context with Advisor/Resource Graph data (separate from cost data — different refresh cadence)
5. Populate the blocked report pages with real data

### Current workarounds
- **Recommendations page** shows on-demand spend analysis to help identify commitment opportunities manually
- **Hybrid Benefit page** shows commitment discount breakdown by service as a proxy
- **Governance/Workload pages** remain as `<ComingSoon>` placeholders

---

## 17. MSAL / Entra ID Authentication Milestone

Authentication is the key prerequisite that unlocks Governance pages, Workload Optimization, direct Azure API access, and role-based data access. This is the largest remaining milestone.

### Packages
- `@azure/msal-browser` — Browser-based auth flows (redirect, popup, silent)
- `@azure/msal-react` — React hooks and components (`useMsal`, `AuthenticatedTemplate`, etc.)

### Implementation phases

**Phase 1: Basic auth flow**
- Create `src/lib/config/auth.ts` with MSAL configuration (client ID, authority, redirect URI, scopes)
- App registration in Entra ID (single-tenant or multi-tenant)
- Add `MsalProvider` wrapper to the root layout
- Protected routes via layout-level auth check or Next.js middleware
- Login/logout UI in the header

**Phase 2: Token acquisition for Azure APIs**
- Acquire tokens for Azure Cost Management API (`https://management.azure.com/.default`)
- Acquire tokens for Azure Resource Graph
- Server-side API proxy routes (`/api/azure/cost-management`, `/api/azure/resource-graph`, `/api/azure/advisor`)
- Token caching and silent refresh

**Phase 3: Role-based access control**
- **Least privilege**: Use the user's own Azure RBAC to determine what billing data they can see
- **Admin role**: App-level admin can use a system identity (managed identity or service principal) to access billing data on behalf of users
- **Security group mapping**: Map Entra ID security groups or app roles to data scopes:
  - Billing Account level access
  - Invoice Section level access
  - Subscription level access
  - Tag-based access (e.g., CostCenter = "Engineering")
- Permission management UI in the Settings page

**Phase 4: Direct API data sources**
- Replace CSV file loading with Azure Cost Management REST API calls
- Support for MCA (Microsoft Customer Agreement) billing hierarchy:
  ```
  Billing Account → Billing Profile → Invoice Section → Subscription → Resource Group → Resource
  ```
- Cache API responses server-side to avoid rate limits
- Combine with existing CSV upload as a fallback/alternative data source

### Entra ID app registration requirements
- **Redirect URIs**: `http://localhost:3000` (dev), production URL
- **API permissions**: `Azure Service Management > user_impersonation`, `Microsoft Graph > User.Read`
- **Supported account types**: Depends on deployment (single-tenant for internal, multi-tenant for SaaS)
- **Client secret or certificate**: For server-side token acquisition (API proxy routes)

### What this unblocks
| Feature | Dependency |
|---|---|
| 6 Governance pages | Resource Graph API tokens |
| 2 Workload Optimization pages | Advisor API tokens |
| Full reservation recommendations | Advisor API tokens |
| Direct billing API data | Cost Management API tokens |
| Multi-tenant support | Per-tenant token acquisition |
| Scheduled report delivery | Service principal for unattended access |

---

## 18. Multi-Tenant Billing Architecture

### Problem
The app is registered in a single tenant, but must access billing data from multiple Azure tenants. This is common for MSPs, centralized FinOps teams, and organizations with multiple Entra ID tenants.

### Architecture: Single-tenant app, multi-tenant data access

```
┌─────────────────────────────────────────────────────┐
│ FinOpsWeb (home tenant)                             │
│                                                     │
│  App Registration (single-tenant)                   │
│  Service Principal (for unattended/scheduled jobs)  │
│                                                     │
│  ┌──────────────────────────────────────┐           │
│  │ Tenant Selector (header UI)          │           │
│  │  ○ Home Tenant (direct access)       │           │
│  │  ○ Tenant B (via Lighthouse / B2B)   │           │
│  │  ○ Tenant C (via Lighthouse / B2B)   │           │
│  └──────────────────────────────────────┘           │
│                                                     │
│  Per-tenant token acquisition:                      │
│  ├─ User credentials → B2B guest token per tenant   │
│  └─ Service principal → Lighthouse delegated access │
│                                                     │
│  API proxy routes:                                  │
│  /api/azure/cost-data?tenantId=xxx                  │
│  /api/azure/resource-graph?tenantId=xxx             │
└─────────────────────────────────────────────────────┘
```

### Access methods

**Azure Lighthouse (service principal)**
- Target tenants onboard via Lighthouse delegation
- Grants specific roles (Billing Reader, Cost Management Reader) on their scopes
- No app registration needed in target tenant
- Best for: MSP scenarios, centralized FinOps teams

**B2B Guest Accounts (user credentials)**
- User is invited as guest in target tenants
- MSAL acquires a separate token per tenant using tenant-specific authority
- Best for: users who already have cross-tenant guest access

### Data isolation
- Pre-aggregated data cached per tenant (separate cache files or IndexedDB stores)
- Tenant selector in header switches the active data context
- All reports automatically reflect the selected tenant's data

### Prerequisites per target tenant
| Item | Setup by |
|---|---|
| Lighthouse delegation (service principal access) | Target tenant admin |
| B2B guest invite (user credential access) | Target tenant admin |
| Billing Reader or Cost Management Reader role | Target tenant admin |
