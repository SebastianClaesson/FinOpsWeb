"use client";

import { useState, useMemo } from "react";
import { GroupedCost } from "@/lib/data/cost-data";
import { formatCurrency, formatCompact } from "@/lib/utils/format";
import { CHART_COLORS } from "@/lib/utils/chart-colors";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp, ArrowUpDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CostTableProps {
  data: GroupedCost[];
  nameLabel?: string;
  showSavings?: boolean;
  monthlyData?: {
    name: string;
    months: { month: string; cost: number; changePct: number }[];
  }[];
}

type SortField = "name" | "effectiveCost" | "billedCost" | "savings";
type SortDir = "asc" | "desc";

function ColumnFilter({
  value,
  onChange,
  placeholder,
  align = "left",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  align?: "left" | "right";
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "Filter..."}
      className={`h-6 w-full rounded border border-border/50 bg-background px-1.5 text-[11px] font-normal transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none ${align === "right" ? "text-right" : ""}`}
    />
  );
}

export function CostTable({
  data,
  nameLabel = "Name",
  showSavings = true,
  monthlyData,
}: CostTableProps) {
  const [sortField, setSortField] = useState<SortField>("effectiveCost");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Column filters
  const [nameFilter, setNameFilter] = useState("");
  const [effectiveCostMin, setEffectiveCostMin] = useState("");
  const [billedCostMin, setBilledCostMin] = useState("");
  const [savingsMin, setSavingsMin] = useState("");

  const hasFilters = nameFilter || effectiveCostMin || billedCostMin || savingsMin;

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  // Filter, then sort
  const filtered = useMemo(() => {
    let result = data;

    if (nameFilter) {
      const q = nameFilter.toLowerCase();
      result = result.filter((r) => r.name.toLowerCase().includes(q));
    }
    if (effectiveCostMin) {
      const min = parseFloat(effectiveCostMin);
      if (!isNaN(min)) result = result.filter((r) => r.effectiveCost >= min);
    }
    if (billedCostMin) {
      const min = parseFloat(billedCostMin);
      if (!isNaN(min)) result = result.filter((r) => r.billedCost >= min);
    }
    if (savingsMin) {
      const min = parseFloat(savingsMin);
      if (!isNaN(min)) result = result.filter((r) => r.savings >= min);
    }

    return result;
  }, [data, nameFilter, effectiveCostMin, billedCostMin, savingsMin]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const multiplier = sortDir === "asc" ? 1 : -1;
      if (sortField === "name") return multiplier * a.name.localeCompare(b.name);
      return multiplier * (a[sortField] - b[sortField]);
    });
  }, [filtered, sortField, sortDir]);

  const total = useMemo(
    () =>
      filtered.reduce(
        (acc, d) => ({
          effectiveCost: acc.effectiveCost + d.effectiveCost,
          billedCost: acc.billedCost + d.billedCost,
          savings: acc.savings + d.savings,
        }),
        { effectiveCost: 0, billedCost: 0, savings: 0 }
      ),
    [filtered]
  );

  const months =
    monthlyData && monthlyData.length > 0
      ? monthlyData[0].months.map((m) => m.month)
      : [];

  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-7 gap-1 text-xs"
      onClick={() => toggleSort(field)}
    >
      {children}
      {sortField === field ? (
        sortDir === "asc" ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-30" />
      )}
    </Button>
  );

  return (
    <div className="rounded-lg border">
      {hasFilters && (
        <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-1.5">
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Filter className="h-3 w-3" />
            {filtered.length} of {data.length} rows
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[11px]"
            onClick={() => {
              setNameFilter("");
              setEffectiveCostMin("");
              setBilledCostMin("");
              setSavingsMin("");
            }}
          >
            Clear
          </Button>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>
              <SortButton field="name">{nameLabel}</SortButton>
            </TableHead>
            <TableHead className="text-right">
              <SortButton field="effectiveCost">Effective Cost</SortButton>
            </TableHead>
            <TableHead className="text-right">
              <SortButton field="billedCost">Billed Cost</SortButton>
            </TableHead>
            {showSavings && (
              <TableHead className="text-right">
                <SortButton field="savings">Savings</SortButton>
              </TableHead>
            )}
            <TableHead className="text-right">% of Total</TableHead>
            {months.map((m) => (
              <TableHead key={m} className="text-right text-xs">
                {m}
              </TableHead>
            ))}
          </TableRow>
          {/* Filter row */}
          <TableRow className="bg-muted/20 hover:bg-muted/20">
            <TableHead className="py-1"></TableHead>
            <TableHead className="py-1">
              <ColumnFilter
                value={nameFilter}
                onChange={setNameFilter}
                placeholder="Search name..."
              />
            </TableHead>
            <TableHead className="py-1">
              <ColumnFilter
                value={effectiveCostMin}
                onChange={setEffectiveCostMin}
                placeholder="Min $..."
                align="right"
              />
            </TableHead>
            <TableHead className="py-1">
              <ColumnFilter
                value={billedCostMin}
                onChange={setBilledCostMin}
                placeholder="Min $..."
                align="right"
              />
            </TableHead>
            {showSavings && (
              <TableHead className="py-1">
                <ColumnFilter
                  value={savingsMin}
                  onChange={setSavingsMin}
                  placeholder="Min $..."
                  align="right"
                />
              </TableHead>
            )}
            <TableHead className="py-1"></TableHead>
            {months.map((m) => (
              <TableHead key={m} className="py-1"></TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row, i) => {
            const pct =
              total.effectiveCost > 0
                ? (row.effectiveCost / total.effectiveCost) * 100
                : 0;
            const monthly = monthlyData?.find((m) => m.name === row.name);
            return (
              <TableRow key={row.name}>
                <TableCell>
                  <div
                    className="h-3 w-3 rounded-sm"
                    style={{
                      background: CHART_COLORS[i % CHART_COLORS.length],
                    }}
                  />
                </TableCell>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(row.effectiveCost)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(row.billedCost)}
                </TableCell>
                {showSavings && (
                  <TableCell className="text-right font-mono text-green-600">
                    {row.savings > 0 ? formatCurrency(row.savings) : "-"}
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                          background: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                </TableCell>
                {monthly?.months.map((m) => (
                  <TableCell key={m.month} className="text-right font-mono text-xs">
                    <div>{formatCompact(m.cost)}</div>
                    {m.changePct !== 0 && (
                      <div
                        className={`text-[10px] ${
                          m.changePct > 0 ? "text-red-500" : "text-green-600"
                        }`}
                      >
                        {m.changePct > 0 ? "+" : ""}
                        {m.changePct.toFixed(1)}%
                      </div>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
          {/* Total row */}
          <TableRow className="bg-muted/50 font-semibold">
            <TableCell></TableCell>
            <TableCell>Total ({filtered.length})</TableCell>
            <TableCell className="text-right font-mono">
              {formatCurrency(total.effectiveCost)}
            </TableCell>
            <TableCell className="text-right font-mono">
              {formatCurrency(total.billedCost)}
            </TableCell>
            {showSavings && (
              <TableCell className="text-right font-mono text-green-600">
                {formatCurrency(total.savings)}
              </TableCell>
            )}
            <TableCell className="text-right text-xs text-muted-foreground">
              100%
            </TableCell>
            {months.map((m) => (
              <TableCell key={m}></TableCell>
            ))}
          </TableRow>
          {sorted.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6 + months.length}
                className="py-8 text-center text-sm text-muted-foreground"
              >
                No rows match the current filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
