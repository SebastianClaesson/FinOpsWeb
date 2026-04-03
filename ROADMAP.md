# ROADMAP.md — Planned Features

Features are organized by priority and phase. Check the box when complete.

---

## Phase 1: Core Report (Current)

- [x] Cost Summary report with 13 tabs (Summary, Subscriptions, Resource Groups, Resources, Services, Regions, Running Total, Charge Breakdown, Inventory, Prices, Purchases, Usage Analysis, Data Quality)
- [x] Global filters (date range, subscription, resource group, region, service, commitment type, currency)
- [x] Azure tag-based filtering
- [x] Month-over-month cost trend table (absolute + percentage change)
- [x] Monthly comparison by resource/resource group/subscription scope
- [x] Export to CSV, JSON, HTML
- [x] Responsive design (mobile + desktop)
- [x] Customizable branding (company name, logo, theme colors)
- [x] Dummy data using FOCUS v1.0 schema
- [ ] Cost optimization advisories per resource (e.g., idle resources, right-sizing suggestions)
- [ ] Generation advisory per resource (e.g., VM SKU has a newer generation with better value)
- [ ] Savings plan / reservation comparison — show potential savings from commitment discounts vs on-demand (side-by-side)

## Phase 2: Azure Export Ingestion

- [ ] Parse Azure Cost Management CSV exports (FOCUS 1.0 format)
- [ ] File upload UI for CSV/Parquet exports
- [ ] Support pointing to Azure Blob Storage for automatic ingestion
- [ ] Support both FOCUS 1.0 and 1.0-preview schemas
- [ ] Open data integration (download Regions.csv, Services.csv, ResourceTypes.csv from Microsoft)
- [ ] Data validation and error reporting on import

## Phase 3: Azure Billing APIs

- [ ] MSAL / Entra ID authentication
- [ ] Direct integration with Azure Cost Management REST APIs
- [ ] MCA (Microsoft Customer Agreement) billing account support
- [ ] API endpoints: Cost Details, Price Sheet, Reservation Details, Reservation Transactions
- [ ] Token caching and refresh
- [ ] Rate limiting and error handling

## Phase 4: Additional Reports

- [ ] **Rate Optimization** — Commitment discount savings analysis
- [ ] **Invoicing & Chargeback** — Billed cost trends and invoice reconciliation
- [ ] **Workload Optimization** — Resource cost/usage efficiency opportunities
- [ ] **Policy & Governance** — Compliance and security posture

## Future Ideas

- [ ] Multi-cloud support (AWS, GCP cost data)
- [ ] Role-based access control (map Entra ID roles to report visibility)
- [ ] Scheduled report emails / PDF generation
- [ ] Custom dashboard builder (drag-and-drop widgets)
- [ ] Anomaly detection (alert on unexpected cost spikes)
- [ ] Budget tracking and alerts
- [ ] Excel (.xlsx) export with formatted worksheets
- [x] Dark mode toggle (system/light/dark with next-themes)
- [ ] Shareable filtered views via URL parameters
- [ ] Data retention / historical trend analysis (>12 months)
