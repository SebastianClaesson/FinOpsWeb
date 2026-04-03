# ROADMAP.md — Planned Features

Features are organized by priority and phase. Check the box when complete.

---

## Phase 1: Core Reports (Current)

### Cost Summary (13 tabs)
- [x] Summary, Subscriptions, Resource Groups, Resources, Services, Regions, Running Total, Charge Breakdown, Inventory, Prices, Purchases, Usage Analysis, Data Quality
- [x] Global filters (date range, subscription, resource group, region, service, commitment type, currency)
- [x] Azure tag-based filtering
- [x] Column sorting (asc/desc) and column filtering on all tables
- [x] Month-over-month cost trend table (absolute + percentage change)
- [x] Resource count change tracking (1-month and 6-month)
- [x] Monthly comparison by resource/resource group/subscription scope
- [x] Export to CSV, JSON, HTML
- [x] Responsive design (mobile + desktop)
- [x] Customizable branding (company name, logo, theme colors)
- [x] Dark mode toggle (system/light/dark with next-themes)
- [x] Dummy data using FOCUS v1.0 schema

### Invoicing & Chargeback (7 tabs)
- [x] Summary — monthly billed cost with trend
- [x] Services — cost breakdown by service category
- [x] Chargeback — effective cost by subscription for allocation
- [x] Invoice Recon — billed cost by meter category (stub for full MCA invoice sections)
- [x] Purchases — commitment discount purchases
- [x] Prices — price sheet for consumed products
- [x] Tags — cost grouped by tag key/value

### Rate Optimization (10 tabs)
- [x] Summary — effective cost, savings, ESR (Effective Savings Rate)
- [ ] Total Savings — effective cost and savings over time
- [ ] Commitment Savings — savings by commitment type (reservation vs savings plan)
- [ ] Utilization — commitment discount utilization percentage and trends
- [ ] Resources — resources covered by commitments
- [ ] Chargeback — amortized cost per subscription from commitments
- [ ] Recommendations — reservation purchase recommendations (requires reservation recommendations export)
- [ ] Purchases — commitment discount purchases (monthly/upfront)
- [ ] Hybrid Benefit — Azure Hybrid Benefit usage for Windows Server VMs
- [ ] Prices — prices for commitment discount products

### Policy & Governance (6 tabs) — Requires Azure Resource Graph
- [ ] Summary — subscription/resource type/region overview
- [ ] Policy Compliance — Azure Policy status
- [ ] Virtual Machines — VM inventory with right-sizing recommendations
- [ ] Managed Disks — disk inventory
- [ ] SQL Databases — database cost and utilization
- [ ] Network Security — NSG inventory and rules

### Workload Optimization (2 tabs) — Requires Azure Resource Graph + Advisor
- [ ] Recommendations — Azure Advisor cost recommendations
- [ ] Unattached Disks — orphaned disks sorted by cost

## Phase 1 Enhancements (Planned)

- [ ] **My Settings page** — user preferences (default date range, default subscription scope, preferred currency, default report landing page, number format locale)
- [ ] Cost optimization advisories per resource (idle resources, right-sizing)
- [ ] Generation advisory per resource (newer VM SKU suggestions)
- [ ] Savings plan / reservation comparison (side-by-side on-demand vs committed)
- [ ] Invoice Section and Billing Profile support (MCA hierarchy)
- [ ] Shareable filtered views via URL parameters

## Phase 2: Azure Export Ingestion

- [ ] Parse Azure Cost Management CSV exports (FOCUS 1.0 format)
- [ ] File upload UI for CSV/Parquet exports
- [ ] Support pointing to Azure Blob Storage for automatic ingestion
- [ ] Support both FOCUS 1.0 and 1.0-preview schemas
- [ ] Price Sheet export ingestion (required for Rate Optimization)
- [ ] Reservation Details and Transactions export ingestion
- [ ] Open data integration (Regions.csv, Services.csv, ResourceTypes.csv from Microsoft)
- [ ] Data validation and error reporting on import

## Phase 3: Azure APIs & Authentication

- [ ] MSAL / Entra ID authentication
- [ ] Direct integration with Azure Cost Management REST APIs
- [ ] MCA (Microsoft Customer Agreement) billing account support
- [ ] Azure Resource Graph API integration (enables Governance + Workload Optimization reports)
- [ ] Azure Advisor API integration (enables optimization recommendations)
- [ ] Token caching, refresh, rate limiting, error handling

## Phase 4: Optimization Engine Integration

The [Azure Optimization Engine (AOE)](https://learn.microsoft.com/en-us/cloud-computing/finops/toolkit/optimization-engine/overview) is a self-contained Azure deployment that generates optimization recommendations across five pillars: Cost, High Availability, Performance, Security, and Operational Excellence.

### Integration approach
AOE deploys as:
- Storage account + Log Analytics workspace (data ingestion)
- Azure Automation (recommendation logic)
- Azure SQL database (recommendation history, up to 1 year)
- 11 Azure Workbooks (visualization)

**Our integration options:**
1. **Read from AOE's SQL database** — query the recommendation history table to surface recommendations in our dashboard. Requires network access to the SQL instance.
2. **Read from AOE's Log Analytics workspace** — query KQL tables for raw recommendation data. Requires MSAL auth + Log Analytics API.
3. **Import AOE export files** — if AOE supports exporting recommendations to storage, ingest them like cost exports.

### AOE recommendation categories to surface
| Pillar | Key recommendations |
|---|---|
| **Cost** | VM right-sizing (with guest OS metrics), underutilized VMSS/premium SSD/App Service/SQL DBs, orphaned disks & public IPs, load balancers without backends, long-deallocated VMs, stopped (not deallocated) VMs |
| **High Availability** | VM availability zone/set coverage, VMSS availability, fault/update domain structure |
| **Performance** | VMSS constrained by compute, SQL DBs constrained by DTU, App Service plans constrained |
| **Security** | Service principal credentials without expiration, NSG rules referencing removed resources |
| **Operational Excellence** | Expiring credentials, RBAC assignment limits, resource group limits, empty/wasted subnets |

### AOE workbook equivalents to build
- [ ] Benefits simulation
- [ ] Benefits usage
- [ ] Costs growing
- [ ] Reservations potential / usage
- [ ] Savings plans usage
- [ ] Resources inventory
- [ ] Identities and roles
- [ ] Policy compliance

## Future Ideas

- [ ] Multi-cloud support (AWS, GCP cost data)
- [ ] Role-based access control (map Entra ID roles to report visibility)
- [ ] Scheduled report emails / PDF generation
- [ ] Custom dashboard builder (drag-and-drop widgets)
- [ ] Anomaly detection (alert on unexpected cost spikes)
- [ ] Budget tracking and alerts
- [ ] Excel (.xlsx) export with formatted worksheets
- [ ] Data retention / historical trend analysis (>12 months)
