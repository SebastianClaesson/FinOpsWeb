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
| **Cost Summary** | Summary, Services, Subscriptions, Resource Groups, Regions, Charge Breakdown, Running Total, Resources, Inventory, Prices, Purchases, Usage Analysis, Data Quality | Done |
| **Invoicing** | Summary, Chargeback, Invoice Recon, Services, Tags, Prices, Purchases | Done |
| **Rate Optimization** | Summary | Done |

### Placeholder — needs implementation

**Rate Optimization** (9 pages — requires commitment discount data in FOCUS exports):
- `commitment-savings` — Savings from reservations/savings plans over time
- `chargeback` — Commitment discount chargeback allocation
- `hybrid-benefit` — Azure Hybrid Benefit usage tracking
- `prices` — Rate-specific price sheet analysis
- `purchases` — Reservation/savings plan purchase history
- `recommendations` — Reservation purchase recommendations (may need Azure Advisor API)
- `resources` — Resources covered by commitments
- `total-savings` — Total savings breakdown by discount type
- `utilization` — Commitment utilization tracking

**Governance** (5 pages — requires Azure Resource Graph API):
- `page.tsx` (summary) — Governance overview dashboard
- `managed-disks` — Disk tier and encryption compliance
- `network-security` — NSG rules and public IP audit
- `policy-compliance` — Azure Policy compliance status
- `sql-databases` — SQL tier and security configuration
- `virtual-machines` — VM sizing, generation, and configuration audit

**Workload Optimization** (2 pages — requires Azure Advisor API):
- `page.tsx` (summary) — Optimization opportunities overview
- `unattached-disks` — Orphaned/unattached disk detection

### Implementation notes
- Rate Optimization pages can be built using existing `purchases`, `prices`, and `factTable` data from the pre-aggregation layer. Most need filtering by `CommitmentDiscountType` and `PricingCategory`.
- Governance and Workload Optimization pages require external Azure APIs (Resource Graph, Advisor) that are not yet integrated. These are blocked on the authentication/MSAL work (see CLAUDE.md Phase 3).
- Priority: Rate Optimization pages first (data already available), then Governance/Workload after auth integration.

---

## 15. Feature Roadmap — Planned Enhancements

### High priority (can be built with existing data)

**1. Anomaly detection / cost alerts**
Flag unusual daily spend spikes compared to historical baseline (e.g., > 2 standard deviations from 30-day average). No external APIs needed — statistical analysis on the fact table. Could surface as a banner on the Summary page and a dedicated Anomalies page.

**2. Tagging compliance report**
Show what percentage of resources have required tags (e.g., `CostCenter`, `Owner`, `Environment`). Very common FinOps requirement. Can be built from the existing `resources` detail table (which includes parsed tags) and `tagCosts`. Display as a compliance score card with drill-down into untagged resources.

**3. Amortized cost view**
Reservation/savings plan purchases appear as one-time spikes in the current view. An amortized view spreads the cost over the commitment term. The FOCUS spec supports this via `ChargeCategory` + `ChargeSubcategory` + `PricingCategory`. Add a toggle to switch between actual and amortized cost views across all reports.

**4. Savings plan / reservation coverage**
What percentage of eligible usage is covered by commitments? Compare `PricingCategory = "On-Demand"` vs `"Commitment Discount"` ratios over time. Feeds into the Rate Optimization > Utilization placeholder page. Key metric for FinOps teams evaluating whether to buy more reservations.

**5. Data freshness indicator**
Show when the CSV data was last exported/updated. The `manifest.json` from Azure Cost Management exports contains this metadata. Surface it in the header/status bar so users know how current their data is. Already parsed by the upload flow but not displayed.

**6. URL-shareable filter state**
Encode filter selections (date range, subscriptions, regions, etc.) in URL search params so users can share a specific filtered view via link. Already noted as an open question in the codebase — implement using Next.js `useSearchParams` with bidirectional sync to filter state.

### Medium priority (needs additional data model work)

**7. Showback/chargeback export**
Generate formatted chargeback reports (PDF/Excel) that finance teams can distribute to cost center owners. The Invoicing > Chargeback page already groups by subscription — add an export button that produces a branded, print-ready document with per-cost-center breakdowns, monthly trends, and totals.

**8. Parquet file support**
Azure Cost Management exports increasingly use Parquet format (smaller files, faster parsing). Currently only CSV is supported. Adding Parquet ingestion via a WASM-based parser (e.g., `parquet-wasm` or DuckDB-WASM) would future-proof the data pipeline and reduce parse times significantly.

**9. Multi-tenant / multi-billing-account support**
The current app assumes a single dataset. Enterprise customers often have multiple billing accounts or EA enrollments. The FOCUS schema includes `BillingAccountId` and `BillingAccountName` — add a top-level account switcher that filters all reports to a selected billing account. May require partitioned storage in IndexedDB or separate API endpoints per account.

### Lower priority (needs external integrations)

**10. Scheduled report delivery**
Email or Teams webhook with a summary snapshot (e.g., weekly cost digest). Common ask from FinOps practitioners who don't check dashboards daily. Requires a backend scheduler (Azure Functions timer trigger or similar) and a rendering pipeline to produce the digest. Blocked on authentication and a persistent backend.

### Implementation order suggestion
1. Data freshness indicator (quick win, metadata already available)
2. URL-shareable filter state (improves collaboration, no data changes)
3. Tagging compliance report (new page, uses existing data)
4. Anomaly detection (new page + Summary banner, uses existing data)
5. Amortized cost view (toggle across reports, needs data model consideration)
6. Savings plan / reservation coverage (feeds Rate Optimization pages)
7. Showback/chargeback export (PDF generation dependency)
8. Parquet support (new parser dependency)
9. Multi-tenant support (architecture change)
10. Scheduled report delivery (requires backend infrastructure)

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
