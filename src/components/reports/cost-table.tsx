"use client";

import { useState } from "react";
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
import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CostTableProps {
  data: GroupedCost[];
  nameLabel?: string;
  showSavings?: boolean;
  /** If provided, shows month-over-month columns */
  monthlyData?: {
    name: string;
    months: { month: string; cost: number; changePct: number }[];
  }[];
}

type SortField = "name" | "effectiveCost" | "billedCost" | "savings";
type SortDir = "asc" | "desc";

export function CostTable({
  data,
  nameLabel = "Name",
  showSavings = true,
  monthlyData,
}: CostTableProps) {
  const [sortField, setSortField] = useState<SortField>("effectiveCost");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sorted = [...data].sort((a, b) => {
    const multiplier = sortDir === "asc" ? 1 : -1;
    if (sortField === "name") return multiplier * a.name.localeCompare(b.name);
    return multiplier * (a[sortField] - b[sortField]);
  });

  const total = data.reduce(
    (acc, d) => ({
      effectiveCost: acc.effectiveCost + d.effectiveCost,
      billedCost: acc.billedCost + d.billedCost,
      savings: acc.savings + d.savings,
    }),
    { effectiveCost: 0, billedCost: 0, savings: 0 }
  );

  // Get unique months from monthlyData
  const months = monthlyData && monthlyData.length > 0
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
      className="-ml-3 h-8 gap-1"
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
    <div className="rounded-md border">
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
            <TableCell>Total</TableCell>
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
        </TableBody>
      </Table>
    </div>
  );
}
