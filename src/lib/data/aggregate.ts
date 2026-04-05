/**
 * Aggregation engine.
 *
 * Processes raw FOCUS cost records (one at a time) into compact
 * pre-aggregated structures. Designed to be called from a streaming
 * CSV parser so that raw records never accumulate in memory.
 */

import { FocusCostRecord } from "@/lib/types/focus";
import {
  CostFactRow,
  ResourceDetail,
  PriceDetail,
  PurchaseDetail,
  UsageDetail,
  TagCostRow,
  DataQualityStats,
  PreAggregatedData,
} from "@/lib/types/aggregated";
import { AllUniqueValues } from "@/lib/data/cost-data";

// ---------------------------------------------------------------------------
// Mutable accumulator maps (held in memory during streaming parse)
// ---------------------------------------------------------------------------

export interface AggregationMaps {
  facts: Map<string, CostFactRow>;
  resources: Map<string, ResourceDetail>;
  prices: Map<string, PriceDetail>;
  purchases: Map<string, { detail: PurchaseDetail }>;
  usage: Map<string, { quantity: number; cost: number }>;
  tagCosts: Map<string, { effectiveCost: number; billedCost: number; listCost: number }>;

  // Filter option accumulators
  subscriptions: Set<string>;
  resourceGroups: Set<string>;
  regions: Set<string>;
  services: Set<string>;
  commitmentTypes: Set<string>;
  currencies: Set<string>;
  tagKeys: Map<string, Set<string>>;

  // Data quality counters
  quality: DataQualityStats;
}

/** Create a fresh set of accumulator maps. */
export function createMaps(): AggregationMaps {
  return {
    facts: new Map(),
    resources: new Map(),
    prices: new Map(),
    purchases: new Map(),
    usage: new Map(),
    tagCosts: new Map(),
    subscriptions: new Set(),
    resourceGroups: new Set(),
    regions: new Set(),
    services: new Set(),
    commitmentTypes: new Set(),
    currencies: new Set(),
    tagKeys: new Map(),
    quality: {
      totalRecords: 0,
      missingResourceName: 0,
      missingRegion: 0,
      missingService: 0,
      negativeCost: 0,
      zeroCost: 0,
      currencies: [],
    },
  };
}

// ---------------------------------------------------------------------------
// Per-record aggregation (called once per CSV row)
// ---------------------------------------------------------------------------

/**
 * Build a composite key for the fact table from dimension fields.
 * Uses a separator unlikely to appear in real data.
 */
function factKey(r: FocusCostRecord): string {
  // ResourceName and ResourceType are deliberately excluded here —
  // they create nearly 1:1 rows with raw data. Per-resource detail
  // is in the separate resources detail table instead.
  return [
    r.ChargePeriodStart.substring(0, 10),
    r.SubAccountName,
    r.x_ResourceGroupName,
    r.RegionName,
    r.ServiceCategory,
    r.ServiceName,
    r.PricingCategory,
    r.ChargeCategory,
    r.ChargeSubcategory,
    r.x_SkuMeterCategory,
    r.CommitmentDiscountType,
    r.BillingCurrency,
  ].join("\x00");
}

/** Parse a JSON tags string safely. */
function parseTags(tagsStr: string): Record<string, string> {
  if (!tagsStr || tagsStr === "{}") return {};
  try {
    return JSON.parse(tagsStr) as Record<string, string>;
  } catch {
    return {};
  }
}

/**
 * Ingest one raw FOCUS record into the aggregation maps.
 * This function is designed to be called from a streaming CSV parser.
 */
export function aggregateRecord(r: FocusCostRecord, maps: AggregationMaps): void {
  const date = r.ChargePeriodStart.substring(0, 10);

  // -- Fact table --
  const fk = factKey(r);
  const existing = maps.facts.get(fk);
  if (existing) {
    existing.effectiveCost += r.EffectiveCost;
    existing.billedCost += r.BilledCost;
    existing.listCost += r.ListCost;
    existing.effectiveCostInUsd += (r.x_EffectiveCostInUsd ?? 0);
    existing.billedCostInUsd += (r.x_BilledCostInUsd ?? 0);
    existing.listCostInUsd += (r.x_ListCostInUsd ?? 0);
    existing.recordCount += 1;
  } else {
    maps.facts.set(fk, {
      date,
      SubAccountName: r.SubAccountName,
      x_ResourceGroupName: r.x_ResourceGroupName,
      RegionName: r.RegionName,
      ServiceCategory: r.ServiceCategory,
      ServiceName: r.ServiceName,
      PricingCategory: r.PricingCategory,
      ChargeCategory: r.ChargeCategory,
      ChargeSubcategory: r.ChargeSubcategory,
      x_SkuMeterCategory: r.x_SkuMeterCategory,
      CommitmentDiscountType: r.CommitmentDiscountType,
      BillingCurrency: r.BillingCurrency,
      effectiveCost: r.EffectiveCost,
      billedCost: r.BilledCost,
      listCost: r.ListCost,
      effectiveCostInUsd: r.x_EffectiveCostInUsd ?? 0,
      billedCostInUsd: r.x_BilledCostInUsd ?? 0,
      listCostInUsd: r.x_ListCostInUsd ?? 0,
      recordCount: 1,
    });
  }

  // -- Resource detail --
  if (r.ResourceName) {
    const res = maps.resources.get(r.ResourceName);
    if (res) {
      res.effectiveCost += r.EffectiveCost;
      res.billedCost += r.BilledCost;
      res.listCost += r.ListCost;
    } else {
      maps.resources.set(r.ResourceName, {
        ResourceName: r.ResourceName,
        ResourceType: r.ResourceType,
        x_ResourceGroupName: r.x_ResourceGroupName,
        SubAccountName: r.SubAccountName,
        RegionName: r.RegionName,
        effectiveCost: r.EffectiveCost,
        billedCost: r.BilledCost,
        listCost: r.ListCost,
        tags: parseTags(r.Tags),
      });
    }
  }

  // -- Price detail (first-seen wins) --
  if (r.SkuId) {
    if (!maps.prices.has(r.SkuId)) {
      maps.prices.set(r.SkuId, {
        SkuId: r.SkuId,
        ServiceName: r.ServiceName,
        x_SkuMeterCategory: r.x_SkuMeterCategory,
        x_SkuMeterSubcategory: r.x_SkuMeterSubcategory,
        x_SkuMeterName: r.x_SkuMeterName,
        PricingUnit: r.PricingUnit,
        ListUnitPrice: r.ListUnitPrice,
        ContractedUnitPrice: r.ContractedUnitPrice,
      });
    }
  }

  // -- Purchase detail --
  if (r.CommitmentDiscountId) {
    const p = maps.purchases.get(r.CommitmentDiscountId);
    if (p) {
      p.detail.effectiveCost += r.EffectiveCost;
      p.detail.listCost += r.ListCost;
      if (date < p.detail.firstSeen) p.detail.firstSeen = date;
    } else {
      maps.purchases.set(r.CommitmentDiscountId, {
        detail: {
          CommitmentDiscountId: r.CommitmentDiscountId,
          CommitmentDiscountName: r.CommitmentDiscountName,
          CommitmentDiscountType: r.CommitmentDiscountType,
          SubAccountName: r.SubAccountName,
          effectiveCost: r.EffectiveCost,
          listCost: r.ListCost,
          firstSeen: date,
        },
      });
    }
  }

  // -- Usage detail --
  if (r.ConsumedUnit && r.ResourceName) {
    const uk = `${r.ResourceName}\x00${r.ConsumedUnit}`;
    const u = maps.usage.get(uk);
    if (u) {
      u.quantity += r.ConsumedQuantity;
      u.cost += r.EffectiveCost;
    } else {
      maps.usage.set(uk, {
        quantity: r.ConsumedQuantity,
        cost: r.EffectiveCost,
      });
    }
  }

  // -- Tag costs --
  const tags = parseTags(r.Tags);
  for (const [key, value] of Object.entries(tags)) {
    const tk = `${key}\x00${value}`;
    const t = maps.tagCosts.get(tk);
    if (t) {
      t.effectiveCost += r.EffectiveCost;
      t.billedCost += r.BilledCost;
      t.listCost += r.ListCost;
    } else {
      maps.tagCosts.set(tk, {
        effectiveCost: r.EffectiveCost,
        billedCost: r.BilledCost,
        listCost: r.ListCost,
      });
    }

    // Tag filter options
    if (!maps.tagKeys.has(key)) maps.tagKeys.set(key, new Set());
    maps.tagKeys.get(key)!.add(value);
  }

  // -- Filter options --
  if (r.SubAccountName) maps.subscriptions.add(r.SubAccountName);
  if (r.x_ResourceGroupName) maps.resourceGroups.add(r.x_ResourceGroupName);
  if (r.RegionName) maps.regions.add(r.RegionName);
  if (r.ServiceCategory) maps.services.add(r.ServiceCategory);
  if (r.PricingCategory === "On-Demand") maps.commitmentTypes.add("On-Demand");
  if (r.CommitmentDiscountType) maps.commitmentTypes.add(r.CommitmentDiscountType);
  if (r.BillingCurrency) maps.currencies.add(r.BillingCurrency);

  // -- Data quality --
  maps.quality.totalRecords += 1;
  if (!r.ResourceName) maps.quality.missingResourceName += 1;
  if (!r.RegionName) maps.quality.missingRegion += 1;
  if (!r.ServiceName) maps.quality.missingService += 1;
  if (r.EffectiveCost < 0) maps.quality.negativeCost += 1;
  if (r.EffectiveCost === 0) maps.quality.zeroCost += 1;
}

// ---------------------------------------------------------------------------
// Finalization — convert maps to sorted arrays
// ---------------------------------------------------------------------------

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Convert the mutable aggregation maps into the final PreAggregatedData.
 */
export function finalizeAggregation(
  maps: AggregationMaps,
  source: PreAggregatedData["source"],
  files: string[],
  truncated: boolean
): PreAggregatedData {
  // Fact table
  const factTable: CostFactRow[] = [];
  for (const row of maps.facts.values()) {
    row.effectiveCost = round2(row.effectiveCost);
    row.billedCost = round2(row.billedCost);
    row.listCost = round2(row.listCost);
    row.effectiveCostInUsd = round2(row.effectiveCostInUsd);
    row.billedCostInUsd = round2(row.billedCostInUsd);
    row.listCostInUsd = round2(row.listCostInUsd);
    factTable.push(row);
  }
  factTable.sort((a, b) => a.date.localeCompare(b.date));

  // Resources
  const resources: ResourceDetail[] = [];
  for (const r of maps.resources.values()) {
    r.effectiveCost = round2(r.effectiveCost);
    r.billedCost = round2(r.billedCost);
    r.listCost = round2(r.listCost);
    resources.push(r);
  }
  resources.sort((a, b) => b.effectiveCost - a.effectiveCost);

  // Prices
  const prices = Array.from(maps.prices.values());
  prices.sort((a, b) => a.ServiceName.localeCompare(b.ServiceName));

  // Purchases
  const purchases: PurchaseDetail[] = [];
  for (const { detail } of maps.purchases.values()) {
    detail.effectiveCost = round2(detail.effectiveCost);
    detail.listCost = round2(detail.listCost);
    purchases.push(detail);
  }
  purchases.sort((a, b) => b.effectiveCost - a.effectiveCost);

  // Usage
  const usage: UsageDetail[] = [];
  for (const [key, val] of maps.usage.entries()) {
    const [ResourceName, ConsumedUnit] = key.split("\x00");
    usage.push({
      ResourceName,
      ConsumedUnit,
      consumedQuantity: round2(val.quantity),
      effectiveCost: round2(val.cost),
    });
  }
  usage.sort((a, b) => b.effectiveCost - a.effectiveCost);

  // Tag costs
  const tagCosts: TagCostRow[] = [];
  for (const [key, val] of maps.tagCosts.entries()) {
    const [tagKey, tagValue] = key.split("\x00");
    tagCosts.push({
      tagKey,
      tagValue,
      effectiveCost: round2(val.effectiveCost),
      billedCost: round2(val.billedCost),
      listCost: round2(val.listCost),
    });
  }
  tagCosts.sort((a, b) => a.tagKey.localeCompare(b.tagKey) || b.effectiveCost - a.effectiveCost);

  // Filter options
  const tagKeysAndValues: Record<string, string[]> = {};
  for (const [key, values] of maps.tagKeys.entries()) {
    tagKeysAndValues[key] = [...values].sort();
  }

  const filterOptions: AllUniqueValues = {
    subscriptions: [...maps.subscriptions].sort(),
    resourceGroups: [...maps.resourceGroups].sort(),
    regions: [...maps.regions].sort(),
    services: [...maps.services].sort(),
    commitmentTypes: [...maps.commitmentTypes].sort(),
    tagKeysAndValues,
  };

  // Finalize currencies list
  maps.quality.currencies = [...maps.currencies].sort();

  return {
    source,
    factTable,
    resources,
    prices,
    purchases,
    usage,
    tagCosts,
    filterOptions,
    dataQuality: maps.quality,
    meta: {
      files,
      totalRawRecords: maps.quality.totalRecords,
      truncated,
    },
  };
}

// ---------------------------------------------------------------------------
// Convenience: aggregate an array of records (for dummy data / client upload)
// ---------------------------------------------------------------------------

/**
 * Aggregate an array of FocusCostRecord into PreAggregatedData.
 * Use this for dummy data generation or client-side CSV upload.
 */
export function aggregateRecords(
  records: FocusCostRecord[],
  source: PreAggregatedData["source"],
  files: string[] = []
): PreAggregatedData {
  const maps = createMaps();
  for (const r of records) {
    aggregateRecord(r, maps);
  }
  return finalizeAggregation(maps, source, files, false);
}
