"use client";

import { useMemo } from "react";
import { FocusCostRecord } from "@/lib/types/focus";
import { groupBy, groupByDate } from "@/lib/data/cost-data";
import { formatCurrency, formatCompact, formatPercent, formatMonth } from "@/lib/utils/format";

interface MonthlyComparisonProps {
  data: FocusCostRecord[];
  keyFn: (r: FocusCostRecord) => string;
  nameLabel?: string;
}

/**
 * Shows a month-by-month cost breakdown for a dimension (subscription, resource group, etc.)
 * with absolute and percentage change columns.
 */
export function MonthlyComparison({
  data,
  keyFn,
  nameLabel = "Name",
}: MonthlyComparisonProps) {
  const analysis = useMemo(() => {
    // Get all unique months
    const months = [...new Set(data.map((r) => r.ChargePeriodStart.substring(0, 7)))].sort();

    // Get all unique dimension values
    const dimensions = [...new Set(data.map(keyFn))].sort();

    // Build per-dimension per-month costs
    const matrix: Record<string, Record<string, number>> = {};
    for (const dim of dimensions) {
      matrix[dim] = {};
      for (const month of months) {
        matrix[dim][month] = 0;
      }
    }

    for (const record of data) {
      const dim = keyFn(record);
      const month = record.ChargePeriodStart.substring(0, 7);
      matrix[dim][month] += record.EffectiveCost;
    }

    // Calculate totals and sort by total cost descending
    const rows = dimensions.map((dim) => {
      const monthCosts = months.map((month, i) => {
        const cost = Math.round(matrix[dim][month] * 100) / 100;
        const prevCost = i > 0 ? matrix[dim][months[i - 1]] : cost;
        const changePct = prevCost > 0 ? ((cost - prevCost) / prevCost) * 100 : 0;
        return {
          month: formatMonth(month + "-01"),
          monthKey: month,
          cost,
          changePct: Math.round(changePct * 100) / 100,
        };
      });
      const totalCost = monthCosts.reduce((sum, m) => sum + m.cost, 0);
      return { name: dim, months: monthCosts, totalCost };
    });

    rows.sort((a, b) => b.totalCost - a.totalCost);

    return { months: months.map((m) => formatMonth(m + "-01")), rows };
  }, [data, keyFn]);

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-3 py-2 text-left font-medium">{nameLabel}</th>
            {analysis.months.map((m) => (
              <th key={m} className="px-3 py-2 text-right font-medium whitespace-nowrap">
                {m}
              </th>
            ))}
            <th className="px-3 py-2 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {analysis.rows.map((row) => (
            <tr key={row.name} className="border-b last:border-0 hover:bg-muted/30">
              <td className="px-3 py-2 font-medium">{row.name}</td>
              {row.months.map((m) => (
                <td key={m.monthKey} className="px-3 py-2 text-right">
                  <div className="font-mono">{formatCompact(m.cost)}</div>
                  {m.changePct !== 0 && (
                    <div
                      className={`text-[10px] ${
                        m.changePct > 0 ? "text-red-500" : "text-green-600"
                      }`}
                    >
                      {formatPercent(m.changePct)}
                    </div>
                  )}
                </td>
              ))}
              <td className="px-3 py-2 text-right font-mono font-semibold">
                {formatCurrency(row.totalCost)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
