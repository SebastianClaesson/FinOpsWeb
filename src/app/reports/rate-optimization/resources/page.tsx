"use client";

import { useMemo, useState } from "react";
import { useReport } from "@/components/reports/report-context";
import { ResourceDetail } from "@/lib/types/aggregated";
import { useCurrencyFormat } from "@/lib/hooks/use-currency-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, TrendingDown, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSortableTable } from "@/components/reports/sortable-header";

interface SavingsResourceRow {
  name: string;
  type: string;
  subscription: string;
  region: string;
  effectiveCost: number;
  listCost: number;
  savings: number;
}

export default function ResourcesPage() {
  const { resources } = useReport();
  const { formatCurrency, formatCompact } = useCurrencyFormat();

  const [fName, setFName] = useState("");

  const hasFilters = !!fName;

  const savingsResources = useMemo(() => {
    return resources
      .filter((r: ResourceDetail) => r.listCost - r.effectiveCost > 0)
      .map((r: ResourceDetail) => ({
        name: r.ResourceName,
        type: r.ResourceType,
        subscription: r.SubAccountName,
        region: r.RegionName,
        effectiveCost: r.effectiveCost,
        listCost: r.listCost,
        savings: Math.round((r.listCost - r.effectiveCost) * 100) / 100,
      }));
  }, [resources]);

  const filtered = useMemo(() => {
    let result = savingsResources;
    if (fName) {
      const q = fName.toLowerCase();
      result = result.filter((r) => r.name.toLowerCase().includes(q));
    }
    return result;
  }, [savingsResources, fName]);

  const { sorted, SortHeader } = useSortableTable(filtered, "savings");

  const totalResourceSavings = useMemo(() => {
    return savingsResources.reduce((sum, r) => sum + r.savings, 0);
  }, [savingsResources]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Resources with Savings
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Layers className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {savingsResources.length}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              of {resources.length} total resources
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent dark:from-green-500/10" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Resource Savings
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
              <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight text-green-600 dark:text-green-400">
              {formatCompact(totalResourceSavings)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatCurrency(totalResourceSavings)} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resources with Savings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Resources with Savings ({filtered.length}
            {hasFilters ? ` of ${savingsResources.length}` : ""})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasFilters && (
            <div className="mb-2 flex items-center justify-between rounded-md bg-muted/30 px-3 py-1.5">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Filter className="h-3 w-3" />
                {filtered.length} of {savingsResources.length} resources
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[11px]"
                onClick={() => setFName("")}
              >
                Clear
              </Button>
            </div>
          )}
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortHeader field="name">Name</SortHeader>
                  </TableHead>
                  <TableHead>
                    <SortHeader field="type">Type</SortHeader>
                  </TableHead>
                  <TableHead>
                    <SortHeader field="subscription">Subscription</SortHeader>
                  </TableHead>
                  <TableHead>
                    <SortHeader field="region">Region</SortHeader>
                  </TableHead>
                  <TableHead className="text-right">
                    <SortHeader field="effectiveCost" align="right">
                      Effective Cost
                    </SortHeader>
                  </TableHead>
                  <TableHead className="text-right">
                    <SortHeader field="listCost" align="right">
                      List Cost
                    </SortHeader>
                  </TableHead>
                  <TableHead className="text-right">
                    <SortHeader field="savings" align="right">
                      Savings
                    </SortHeader>
                  </TableHead>
                </TableRow>
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="py-1">
                    <input
                      type="text"
                      value={fName}
                      onChange={(e) => setFName(e.target.value)}
                      placeholder="Name..."
                      className="h-6 w-full rounded border border-border/50 bg-background px-1.5 text-[11px] font-normal placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                    />
                  </TableHead>
                  <TableHead className="py-1" />
                  <TableHead className="py-1" />
                  <TableHead className="py-1" />
                  <TableHead className="py-1" />
                  <TableHead className="py-1" />
                  <TableHead className="py-1" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-48 truncate">
                      {r.type}
                    </TableCell>
                    <TableCell>{r.subscription}</TableCell>
                    <TableCell>{r.region}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(r.effectiveCost)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(r.listCost)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span className="text-green-600 dark:text-green-400">
                        {formatCurrency(r.savings)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {sorted.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No resources with savings found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
