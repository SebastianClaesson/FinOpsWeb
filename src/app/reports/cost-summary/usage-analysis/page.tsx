"use client";

import { useMemo, useState } from "react";
import { useReport } from "@/components/reports/report-context";
import { UsageDetail } from "@/lib/types/aggregated";
import { formatNumber } from "@/lib/utils/format";
import { useCurrencyFormat } from "@/lib/hooks/use-currency-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { CHART_COLORS } from "@/lib/utils/chart-colors";
import { useSortableTable } from "@/components/reports/sortable-header";

interface UsageRow {
  name: string;
  quantity: number;
  cost: number;
  unitCost: number;
}

export default function UsageAnalysisPage() {
  const { usage } = useReport();
  const { formatCurrency, formatCompact } = useCurrencyFormat();

  const availableUnits = useMemo(() => {
    const set = new Set<string>();
    for (const u of usage) {
      if (u.ConsumedUnit) set.add(u.ConsumedUnit);
    }
    return [...set].sort();
  }, [usage]);

  const [selectedUnit, setSelectedUnit] = useState(availableUnits[0] ?? "");

  const handleUnitChange = (value: string | null) => {
    if (value) setSelectedUnit(value);
  };

  const unitData = useMemo(() => {
    if (!selectedUnit) return [];

    return usage
      .filter((u: UsageDetail) => u.ConsumedUnit === selectedUnit)
      .map((u: UsageDetail) => ({
        name: u.ResourceName,
        quantity: Math.round(u.consumedQuantity),
        cost: Math.round(u.effectiveCost * 100) / 100,
        unitCost: u.consumedQuantity > 0 ? Math.round((u.effectiveCost / u.consumedQuantity) * 10000) / 10000 : 0,
      }));
  }, [usage, selectedUnit]);

  const { sorted, SortHeader } = useSortableTable(unitData, "cost");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Usage Unit:</label>
        <Select value={selectedUnit} onValueChange={handleUnitChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select a unit..." />
          </SelectTrigger>
          <SelectContent>
            {availableUnits.map((unit) => (
              <SelectItem key={unit} value={unit}>
                {unit}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {unitData.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Quantity vs Cost ({selectedUnit})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{ cost: { label: "Effective Cost", color: "var(--chart-1)" } }}
                className="h-[350px] w-full"
              >
                <BarChart data={sorted}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis yAxisId="cost" tickFormatter={(v) => formatCompact(v)} tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="qty" orientation="right" tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar yAxisId="cost" dataKey="cost" radius={[4, 4, 0, 0]}>
                    {sorted.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Usage Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-3 py-2 text-left"><SortHeader field="name">Resource</SortHeader></th>
                      <th className="px-3 py-2 text-right"><SortHeader field="quantity" align="right">Quantity ({selectedUnit})</SortHeader></th>
                      <th className="px-3 py-2 text-right"><SortHeader field="cost" align="right">Cost</SortHeader></th>
                      <th className="px-3 py-2 text-right"><SortHeader field="unitCost" align="right">Unit Cost</SortHeader></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((d) => (
                      <tr key={d.name} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-3 py-2 font-medium">{d.name}</td>
                        <td className="px-3 py-2 text-right font-mono">{formatNumber(d.quantity)}</td>
                        <td className="px-3 py-2 text-right font-mono">{formatCurrency(d.cost)}</td>
                        <td className="px-3 py-2 text-right font-mono">${d.unitCost.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
