/**
 * Client-side helpers for working with pre-aggregated CostFactRow data.
 *
 * These produce the exact same output shapes as the original cost-data.ts
 * functions, so report pages need minimal changes.
 */

import { CostFactRow } from "@/lib/types/aggregated";
import { FilterState } from "@/lib/types/focus";
import { GroupedCost } from "@/lib/data/cost-data";

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------

/**
 * Filter fact table rows by the global filter state.
 * Uses Sets for O(1) lookups.
 */
export function filterFactTable(
  facts: CostFactRow[],
  filters: FilterState
): CostFactRow[] {
  const subSet = filters.subscriptions.length > 0 ? new Set(filters.subscriptions) : null;
  const rgSet = filters.resourceGroups.length > 0 ? new Set(filters.resourceGroups) : null;
  const regionSet = filters.regions.length > 0 ? new Set(filters.regions) : null;
  const serviceSet = filters.services.length > 0 ? new Set(filters.services) : null;
  const commitSet = filters.commitmentTypes.length > 0 ? new Set(filters.commitmentTypes) : null;
  const { start, end } = filters.dateRange;
  const currency = filters.currency;

  return facts.filter((row) => {
    if (row.date < start || row.date > end) return false;
    if (subSet && !subSet.has(row.SubAccountName)) return false;
    if (rgSet && !rgSet.has(row.x_ResourceGroupName)) return false;
    if (regionSet && !regionSet.has(row.RegionName)) return false;
    if (serviceSet && !serviceSet.has(row.ServiceCategory)) return false;

    if (commitSet) {
      if (commitSet.has("On-Demand") && row.PricingCategory === "On-Demand") {
        // pass
      } else if (commitSet.has(row.CommitmentDiscountType)) {
        // pass
      } else {
        return false;
      }
    }

    if (currency && row.BillingCurrency !== currency) return false;
    return true;
  });
}

// ---------------------------------------------------------------------------
// Dimension grouping (replaces cost-data.ts groupBy)
// ---------------------------------------------------------------------------

/** Dimension keys available on CostFactRow. */
export type FactDimension = keyof Pick<
  CostFactRow,
  | "SubAccountName"
  | "x_ResourceGroupName"
  | "RegionName"
  | "ServiceCategory"
  | "ServiceName"
  | "PricingCategory"
  | "ChargeCategory"
  | "ChargeSubcategory"
  | "x_SkuMeterCategory"
  | "CommitmentDiscountType"
>;

/**
 * Group and sum costs by a single dimension.
 * Returns the same GroupedCost[] shape as cost-data.ts groupBy().
 */
export function groupByDimension(
  facts: CostFactRow[],
  dimension: FactDimension
): GroupedCost[] {
  const map = new Map<string, { effectiveCost: number; billedCost: number; listCost: number }>();

  for (const row of facts) {
    const key = row[dimension] as string;
    const existing = map.get(key);
    if (existing) {
      existing.effectiveCost += row.effectiveCost;
      existing.billedCost += row.billedCost;
      existing.listCost += row.listCost;
    } else {
      map.set(key, {
        effectiveCost: row.effectiveCost,
        billedCost: row.billedCost,
        listCost: row.listCost,
      });
    }
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

// ---------------------------------------------------------------------------
// Time series (replaces cost-data.ts groupByDate)
// ---------------------------------------------------------------------------

export function groupFactsByDate(
  facts: CostFactRow[],
  granularity: "day" | "month" = "day"
): { date: string; effectiveCost: number; listCost: number; savings: number }[] {
  const map = new Map<string, { effectiveCost: number; listCost: number }>();

  for (const row of facts) {
    const key = granularity === "month" ? row.date.substring(0, 7) : row.date;
    const existing = map.get(key);
    if (existing) {
      existing.effectiveCost += row.effectiveCost;
      existing.listCost += row.listCost;
    } else {
      map.set(key, {
        effectiveCost: row.effectiveCost,
        listCost: row.listCost,
      });
    }
  }

  return Array.from(map.entries())
    .map(([date, costs]) => ({
      date,
      effectiveCost: Math.round(costs.effectiveCost * 100) / 100,
      listCost: Math.round(costs.listCost * 100) / 100,
      savings: Math.round((costs.listCost - costs.effectiveCost) * 100) / 100,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ---------------------------------------------------------------------------
// Date × dimension (replaces cost-data.ts groupByDateAndDimension)
// ---------------------------------------------------------------------------

export function groupFactsByDateAndDimension(
  facts: CostFactRow[],
  dimension: FactDimension,
  granularity: "day" | "month" = "month"
): { date: string; [key: string]: string | number }[] {
  const map = new Map<string, Map<string, number>>();
  const allKeys = new Set<string>();

  for (const row of facts) {
    const dateKey = granularity === "month" ? row.date.substring(0, 7) : row.date;
    const dimKey = row[dimension] as string;
    allKeys.add(dimKey);

    if (!map.has(dateKey)) map.set(dateKey, new Map());
    const dateMap = map.get(dateKey)!;
    dateMap.set(dimKey, (dateMap.get(dimKey) ?? 0) + row.effectiveCost);
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

// ---------------------------------------------------------------------------
// Totals (replaces cost-data.ts calculateTotals)
// ---------------------------------------------------------------------------

export function calculateFactTotals(facts: CostFactRow[]) {
  let effectiveCost = 0;
  let billedCost = 0;
  let listCost = 0;

  for (const row of facts) {
    effectiveCost += row.effectiveCost;
    billedCost += row.billedCost;
    listCost += row.listCost;
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

// ---------------------------------------------------------------------------
// Running total (replaces cost-data.ts getRunningTotal)
// ---------------------------------------------------------------------------

export function getFactRunningTotal(
  facts: CostFactRow[]
): { date: string; runningTotal: number; dailyCost: number; savings: number }[] {
  const daily = groupFactsByDate(facts, "day");
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

// ---------------------------------------------------------------------------
// Unique values from fact table (for data quality page)
// ---------------------------------------------------------------------------

export function getFactUniqueValues(
  facts: CostFactRow[],
  dimension: FactDimension
): string[] {
  const set = new Set<string>();
  for (const row of facts) {
    const val = row[dimension] as string;
    if (val) set.add(val);
  }
  return [...set].sort();
}

// ---------------------------------------------------------------------------
// Anomaly detection
// ---------------------------------------------------------------------------

export interface AnomalyPoint {
  date: string;
  cost: number;
  mean: number;
  stddev: number;
  zScore: number;
  isAnomaly: boolean;
}

/**
 * Detect daily cost anomalies using a rolling window average + standard deviation.
 * A day is flagged as an anomaly if its cost exceeds `mean + threshold * stddev`.
 */
export function detectAnomalies(
  facts: CostFactRow[],
  windowDays = 30,
  threshold = 2.0
): AnomalyPoint[] {
  const daily = groupFactsByDate(facts, "day");
  if (daily.length < 3) return [];

  const result: AnomalyPoint[] = [];

  for (let i = 0; i < daily.length; i++) {
    // Compute rolling stats from the preceding window
    const windowStart = Math.max(0, i - windowDays);
    const window = daily.slice(windowStart, i);

    if (window.length < 2) {
      result.push({
        date: daily[i].date,
        cost: daily[i].effectiveCost,
        mean: daily[i].effectiveCost,
        stddev: 0,
        zScore: 0,
        isAnomaly: false,
      });
      continue;
    }

    const mean = window.reduce((sum, d) => sum + d.effectiveCost, 0) / window.length;
    const variance = window.reduce((sum, d) => sum + (d.effectiveCost - mean) ** 2, 0) / window.length;
    const stddev = Math.sqrt(variance);

    const cost = daily[i].effectiveCost;
    const zScore = stddev > 0 ? (cost - mean) / stddev : 0;
    const isAnomaly = stddev > 0 && cost > mean + threshold * stddev;

    result.push({
      date: daily[i].date,
      cost: Math.round(cost * 100) / 100,
      mean: Math.round(mean * 100) / 100,
      stddev: Math.round(stddev * 100) / 100,
      zScore: Math.round(zScore * 100) / 100,
      isAnomaly,
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// Cost forecasting (linear regression)
// ---------------------------------------------------------------------------

export interface ForecastPoint {
  date: string;
  forecastCost: number;
  upperBound: number;
  lowerBound: number;
}

/**
 * Generate a cost forecast using linear regression on historical daily costs.
 * Uses the last `lookbackDays` of data to fit the trend, then projects `forecastDays` ahead.
 */
export function generateForecast(
  facts: CostFactRow[],
  forecastDays = 30,
  lookbackDays = 60
): ForecastPoint[] {
  const daily = groupFactsByDate(facts, "day");
  if (daily.length < 7) return []; // Need at least a week of data

  // Use the last N days for regression
  const window = daily.slice(-lookbackDays);
  const n = window.length;

  // Convert dates to numeric x (days since first point)
  const startDate = new Date(window[0].date).getTime();
  const msPerDay = 86400000;
  const xs = window.map((d) => (new Date(d.date).getTime() - startDate) / msPerDay);
  const ys = window.map((d) => d.effectiveCost);

  // Linear regression: y = slope * x + intercept
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0);
  const sumX2 = xs.reduce((a, x) => a + x * x, 0);

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return [];

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // Compute residual standard deviation for confidence bands
  const residuals = ys.map((y, i) => y - (slope * xs[i] + intercept));
  const residualVariance = residuals.reduce((a, r) => a + r * r, 0) / Math.max(n - 2, 1);
  const residualStddev = Math.sqrt(residualVariance);

  // Generate forecast points
  const lastDate = new Date(window[n - 1].date);
  const lastX = xs[n - 1];
  const result: ForecastPoint[] = [];

  for (let i = 1; i <= forecastDays; i++) {
    const x = lastX + i;
    const predicted = Math.max(0, slope * x + intercept);

    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + i);
    const dateStr = forecastDate.toISOString().substring(0, 10);

    result.push({
      date: dateStr,
      forecastCost: Math.round(predicted * 100) / 100,
      upperBound: Math.round((predicted + residualStddev) * 100) / 100,
      lowerBound: Math.round(Math.max(0, predicted - residualStddev) * 100) / 100,
    });
  }

  return result;
}
