"use client";

import { useMemo, useState, useCallback } from "react";
import { FocusCostRecord } from "@/lib/types/focus";
import { formatCurrency, formatCompact, formatPercent, formatMonth } from "@/lib/utils/format";
import { Filter, ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MonthlyComparisonProps {
  data: FocusCostRecord[];
  keyFn: (r: FocusCostRecord) => string;
  nameLabel?: string;
}

type SortDir = "asc" | "desc";

export function MonthlyComparison({
  data,
  keyFn,
  nameLabel = "Name",
}: MonthlyComparisonProps) {
  const [nameFilter, setNameFilter] = useState("");
  const [sortField, setSortField] = useState<string>("totalCost");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleSort = useCallback(
    (field: string) => {
      if (sortField === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDir("desc");
      }
    },
    [sortField]
  );

  const analysis = useMemo(() => {
    const months = [...new Set(data.map((r) => r.ChargePeriodStart.substring(0, 7)))].sort();
    const dimensions = [...new Set(data.map(keyFn))].sort();

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

    return { monthKeys: months, months: months.map((m) => formatMonth(m + "-01")), rows };
  }, [data, keyFn]);

  const filtered = useMemo(() => {
    if (!nameFilter) return analysis.rows;
    const q = nameFilter.toLowerCase();
    return analysis.rows.filter((r) => r.name.toLowerCase().includes(q));
  }, [analysis.rows, nameFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const mult = sortDir === "asc" ? 1 : -1;
      if (sortField === "name") return mult * a.name.localeCompare(b.name);
      if (sortField === "totalCost") return mult * (a.totalCost - b.totalCost);
      // Sort by a specific month
      const aMonth = a.months.find((m) => m.monthKey === sortField);
      const bMonth = b.months.find((m) => m.monthKey === sortField);
      return mult * ((aMonth?.cost ?? 0) - (bMonth?.cost ?? 0));
    });
  }, [filtered, sortField, sortDir]);

  function SortBtn({ field, children, align = "left" }: { field: string; children: React.ReactNode; align?: "left" | "right" }) {
    const isActive = sortField === field;
    return (
      <button
        onClick={() => toggleSort(field)}
        className={`inline-flex items-center gap-1 text-xs font-medium transition-colors hover:text-foreground whitespace-nowrap ${align === "right" ? "ml-auto flex-row-reverse" : ""} ${isActive ? "text-foreground" : "text-muted-foreground"}`}
      >
        {children}
        {isActive ? (
          sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-30" />
        )}
      </button>
    );
  }

  return (
    <div>
      {nameFilter && (
        <div className="mb-2 flex items-center justify-between rounded-md bg-muted/30 px-3 py-1.5">
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Filter className="h-3 w-3" />
            {filtered.length} of {analysis.rows.length} rows
          </span>
          <Button variant="ghost" size="sm" className="h-6 text-[11px]" onClick={() => setNameFilter("")}>Clear</Button>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left"><SortBtn field="name">{nameLabel}</SortBtn></th>
              {analysis.monthKeys.map((mk, i) => (
                <th key={mk} className="px-3 py-2 text-right">
                  <SortBtn field={mk} align="right">{analysis.months[i]}</SortBtn>
                </th>
              ))}
              <th className="px-3 py-2 text-right"><SortBtn field="totalCost" align="right">Total</SortBtn></th>
            </tr>
            <tr className="border-b bg-muted/20">
              <th className="px-3 py-1">
                <input
                  type="text"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  placeholder="Search..."
                  className="h-6 w-full rounded border border-border/50 bg-background px-1.5 text-[11px] font-normal transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                />
              </th>
              {analysis.months.map((m) => (
                <th key={m} className="px-3 py-1"></th>
              ))}
              <th className="px-3 py-1"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.name} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-3 py-2 font-medium">{row.name}</td>
                {row.months.map((m) => (
                  <td key={m.monthKey} className="px-3 py-2 text-right">
                    <div className="font-mono">{formatCompact(m.cost)}</div>
                    {m.changePct !== 0 && (
                      <div className={`text-[10px] ${m.changePct > 0 ? "text-red-500" : "text-green-600"}`}>
                        {formatPercent(m.changePct)}
                      </div>
                    )}
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-mono font-semibold">{formatCurrency(row.totalCost)}</td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={analysis.months.length + 2} className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No rows match the filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
