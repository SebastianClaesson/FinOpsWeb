# FinOps Web Portal

A web-based alternative to Microsoft's [FinOps Toolkit](https://microsoft.github.io/finops-toolkit) Power BI reports for Azure cloud financial management.

## Why?

The FinOps Toolkit provides excellent Power BI reports for Azure cost analysis, but they require:

- **Power BI Desktop or Pro license** for each user
- **Client-side installation** and configuration
- **Direct data source connectivity** from each user's machine

This project replaces those Power BI reports with a **browser-based dashboard** that anyone in the organization can access — no licenses, no installs, no client-side tooling.

## What does it do?

Replicates the FinOps Toolkit Power BI reports as interactive web pages:

| Report | Status | Description |
|---|---|---|
| **Cost Summary** | Live | Amortized cost overview — 13 tabs covering subscriptions, resource groups, resources, services, regions, running totals, charge breakdowns, inventory, prices, purchases, usage analysis |
| **Invoicing & Chargeback** | Live | Billed cost trends, invoice reconciliation, chargeback by subscription/resource group, tag-based allocation |
| **Rate Optimization** | Summary live, tabs in progress | Commitment discount savings, utilization, recommendations |
| **Policy & Governance** | Planned | Compliance, security, resource governance (requires Azure Resource Graph) |
| **Workload Optimization** | Planned | Resource utilization, Azure Advisor recommendations (requires Azure Resource Graph) |

### Key features

- **Interactive filters** — date range, subscription, resource group, region, service, commitment type, currency, Azure tags
- **Column sorting and filtering** on every table
- **Month-over-month comparisons** with absolute and percentage change
- **Resource count tracking** — see how your estate is growing or shrinking
- **Export** — download any view as CSV, JSON, or HTML
- **Dark mode** — system/light/dark theme toggle
- **Responsive** — works on desktop, tablet, and mobile
- **Customizable branding** — company name, logo, and theme colors

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui |
| Charts | Recharts |
| Fonts | Inter, Space Grotesk, JetBrains Mono |
| Theme | next-themes |
| Data (current) | Generated FOCUS v1.0 dummy data |

See [DECISIONS.md](DECISIONS.md) for detailed justification of every technical choice.

## Getting started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

### Build for production

```bash
npm run build
npm start
```

## Data

Currently uses **deterministic dummy data** that follows the [FOCUS (FinOps Open Cost and Usage Specification)](https://focus.finops.org/) v1.0 schema — the same format that Azure Cost Management exports produce.

The dummy data includes:
- 4 Azure subscriptions (Production, Development, Staging, Shared Services)
- 30 resources across 12 resource groups
- 6 months of daily cost records (~5,400 records)
- Multiple services (VMs, SQL, Storage, AKS, Cosmos DB, App Service, Functions, etc.)
- Multiple regions (East US, West Europe, Southeast Asia, Global)
- Commitment discounts (Reserved Instances, Savings Plans)

### Roadmap for real data

| Phase | Data source |
|---|---|
| **Phase 2** | Azure Cost Management CSV exports (FOCUS format) |
| **Phase 3** | Azure Billing APIs with MSAL/Entra ID authentication |

See [ROADMAP.md](ROADMAP.md) for the full plan.

## Customizing

### Branding

Edit [`src/lib/config/branding.ts`](src/lib/config/branding.ts) to change the company name and tagline. Replace `public/branding/logo.svg` with your company logo.

### Theme colors

Edit the CSS custom properties in [`src/app/globals.css`](src/app/globals.css) to adjust the color palette.

## Project structure

```
src/
  app/                       # Next.js pages (file-based routing)
    reports/
      cost-summary/          # Cost Summary report (13 pages)
      invoicing/             # Invoicing & Chargeback report (7 pages)
      rate-optimization/     # Rate Optimization report (10 pages)
      governance/            # Governance report (6 pages, planned)
      workload-optimization/ # Workload Optimization report (2 pages, planned)
  components/
    ui/                      # shadcn/ui components
    layout/                  # Header, sidebar, mobile nav
    filters/                 # Filter bar, multi-select
    reports/                 # Shared report components (tables, charts, context)
    export/                  # Export button (CSV/JSON/HTML)
  lib/
    config/                  # Branding, report definitions
    data/                    # Data loading and aggregation
    types/                   # TypeScript types (FOCUS schema)
    utils/                   # Formatting, chart colors
  data/
    dummy/                   # Dummy data generator
```

## Documentation

- [CLAUDE.md](CLAUDE.md) — AI assistant project guide (tech stack, architecture, conventions)
- [DECISIONS.md](DECISIONS.md) — Technical choices with justification and alternatives considered
- [ROADMAP.md](ROADMAP.md) — Planned features by phase
- [VULNERABILITIES.md](VULNERABILITIES.md) — Security considerations and mitigations

## References

- [FinOps Toolkit](https://microsoft.github.io/finops-toolkit) — Microsoft's open-source FinOps tools
- [FOCUS Specification](https://focus.finops.org/) — FinOps Open Cost and Usage Specification
- [Cost Summary Report](https://learn.microsoft.com/en-us/cloud-computing/finops/toolkit/power-bi/cost-summary) — Power BI report we're replicating
- [FinOps Toolkit Open Data](https://learn.microsoft.com/en-us/cloud-computing/finops/toolkit/open-data) — Lookup datasets (regions, services, resource types)

## License

MIT
