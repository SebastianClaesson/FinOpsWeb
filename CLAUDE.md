@AGENTS.md

# CLAUDE.md — FinOps Website

## Project Purpose

A web-based alternative to Microsoft's FinOps Toolkit Power BI reports. Displays Azure financial/consumption reports in a browser — no Power BI license or client-side tooling required. The first report to replicate is the **Cost Summary** report from the FinOps Toolkit.

Reference material:
- Cost Summary report spec: https://learn.microsoft.com/en-us/cloud-computing/finops/toolkit/power-bi/cost-summary
- FinOps Toolkit open data: https://learn.microsoft.com/en-us/cloud-computing/finops/toolkit/open-data
- FinOps Toolkit GitHub: https://github.com/microsoft/finops-toolkit

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | **Next.js 16 (App Router)** | SSR/SSG, file-based routing, API routes for future backend work |
| Language | **TypeScript** | Type safety across FOCUS schema and API contracts |
| Styling | **Tailwind CSS v4** | Utility-first, responsive by default |
| UI Components | **shadcn/ui** | Accessible, composable, themeable components |
| Charts | **Recharts** (via shadcn/ui chart components) | React-native charting, integrated with shadcn theming |
| Date Handling | **date-fns** | Lightweight date manipulation |
| Auth (future) | **MSAL.js (@azure/msal-browser, @azure/msal-react)** | Entra ID / Azure AD authentication |
| Data (current) | **Static dummy data (FOCUS schema JSON)** | Replicates real export structure |
| Data (future) | **Azure Cost Management APIs / Azure exports** | Real billing data ingestion |

See DECISIONS.md for detailed justification of every technical choice.

## Architecture

```
src/
  app/                    # Next.js App Router pages
    layout.tsx            # Root layout (company branding, nav)
    page.tsx              # Landing / dashboard home
    reports/
      cost-summary/       # Cost Summary report (first report)
        page.tsx
  components/
    ui/                   # shadcn/ui components
    charts/               # Reusable chart components (bar, line, pie, treemap)
    filters/              # Date range picker, subscription filter, region filter, etc.
    layout/               # Header, sidebar, footer, branding
    reports/              # Report-specific composite components
  lib/
    data/                 # Data loading, parsing, transformation
    types/                # TypeScript types (FOCUS schema, filters, etc.)
    utils/                # Shared utilities (cn helper, formatting)
    config/               # App configuration (branding, feature flags)
  data/
    dummy/                # Static dummy data files (FOCUS format JSON)
    open-data/            # FinOps Toolkit open data (Regions, Services, ResourceTypes)
public/
  branding/              # Company logo/icon (customizable)
```

## Data Schema

All cost data follows the **FOCUS (FinOps Open Cost and Usage Specification)** standard, version 1.0.

### Key FOCUS columns used in Cost Summary

**Cost columns:** BilledCost, EffectiveCost, ListCost, ContractedCost
**Dimensions:** ChargeCategory, ChargeSubcategory, PricingCategory, ServiceCategory, ServiceName, SubAccountName (subscription), RegionName, ResourceName, ResourceType
**Time:** ChargePeriodStart, ChargePeriodEnd, BillingPeriodStart, BillingPeriodEnd
**Identifiers:** ResourceId, SkuId, SkuPriceId, BillingAccountId, SubAccountId
**Usage:** ConsumedQuantity, ConsumedUnit, PricingQuantity, PricingUnit
**Commitments:** CommitmentDiscountId, CommitmentDiscountName, CommitmentDiscountStatus, CommitmentDiscountType
**Currency:** BillingCurrency
**Tags:** Tags (JSON string)
**Microsoft extensions (x_ prefix):** x_ResourceGroupName, x_PricingSubcategory, x_SkuMeterCategory, x_SkuMeterSubcategory, x_SkuMeterName, x_CostCenter, x_InvoiceSectionId, x_InvoiceSectionName, x_BillingProfileId, x_BillingProfileName

## MCA Billing Hierarchy

The project targets Microsoft Customer Agreement (MCA) accounts. The billing hierarchy is:

```
Billing Account (tenant-level)
  └── Billing Profile (invoice entity, payment method)
        └── Invoice Section (logical grouping for cost allocation)
              └── Subscription (Azure subscription)
                    └── Resource Group
                          └── Resource
```

Reference: https://learn.microsoft.com/en-us/azure/cost-management-billing/understand/mca-overview#invoice-sections

Invoice Sections are critical for chargeback — they group subscriptions for invoicing purposes. The data model must support filtering and grouping by Invoice Section and Billing Profile.

## Cost Summary Report — Pages to Implement

The Power BI Cost Summary has these pages (implement in priority order):

1. **Summary** — KPIs (effective cost, total savings), top 10 subscriptions/resource groups/services, monthly trend by pricing category, daily spend trend (last 30 days)
2. **Subscriptions** — Cost breakdown by subscription, drill into resource group and resource
3. **Resource Groups** — Cost breakdown by resource group, drill into resource
4. **Resources** — Cost breakdown by resource with location, group, subscription, tags
5. **Services** — Cost by service/meter category, drill into tier/meter/product
6. **Regions** — Cost by region (table + optional map)
7. **Running Total** — Accumulated cost over time with savings breakdown
8. **Charge Breakdown** — Hierarchical drill-down through charge categories
9. **Inventory** — Resource type counts with cost per resource
10. **Prices** — Price listing for consumed products
11. **Purchases** — List of purchased products
12. **Usage Analysis** — Consumed quantity vs cost for a unit type (requires unit filter)
13. **Data Quality** — Validation and data exploration page

### Global Filters (available on every report page)
- **Date range** (charge period start/end)
- **Subscription**
- **Resource Group**
- **Region**
- **Service**
- **Commitment type**
- **Currency** (single-select)

## Branding & Customization

The application supports customizable branding:
- **Company name** — displayed in header/nav, configured in `src/lib/config/branding.ts`
- **Company logo/icon** — placed in `public/branding/`, referenced in config
- **Theme colors** — configurable via Tailwind/CSS custom properties

## Authentication

MSAL / Entra ID authentication is implemented but runs in **anonymous mode** by default (no env vars = no auth UI, app works with CSV data only).

### Setup
1. Copy `.env.example` to `.env.local`
2. Create an Entra ID app registration (single-tenant):
   - Redirect URI: `http://localhost:3000` (SPA type)
   - API permissions: `Azure Service Management > user_impersonation`, `Microsoft Graph > User.Read`
3. Fill in `.env.local`:
   ```
   NEXT_PUBLIC_AZURE_CLIENT_ID=your-client-id
   NEXT_PUBLIC_AZURE_TENANT_ID=your-tenant-id
   NEXT_PUBLIC_AZURE_TENANT_NAME=Your Org Name
   AZURE_CLIENT_SECRET=your-secret  # optional, for service principal flows
   ```
4. Restart dev server — Sign In button appears in header

### Architecture
- **Single-tenant app registration**, multi-tenant data access via Azure Lighthouse or B2B guest accounts
- `src/lib/config/auth.ts` — MSAL configuration (reads env vars)
- `src/components/auth/auth-provider.tsx` — MsalProvider wrapper (no-ops without config)
- `src/components/auth/auth-button.tsx` — Login/logout popup flow
- `src/components/auth/tenant-selector.tsx` — Switch between configured tenants
- `src/lib/azure/token-service.ts` — Per-tenant token acquisition (user or service principal)
- `src/app/api/azure/proxy/route.ts` — Server-side API proxy (keeps client secret server-side)
- `src/lib/config/tenants.ts` — Tenant registry (env vars + localStorage)

### Access control (planned)
- Least privilege: use user's own Azure RBAC to determine visible billing data
- Admin role: app-level admin using system identity (managed identity or service principal)
- Security group mapping: Entra ID groups/app roles → data scopes (billing account, invoice section, subscription, tag)
- Permission management UI in Settings page

See DECISIONS.md sections 17-18 for full architecture details.

## FinOps Hubs Data Model

When ingesting data in Phase 2+, refer to the FinOps Hubs data model for schema compatibility:
https://learn.microsoft.com/en-us/cloud-computing/finops/toolkit/hubs/data-model

The Hubs pipeline normalizes Azure Cost Management exports into a standardized schema before Power BI consumes it. Our ingestion layer should be compatible with this model.

## Data Sources

### Phase 1 (Current): CSV/Parquet Exports + Dummy Data
- **CSV streaming** — FOCUS CSV exports parsed server-side with PapaParse streaming, aggregated into compact fact table during parse (~5 MB output from ~1 GB input)
- **Parquet support** — FOCUS Parquet exports parsed with hyparquet (pure JS, zero deps)
- **Pre-aggregation** — Server never holds raw records in memory; disk cache (`.aggregated-cache.json`) for instant subsequent loads
- **Browser upload** — Drag & drop CSV/Parquet files, parsed in browser, stored in IndexedDB
- **Dummy data** — Generated FOCUS-format data as fallback when no exports exist
- **Open data lookups** — FinOps Toolkit data (Regions, Services, ResourceTypes) in `src/data/open-data/`

### Phase 2 (Ready): Azure Export Ingestion via Azure Blob Storage
- Point `FOCUS_EXPORTS_DIR` to a mounted Azure Blob container or synced directory
- Support FOCUS 1.0 and 1.0-preview schemas
- Manifest.json metadata displayed as data freshness indicator

### Phase 3 (Auth foundation built): Azure Billing APIs
- Direct API calls to Azure Cost Management REST APIs
- MSAL authentication implemented (see Authentication section above)
- API proxy route (`/api/azure/proxy`) supports user token passthrough and service principal
- Multi-tenant access via Lighthouse delegation or B2B guest accounts
- MCA (Microsoft Customer Agreement) billing hierarchy support

## Coding Conventions

- **Responsive design** — mobile-first using Tailwind breakpoints (sm, md, lg, xl)
- **Component composition** — small, focused components
- **Type safety** — TypeScript interfaces for all data structures; no `any` types
- **Named exports** — prefer named exports over default exports
- **File naming** — kebab-case for files, PascalCase for components
- **Accessibility** — semantic HTML, ARIA labels on charts, keyboard navigation
- **No secrets in code** — API keys, tenant IDs etc. via environment variables
- **Security** — see VULNERABILITIES.md for known considerations

## Running Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Useful Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
```
