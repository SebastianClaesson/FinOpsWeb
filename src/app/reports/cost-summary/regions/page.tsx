"use client";

import { useMemo, useState, useEffect } from "react";
import { useReport } from "@/components/reports/report-context";
import { groupByDimension } from "@/lib/data/fact-helpers";
import { CostTable } from "@/components/reports/cost-table";
import { MonthlyComparison } from "@/components/reports/monthly-comparison";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_COLORS, buildChartConfig } from "@/lib/utils/chart-colors";
import { useCurrencyFormat } from "@/lib/hooks/use-currency-format";
import { loadSettings } from "@/lib/config/user-settings";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, PieChart, Pie } from "recharts";
import { Target } from "lucide-react";

export default function RegionsPage() {
  const { filteredFacts } = useReport();
  const { formatCurrency, formatCompact } = useCurrencyFormat();
  const [regionBudgets, setRegionBudgets] = useState<Record<string, number>>({});
  const [yearlyBudget, setYearlyBudget] = useState(0);

  useEffect(() => {
    const s = loadSettings();
    setRegionBudgets(s.regionBudgets);
    setYearlyBudget(s.yearlyBudget);
  }, []);

  const grouped = useMemo(
    () => groupByDimension(filteredFacts, 'RegionName'),
    [filteredFacts]
  );

  const numMonths = useMemo(() => {
    const months = new Set(filteredFacts.map((row) => row.date.substring(0, 7)));
    return months.size || 1;
  }, [filteredFacts]);

  const hasBudgets = Object.values(regionBudgets).some((v) => v > 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={buildChartConfig(grouped.map((g) => g.name))}
              className="h-[300px] w-full"
            >
              <BarChart data={grouped}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => formatCompact(v)} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatCurrency(v as number)} />} />
                <Bar dataKey="effectiveCost" radius={[4, 4, 0, 0]}>
                  {grouped.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Regional Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={buildChartConfig(grouped.map((g) => g.name))}
              className="h-[300px] w-full"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatCurrency(v as number)} />} />
                <Pie
                  data={grouped}
                  dataKey="effectiveCost"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {grouped.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-2 flex flex-wrap gap-2 justify-center">
              {grouped.map((r, i) => (
                <div key={r.name} className="flex items-center gap-1 text-xs">
                  <div className="h-2.5 w-2.5 rounded-sm" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-muted-foreground">{r.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional Budget vs Actual */}
      {hasBudgets && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Budget vs Actual by Region
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-2 text-left font-medium">Region</th>
                    <th className="px-3 py-2 text-right font-medium">Actual ({numMonths}mo)</th>
                    <th className="px-3 py-2 text-right font-medium">Budget ({numMonths}mo)</th>
                    <th className="px-3 py-2 text-right font-medium">Remaining</th>
                    <th className="px-3 py-2 text-right font-medium">Used</th>
                    <th className="px-3 py-2 font-medium w-40">Progress</th>
                    <th className="px-3 py-2 text-right font-medium">Annual Pace</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped.map((region, i) => {
                    const yearlyBgt = regionBudgets[region.name] || 0;
                    if (yearlyBgt <= 0) return null;
                    const periodBgt = (yearlyBgt / 12) * numMonths;
                    const remaining = periodBgt - region.effectiveCost;
                    const pct = periodBgt > 0 ? (region.effectiveCost / periodBgt) * 100 : 0;
                    const isOver = pct > 100;
                    const annualPace = numMonths > 0 ? (region.effectiveCost / numMonths) * 12 : 0;
                    return (
                      <tr key={region.name} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-3 py-2 font-medium flex items-center gap-2">
                          <div className="h-3 w-3 rounded-sm shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                          {region.name}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {formatCurrency(region.effectiveCost)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                          {formatCurrency(periodBgt)}
                        </td>
                        <td className={`px-3 py-2 text-right font-mono ${isOver ? "text-red-500" : "text-green-600"}`}>
                          {isOver ? "-" : ""}{formatCurrency(Math.abs(remaining))}
                        </td>
                        <td className={`px-3 py-2 text-right font-mono ${isOver ? "text-red-500 font-semibold" : ""}`}>
                          {pct.toFixed(0)}%
                        </td>
                        <td className="px-3 py-2">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${isOver ? "bg-red-500" : "bg-primary"}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                          {formatCompact(annualPace)} / yr
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Regional budgets are configured in Settings. Regions without a budget are not shown.
            </p>
          </CardContent>
        </Card>
      )}

      <CostTable data={grouped} nameLabel="Region" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Comparison by Region</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyComparison
            data={filteredFacts}
            dimension="RegionName"
            nameLabel="Region"
          />
        </CardContent>
      </Card>
    </div>
  );
}
