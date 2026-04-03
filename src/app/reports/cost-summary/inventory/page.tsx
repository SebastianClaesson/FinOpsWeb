"use client";

import { useMemo } from "react";
import { useReport } from "@/components/reports/report-context";
import { formatCurrency, formatCurrencyPrecise, formatNumber } from "@/lib/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CHART_COLORS } from "@/lib/utils/chart-colors";

export default function InventoryPage() {
  const { filteredData } = useReport();

  const inventory = useMemo(() => {
    const map = new Map<
      string,
      { type: string; resources: Set<string>; totalCost: number }
    >();

    for (const record of filteredData) {
      const existing = map.get(record.ResourceType);
      if (existing) {
        existing.resources.add(record.ResourceName);
        existing.totalCost += record.EffectiveCost;
      } else {
        map.set(record.ResourceType, {
          type: record.ResourceType,
          resources: new Set([record.ResourceName]),
          totalCost: record.EffectiveCost,
        });
      }
    }

    return [...map.values()]
      .map((item) => ({
        type: item.type,
        count: item.resources.size,
        totalCost: Math.round(item.totalCost * 100) / 100,
        costPerResource:
          Math.round((item.totalCost / item.resources.size) * 100) / 100,
      }))
      .sort((a, b) => b.totalCost - a.totalCost);
  }, [filteredData]);

  const totalResources = inventory.reduce((sum, i) => sum + i.count, 0);
  const totalCost = inventory.reduce((sum, i) => sum + i.totalCost, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resource Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(totalResources)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Cost per Resource
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalResources > 0
                ? formatCurrency(totalCost / totalResources)
                : "$0"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resource Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Resource Type</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead className="text-right">Cost / Resource</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item, i) => (
                  <TableRow key={item.type}>
                    <TableCell>
                      <div
                        className="h-3 w-3 rounded-sm"
                        style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {item.type}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {item.count}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(item.totalCost)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrencyPrecise(item.costPerResource)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
