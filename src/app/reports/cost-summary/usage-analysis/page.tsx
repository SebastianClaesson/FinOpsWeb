"use client";

import { useMemo, useState } from "react";
import { useReport } from "@/components/reports/report-context";
import { getUniqueValues } from "@/lib/data/cost-data";
import { formatCurrency, formatCompact, formatNumber } from "@/lib/utils/format";
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
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ZAxis,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { CHART_COLORS } from "@/lib/utils/chart-colors";

export default function UsageAnalysisPage() {
  const { filteredData } = useReport();

  const availableUnits = useMemo(
    () => getUniqueValues(filteredData, (r) => r.ConsumedUnit),
    [filteredData]
  );

  const [selectedUnit, setSelectedUnit] = useState(availableUnits[0] ?? "");

  const handleUnitChange = (value: string | null) => {
    if (value) setSelectedUnit(value);
  };

  const unitData = useMemo(() => {
    if (!selectedUnit) return [];

    const filtered = filteredData.filter(
      (r) => r.ConsumedUnit === selectedUnit
    );

    // Group by resource, sum quantity and cost
    const map = new Map<
      string,
      { name: string; quantity: number; cost: number }
    >();

    for (const record of filtered) {
      const existing = map.get(record.ResourceName);
      if (existing) {
        existing.quantity += record.ConsumedQuantity;
        existing.cost += record.EffectiveCost;
      } else {
        map.set(record.ResourceName, {
          name: record.ResourceName,
          quantity: record.ConsumedQuantity,
          cost: record.EffectiveCost,
        });
      }
    }

    return [...map.values()]
      .map((v) => ({
        ...v,
        quantity: Math.round(v.quantity),
        cost: Math.round(v.cost * 100) / 100,
        unitCost: v.quantity > 0 ? Math.round((v.cost / v.quantity) * 10000) / 10000 : 0,
      }))
      .sort((a, b) => b.cost - a.cost);
  }, [filteredData, selectedUnit]);

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
                config={{
                  cost: { label: "Effective Cost", color: "var(--chart-1)" },
                }}
                className="h-[350px] w-full"
              >
                <BarChart data={unitData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    yAxisId="cost"
                    tickFormatter={(v) => formatCompact(v)}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    yAxisId="qty"
                    orientation="right"
                    tickFormatter={(v) => formatNumber(v)}
                    tick={{ fontSize: 11 }}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                  />
                  <Bar yAxisId="cost" dataKey="cost" radius={[4, 4, 0, 0]}>
                    {unitData.map((_, i) => (
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
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-3 py-2 text-left font-medium">
                        Resource
                      </th>
                      <th className="px-3 py-2 text-right font-medium">
                        Quantity ({selectedUnit})
                      </th>
                      <th className="px-3 py-2 text-right font-medium">
                        Cost
                      </th>
                      <th className="px-3 py-2 text-right font-medium">
                        Unit Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {unitData.map((d) => (
                      <tr key={d.name} className="border-b last:border-0">
                        <td className="px-3 py-2 font-medium">{d.name}</td>
                        <td className="px-3 py-2 text-right font-mono">
                          {formatNumber(d.quantity)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {formatCurrency(d.cost)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          ${d.unitCost.toFixed(4)}
                        </td>
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
