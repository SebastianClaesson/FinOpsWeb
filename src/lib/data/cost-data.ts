import { FocusCostRecord, FilterState } from "@/lib/types/focus";
import { generateCostData } from "@/data/dummy/generate-data";

let cachedData: FocusCostRecord[] | null = null;

/**
 * Get all cost records (cached).
 */
export function getCostData(): FocusCostRecord[] {
  if (!cachedData) {
    cachedData = generateCostData();
  }
  return cachedData;
}

/**
 * Apply filters to cost data.
 */
export function filterCostData(
  data: FocusCostRecord[],
  filters: FilterState
): FocusCostRecord[] {
  return data.filter((record) => {
    // Date range
    if (
      record.ChargePeriodStart < filters.dateRange.start ||
      record.ChargePeriodStart > filters.dateRange.end
    ) {
      return false;
    }

    // Subscriptions
    if (
      filters.subscriptions.length > 0 &&
      !filters.subscriptions.includes(record.SubAccountName)
    ) {
      return false;
    }

    // Resource groups
    if (
      filters.resourceGroups.length > 0 &&
      !filters.resourceGroups.includes(record.x_ResourceGroupName)
    ) {
      return false;
    }

    // Regions
    if (
      filters.regions.length > 0 &&
      !filters.regions.includes(record.RegionName)
    ) {
      return false;
    }

    // Services
    if (
      filters.services.length > 0 &&
      !filters.services.includes(record.ServiceCategory)
    ) {
      return false;
    }

    // Commitment types
    if (filters.commitmentTypes.length > 0) {
      if (
        filters.commitmentTypes.includes("On-Demand") &&
        record.PricingCategory === "On-Demand"
      ) {
        // pass
      } else if (
        filters.commitmentTypes.includes(record.CommitmentDiscountType)
      ) {
        // pass
      } else {
        return false;
      }
    }

    // Currency
    if (filters.currency && record.BillingCurrency !== filters.currency) {
      return false;
    }

    return true;
  });
}

/**
 * Apply tag filters to cost data.
 */
export function filterByTags(
  data: FocusCostRecord[],
  tagFilters: Record<string, string[]>
): FocusCostRecord[] {
  if (Object.keys(tagFilters).length === 0) return data;

  return data.filter((record) => {
    const tags = parseTags(record.Tags);
    return Object.entries(tagFilters).every(([key, values]) => {
      if (values.length === 0) return true;
      return values.includes(tags[key] ?? "");
    });
  });
}

/**
 * Parse tags JSON string safely.
 */
export function parseTags(tagsStr: string): Record<string, string> {
  try {
    return JSON.parse(tagsStr) as Record<string, string>;
  } catch {
    return {};
  }
}

// --- Aggregation helpers ---

export interface GroupedCost {
  name: string;
  effectiveCost: number;
  billedCost: number;
  listCost: number;
  savings: number;
}

/**
 * Group and sum costs by a dimension.
 */
export function groupBy(
  data: FocusCostRecord[],
  keyFn: (r: FocusCostRecord) => string
): GroupedCost[] {
  const map = new Map<
    string,
    { effectiveCost: number; billedCost: number; listCost: number }
  >();

  for (const record of data) {
    const key = keyFn(record);
    const existing = map.get(key) ?? {
      effectiveCost: 0,
      billedCost: 0,
      listCost: 0,
    };
    existing.effectiveCost += record.EffectiveCost;
    existing.billedCost += record.BilledCost;
    existing.listCost += record.ListCost;
    map.set(key, existing);
  }

  return Array.from(map.entries())
    .map(([name, costs]) => ({
      name,
      effectiveCost: Math.round(costs.effectiveCost * 100) / 100,
      billedCost: Math.round(costs.billedCost * 100) / 100,
      listCost: Math.round(costs.listCost * 100) / 100,
      savings: Math.round((costs.listCost - costs.effectiveCost) * 100) / 100,
    }))
    .sort((a, b) => b.effectiveCost - a.effectiveCost);
}

/**
 * Group costs by date for time series charts.
 */
export function groupByDate(
  data: FocusCostRecord[],
  granularity: "day" | "month" = "day"
): { date: string; effectiveCost: number; listCost: number; savings: number }[] {
  const map = new Map<string, { effectiveCost: number; listCost: number }>();

  for (const record of data) {
    const key =
      granularity === "month"
        ? record.ChargePeriodStart.substring(0, 7) // YYYY-MM
        : record.ChargePeriodStart; // YYYY-MM-DD

    const existing = map.get(key) ?? { effectiveCost: 0, listCost: 0 };
    existing.effectiveCost += record.EffectiveCost;
    existing.listCost += record.ListCost;
    map.set(key, existing);
  }

  return Array.from(map.entries())
    .map(([date, costs]) => ({
      date,
      effectiveCost: Math.round(costs.effectiveCost * 100) / 100,
      listCost: Math.round(costs.listCost * 100) / 100,
      savings:
        Math.round((costs.listCost - costs.effectiveCost) * 100) / 100,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Group costs by date and a dimension for stacked charts.
 */
export function groupByDateAndDimension(
  data: FocusCostRecord[],
  keyFn: (r: FocusCostRecord) => string,
  granularity: "day" | "month" = "month"
): { date: string; [key: string]: string | number }[] {
  const map = new Map<string, Map<string, number>>();
  const allKeys = new Set<string>();

  for (const record of data) {
    const dateKey =
      granularity === "month"
        ? record.ChargePeriodStart.substring(0, 7)
        : record.ChargePeriodStart;
    const dimKey = keyFn(record);
    allKeys.add(dimKey);

    if (!map.has(dateKey)) map.set(dateKey, new Map());
    const dateMap = map.get(dateKey)!;
    dateMap.set(dimKey, (dateMap.get(dimKey) ?? 0) + record.EffectiveCost);
  }

  return Array.from(map.entries())
    .map(([date, dimMap]) => {
      const entry: { date: string; [key: string]: string | number } = { date };
      for (const key of allKeys) {
        entry[key] = Math.round((dimMap.get(key) ?? 0) * 100) / 100;
      }
      return entry;
    })
    .sort((a, b) => (a.date as string).localeCompare(b.date as string));
}

/**
 * Calculate total costs from a dataset.
 */
export function calculateTotals(data: FocusCostRecord[]) {
  let effectiveCost = 0;
  let billedCost = 0;
  let listCost = 0;

  for (const record of data) {
    effectiveCost += record.EffectiveCost;
    billedCost += record.BilledCost;
    listCost += record.ListCost;
  }

  return {
    effectiveCost: Math.round(effectiveCost * 100) / 100,
    billedCost: Math.round(billedCost * 100) / 100,
    listCost: Math.round(listCost * 100) / 100,
    totalSavings: Math.round((listCost - effectiveCost) * 100) / 100,
    savingsPercent:
      listCost > 0
        ? Math.round(((listCost - effectiveCost) / listCost) * 10000) / 100
        : 0,
  };
}

/**
 * Extract unique values from a dimension for filter dropdowns.
 */
export function getUniqueValues(
  data: FocusCostRecord[],
  keyFn: (r: FocusCostRecord) => string
): string[] {
  return [...new Set(data.map(keyFn))].filter(Boolean).sort();
}

/**
 * Extract all unique tag keys and their values.
 */
export function getUniqueTagKeysAndValues(
  data: FocusCostRecord[]
): Record<string, string[]> {
  const tagMap = new Map<string, Set<string>>();

  for (const record of data) {
    const tags = parseTags(record.Tags);
    for (const [key, value] of Object.entries(tags)) {
      if (!tagMap.has(key)) tagMap.set(key, new Set());
      tagMap.get(key)!.add(value);
    }
  }

  const result: Record<string, string[]> = {};
  for (const [key, values] of tagMap.entries()) {
    result[key] = [...values].sort();
  }
  return result;
}

/**
 * Get running total over time.
 */
export function getRunningTotal(
  data: FocusCostRecord[]
): { date: string; runningTotal: number; dailyCost: number; savings: number }[] {
  const daily = groupByDate(data, "day");
  let runningTotal = 0;

  return daily.map((d) => {
    runningTotal += d.effectiveCost;
    return {
      date: d.date,
      runningTotal: Math.round(runningTotal * 100) / 100,
      dailyCost: d.effectiveCost,
      savings: d.savings,
    };
  });
}
