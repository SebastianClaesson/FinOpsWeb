"use client";

import { useMemo, useState } from "react";
import { useReport } from "@/components/reports/report-context";
import { formatNumber } from "@/lib/utils/format";
import { useCurrencyFormat } from "@/lib/hooks/use-currency-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CHART_COLORS } from "@/lib/utils/chart-colors";
import { useSortableTable } from "@/components/reports/sortable-header";

interface InventoryRow {
  type: string;
  count: number;
  totalCost: number;
  costPerResource: number;
}

export default function InventoryPage() {
  const { resources } = useReport();
  const { formatCurrency, formatCurrencyPrecise } = useCurrencyFormat();

  const [fType, setFType] = useState("");
  const [fCountMin, setFCountMin] = useState("");
  const [fCostMin, setFCostMin] = useState("");

  const hasFilters = fType || fCountMin || fCostMin;

  const inventory = useMemo(() => {
    const map = new Map<string, { type: string; resources: Set<string>; totalCost: number }>();

    for (const r of resources) {
      const existing = map.get(r.ResourceType);
      if (existing) {
        existing.resources.add(r.ResourceName);
        existing.totalCost += r.effectiveCost;
      } else {
        map.set(r.ResourceType, {
          type: r.ResourceType,
          resources: new Set([r.ResourceName]),
          totalCost: r.effectiveCost,
        });
      }
    }

    return [...map.values()].map((item) => ({
      type: item.type,
      count: item.resources.size,
      totalCost: Math.round(item.totalCost * 100) / 100,
      costPerResource: Math.round((item.totalCost / item.resources.size) * 100) / 100,
    }));
  }, [resources]);

  const filtered = useMemo(() => {
    let result = inventory;
    if (fType) { const q = fType.toLowerCase(); result = result.filter((r) => r.type.toLowerCase().includes(q)); }
    if (fCountMin) { const min = parseInt(fCountMin); if (!isNaN(min)) result = result.filter((r) => r.count >= min); }
    if (fCostMin) { const min = parseFloat(fCostMin); if (!isNaN(min)) result = result.filter((r) => r.totalCost >= min); }
    return result;
  }, [inventory, fType, fCountMin, fCostMin]);

  const { sorted, SortHeader } = useSortableTable(filtered, "totalCost");

  const totalResources = filtered.reduce((sum, i) => sum + i.count, 0);
  const totalCost = filtered.reduce((sum, i) => sum + i.totalCost, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resource Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filtered.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalResources)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Cost per Resource</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResources > 0 ? formatCurrency(totalCost / totalResources) : "$0"}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resource Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {hasFilters && (
            <div className="mb-2 flex items-center justify-between rounded-md bg-muted/30 px-3 py-1.5">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Filter className="h-3 w-3" />
                {filtered.length} of {inventory.length} types
              </span>
              <Button variant="ghost" size="sm" className="h-6 text-[11px]" onClick={() => { setFType(""); setFCountMin(""); setFCostMin(""); }}>Clear</Button>
            </div>
          )}
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead><SortHeader field="type">Resource Type</SortHeader></TableHead>
                  <TableHead className="text-right"><SortHeader field="count" align="right">Count</SortHeader></TableHead>
                  <TableHead className="text-right"><SortHeader field="totalCost" align="right">Total Cost</SortHeader></TableHead>
                  <TableHead className="text-right"><SortHeader field="costPerResource" align="right">Cost / Resource</SortHeader></TableHead>
                </TableRow>
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="py-1"></TableHead>
                  <TableHead className="py-1">
                    <input type="text" value={fType} onChange={(e) => setFType(e.target.value)} placeholder="Type..." className="h-6 w-full rounded border border-border/50 bg-background px-1.5 text-[11px] font-normal placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none" />
                  </TableHead>
                  <TableHead className="py-1">
                    <input type="text" value={fCountMin} onChange={(e) => setFCountMin(e.target.value)} placeholder="Min..." className="h-6 w-full rounded border border-border/50 bg-background px-1.5 text-[11px] font-normal text-right placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none" />
                  </TableHead>
                  <TableHead className="py-1">
                    <input type="text" value={fCostMin} onChange={(e) => setFCostMin(e.target.value)} placeholder="Min $..." className="h-6 w-full rounded border border-border/50 bg-background px-1.5 text-[11px] font-normal text-right placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none" />
                  </TableHead>
                  <TableHead className="py-1"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((item, i) => (
                  <TableRow key={item.type}>
                    <TableCell>
                      <div className="h-3 w-3 rounded-sm" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    </TableCell>
                    <TableCell className="font-medium text-sm">{item.type}</TableCell>
                    <TableCell className="text-right font-mono">{item.count}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(item.totalCost)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrencyPrecise(item.costPerResource)}</TableCell>
                  </TableRow>
                ))}
                {sorted.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">No types match the current filters.</TableCell>
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
