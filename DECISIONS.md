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
