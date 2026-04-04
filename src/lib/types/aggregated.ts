/**
 * Pre-aggregated data types.
 *
 * Instead of sending hundreds of thousands of raw FocusCostRecord rows
 * to the browser, the server aggregates CSV data into a compact "fact table"
 * plus small detail tables. This reduces the API payload from ~500 MB to ~5 MB.
 */

import { AllUniqueValues } from "@/lib/data/cost-data";

// ---------------------------------------------------------------------------
// Fact table — one row per unique (date × dimension) combination
// ---------------------------------------------------------------------------

export interface CostFactRow {
  /** Day granularity: YYYY-MM-DD */
  date: string;

  // Groupable / filterable dimensions
  SubAccountName: string;
  x_ResourceGroupName: string;
  RegionName: string;
  ServiceCategory: string;
  ServiceName: string;
  PricingCategory: string;
  ChargeCategory: string;
  ChargeSubcategory: string;
  x_SkuMeterCategory: string;
  CommitmentDiscountType: string;
  BillingCurrency: string;

  // Summed cost measures
  effectiveCost: number;
  billedCost: number;
  listCost: number;

  /** Number of raw CSV rows collapsed into this fact row. */
  recordCount: number;
}

// ---------------------------------------------------------------------------
// Detail tables — small, de-duplicated tables for specific report pages
// ---------------------------------------------------------------------------

/** Resources + Inventory pages */
export interface ResourceDetail {
  ResourceName: string;
  ResourceType: string;
  x_ResourceGroupName: string;
  SubAccountName: string;
  RegionName: string;
  effectiveCost: number;
  billedCost: number;
  listCost: number;
  /** Tags from the first occurrence (representative sample). */
  tags: Record<string, string>;
}

/** Prices page — one row per unique SkuId */
export interface PriceDetail {
  SkuId: string;
  ServiceName: string;
  x_SkuMeterCategory: string;
  x_SkuMeterSubcategory: string;
  x_SkuMeterName: string;
  PricingUnit: string;
  ListUnitPrice: number;
  ContractedUnitPrice: number;
}

/** Purchases page — one row per CommitmentDiscountId */
export interface PurchaseDetail {
  CommitmentDiscountId: string;
  CommitmentDiscountName: string;
  CommitmentDiscountType: string;
  SubAccountName: string;
  effectiveCost: number;
  listCost: number;
  /** Earliest ChargePeriodStart seen for this commitment. */
  firstSeen: string;
}

/** Usage Analysis page — one row per ResourceName × ConsumedUnit */
export interface UsageDetail {
  ResourceName: string;
  ConsumedUnit: string;
  consumedQuantity: number;
  effectiveCost: number;
}

/** Tags report — one row per tag key × value */
export interface TagCostRow {
  tagKey: string;
  tagValue: string;
  effectiveCost: number;
  billedCost: number;
  listCost: number;
}

/** Pre-computed data-quality statistics */
export interface DataQualityStats {
  totalRecords: number;
  missingResourceName: number;
  missingRegion: number;
  missingService: number;
  negativeCost: number;
  zeroCost: number;
  /** All distinct currencies found in the data. Multiple = mixed currency warning. */
  currencies: string[];
}

// ---------------------------------------------------------------------------
// Complete API response
// ---------------------------------------------------------------------------

export interface PreAggregatedData {
  source: "csv" | "csv-upload" | "dummy";
  factTable: CostFactRow[];
  resources: ResourceDetail[];
  prices: PriceDetail[];
  purchases: PurchaseDetail[];
  usage: UsageDetail[];
  tagCosts: TagCostRow[];
  filterOptions: AllUniqueValues;
  dataQuality: DataQualityStats;
  meta: {
    files: string[];
    totalRawRecords: number;
    truncated: boolean;
  };
}
