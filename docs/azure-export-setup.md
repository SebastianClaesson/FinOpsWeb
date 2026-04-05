# Azure Cost Management Export Setup

This guide walks you through setting up automated FOCUS cost data exports from Azure to your storage account, then loading them into FinOpsWeb.

## Prerequisites

- **Azure subscription** with Cost Management access
- **Storage account** for export destination
- **Az PowerShell module** (`Install-Module Az -Scope CurrentUser`)
- Logged in: `Connect-AzAccount`

## Step 1: Create the Export

The export is created at a billing scope. Choose the scope that matches your setup:

| Scope | Format |
|---|---|
| Billing Account (MCA) | `/providers/Microsoft.Billing/billingAccounts/{billingAccountId}` |
| Billing Profile | `/providers/Microsoft.Billing/billingAccounts/{id}/billingProfiles/{profileId}` |
| Subscription | `/subscriptions/{subscriptionId}` |
| Resource Group | `/subscriptions/{subscriptionId}/resourceGroups/{rgName}` |

### PowerShell: Create a daily FOCUS Parquet export

```powershell
# Variables — fill in your values
$exportName      = "finops-focus-export"
$scope           = "/providers/Microsoft.Billing/billingAccounts/<billing-account-id>"
$storageAccount  = "/subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.Storage/storageAccounts/<storage-account>"
$container       = "finops"
$rootFolder      = "exports"

# Create the export
New-AzCostManagementExport `
  -Name $exportName `
  -Scope $scope `
  -ScheduleStatus "Active" `
  -ScheduleRecurrence "Daily" `
  -RecurrencePeriodFrom (Get-Date).AddDays(-30) `
  -RecurrencePeriodTo (Get-Date).AddYears(1) `
  -DefinitionType "FocusCost" `
  -DefinitionTimeframe "MonthToDate" `
  -DataSetGranularity "Daily" `
  -DestinationResourceId $storageAccount `
  -DestinationContainer $container `
  -DestinationRootFolderPath $rootFolder `
  -Format "Parquet" `
  -DataOverwriteBehavior "OverwritePreviousReport" `
  -PartitionData $true
```

### PowerShell: Trigger an immediate export run

```powershell
Invoke-AzCostManagementExecuteExport `
  -Name $exportName `
  -Scope $scope
```

> The export typically takes 5–15 minutes to complete depending on data volume.

### Alternative: CSV format

If you prefer CSV (larger files but human-readable):

```powershell
New-AzCostManagementExport `
  -Name "finops-focus-csv" `
  -Scope $scope `
  -ScheduleStatus "Active" `
  -ScheduleRecurrence "Daily" `
  -RecurrencePeriodFrom (Get-Date).AddDays(-30) `
  -RecurrencePeriodTo (Get-Date).AddYears(1) `
  -DefinitionType "FocusCost" `
  -DefinitionTimeframe "MonthToDate" `
  -DataSetGranularity "Daily" `
  -DestinationResourceId $storageAccount `
  -DestinationContainer $container `
  -DestinationRootFolderPath $rootFolder `
  -Format "Csv" `
  -DataOverwriteBehavior "OverwritePreviousReport" `
  -PartitionData $true
```

## Step 2: Download Exports to FinOpsWeb

FinOpsWeb reads export files from the `data/exports/` directory (configurable via `FOCUS_EXPORTS_DIR` env var). Download the files from your storage account using one of these methods:

### Option A: azcopy (recommended for automation)

```powershell
# Install azcopy if not already installed
# https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-v10

# Sync the latest exports to the local directory
azcopy copy `
  "https://<storage-account>.blob.core.windows.net/finops/exports/*" `
  "./data/exports/" `
  --recursive `
  --overwrite=ifSourceNewer
```

### Option B: Azure Storage Explorer

1. Open [Azure Storage Explorer](https://azure.microsoft.com/en-us/products/storage/storage-explorer/)
2. Navigate to your storage account > `finops` container > `exports` folder
3. Select the latest export folder (named by date)
4. Download the `.parquet` or `.csv` files + `manifest.json` to `data/exports/`

### Option C: Az PowerShell

```powershell
$ctx = (Get-AzStorageAccount -ResourceGroupName "<rg>" -Name "<storage-account>").Context

# List blobs in the exports container
Get-AzStorageBlob -Container "finops" -Context $ctx -Prefix "exports/" |
  Where-Object { $_.Name -match '\.(csv|parquet|json)$' } |
  ForEach-Object {
    $localPath = Join-Path "data/exports" ($_.Name -replace '.*/','')
    Get-AzStorageBlobContent -Container "finops" -Blob $_.Name -Destination $localPath -Context $ctx -Force
  }
```

### Option D: Mount as a volume (advanced)

For real-time access without downloading, mount the blob container:

```powershell
# Using blobfuse2 (Linux) or Azure Storage mount
# Set FOCUS_EXPORTS_DIR to the mount path in .env.local
FOCUS_EXPORTS_DIR=/mnt/finops/exports
```

## Step 3: Load Into FinOpsWeb

Once the files are in `data/exports/`, FinOpsWeb picks them up automatically:

1. **First load**: Parses all CSV/Parquet files and creates a disk cache (`.aggregated-cache.json`)
2. **Subsequent loads**: Reads from cache instantly (~1 second)
3. **Cache invalidation**: Automatic when any data file is newer than the cache

```bash
# Start the dev server
npm run dev

# Or for production
npm run build && npm start
```

Open http://localhost:3000 — your cost data should appear in all reports.

### Verify the data loaded

Check the header on the Cost Summary page:
- **File count**: Shows number of CSV/Parquet files loaded
- **Currency**: Auto-detected from the billing data (e.g., SEK, USD, EUR)
- **Data range**: Shows the export date range (from manifest.json)

## Step 4: Automate (Optional)

### Scheduled sync with a script

Create a `sync-exports.ps1` script:

```powershell
#!/usr/bin/env pwsh
# Sync Azure Cost Management exports to FinOpsWeb

$storageAccount = "<storage-account>"
$container = "finops"
$localDir = "./data/exports"

Write-Host "Syncing exports from $storageAccount..."

azcopy copy `
  "https://$storageAccount.blob.core.windows.net/$container/exports/*" `
  $localDir `
  --recursive `
  --overwrite=ifSourceNewer

# Delete the cache to force re-aggregation
Remove-Item "$localDir/.aggregated-cache.json" -ErrorAction SilentlyContinue

Write-Host "Done. Restart the dev server to load new data."
```

### Trigger export + sync in one command

```powershell
# Trigger export
Invoke-AzCostManagementExecuteExport -Name "finops-focus-export" -Scope $scope

# Wait for export to complete (check every 30 seconds)
Write-Host "Waiting for export to complete..."
Start-Sleep -Seconds 300  # Exports typically take 5-15 minutes

# Sync to local
.\sync-exports.ps1
```

## Troubleshooting

| Issue | Solution |
|---|---|
| No data appears | Check `data/exports/` has `.csv` or `.parquet` files |
| Wrong currency shown | Verify the export is FOCUS format (not legacy ActualCost) |
| Slow first load | Normal — parsing 1GB+ of CSVs takes ~25s. Cache makes subsequent loads instant |
| "Global row limit reached" | Increase `FOCUS_MAX_ROWS` in `.env.local` (default: 500,000) |
| Stale data after new export | Delete `data/exports/.aggregated-cache.json` |
| Mixed currency warning | Your exports span multiple currencies — use the Currency filter |

## Export Format Reference

FinOpsWeb supports these Azure Cost Management export types:

| Export Type | Format | Support |
|---|---|---|
| **FocusCost** (recommended) | CSV or Parquet | Full support — all reports |
| FocusCost 1.0-preview | CSV | Supported (field mapping) |
| ActualCost (legacy) | CSV | Not supported — use FocusCost |
| AmortizedCost (legacy) | CSV | Not supported — use FocusCost |

Always use **FocusCost** export type. The FOCUS standard includes both actual and amortized cost views in a single export via the `ChargeCategory` and `PricingCategory` fields.

## Additional Azure Data Sources

Beyond FOCUS cost exports, these Azure APIs provide data that enriches specific reports. These require MSAL authentication (see `.env.example`).

### Useful — planned integration

| Data Source | API | Enriches | Priority |
|---|---|---|---|
| **Reservation Recommendations** | Azure Advisor API | Rate Optimization > Recommendations page | High |
| **Reservation Utilization** | Billing API `/reservationsSummaries` | Rate Optimization > Utilization page (daily/monthly % per reservation) | High |
| **Reservation Transactions** | Billing API `/reservationTransactions` | Rate Optimization > Purchases page (purchase, exchange, refund events) | Medium |
| **Price Sheet** | Billing API `/pricesheets` | Prices pages (full contracted price list per billing period) | Medium |
| **Budgets** | Cost Management API `/budgets` | Summary page budget feature (sync Azure-defined budgets) | Medium |
| **Resource Graph** | Azure Resource Graph API | All 6 Governance pages (live resource inventory, compliance, config) | High |
| **Azure Advisor** | Advisor API | Workload Optimization pages (cost, security, reliability, performance recs) | High |

### Not needed (already in FOCUS)

| Legacy Export | Why Not Needed |
|---|---|
| ActualCost exports | FOCUS includes actual costs via `ChargeCategory` field |
| AmortizedCost exports | FOCUS includes amortized costs via `PricingCategory` + `EffectiveCost` |
| Usage Details API | FOCUS supersedes this with a standardized schema |

### PowerShell: Query additional data sources

```powershell
# Reservation recommendations
Get-AzAdvisorRecommendation -Category Cost

# Reservation utilization summaries (last 30 days)
# Requires: Az.Reservations module
Get-AzReservationSummary -ReservationOrderId "<order-id>" -Grain "daily" `
  -StartDate (Get-Date).AddDays(-30).ToString("yyyy-MM-dd") `
  -EndDate (Get-Date).ToString("yyyy-MM-dd")

# Price sheet for current billing period
# Available via REST API:
# GET https://management.azure.com/providers/Microsoft.Billing/billingAccounts/{id}/billingPeriods/{period}/pricesheets/default?api-version=2023-09-01

# Azure Resource Graph query (resource inventory)
Search-AzGraph -Query "Resources | summarize count() by type, location" -First 1000

# Azure Advisor cost recommendations
Get-AzAdvisorRecommendation -Category Cost |
  Select-Object ResourceId, ShortDescription, Impact, AnnualSavingsAmount
```

These data sources will be integrated via the API proxy (`/api/azure/proxy`) once MSAL authentication is configured. See the Authentication section in CLAUDE.md for setup instructions.
