"use client";

import { useMemo } from "react";
import { useReport } from "@/components/reports/report-context";
import { groupBy } from "@/lib/data/cost-data";
import { CostTable } from "@/components/reports/cost-table";
import { MonthlyComparison } from "@/components/reports/monthly-comparison";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_COLORS, buildChartConfig } from "@/lib/utils/chart-colors";
import { formatCompact, formatCurrency } from "@/lib/utils/format";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, PieChart, Pie } from "recharts";

export default function RegionsPage() {
  const { filteredData } = useReport();

  const grouped = useMemo(
    () => groupBy(filteredData, (r) => r.RegionName),
    [filteredData]
  );

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

      <CostTable data={grouped} nameLabel="Region" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Comparison by Region</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyComparison
            data={filteredData}
            keyFn={(r) => r.RegionName}
            nameLabel="Region"
          />
        </CardContent>
      </Card>
    </div>
  );
}
