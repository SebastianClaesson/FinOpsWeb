"use client";

import { useMemo } from "react";
import { useReport } from "@/components/reports/report-context";
import { groupBy } from "@/lib/data/cost-data";
import { CostTable } from "@/components/reports/cost-table";
import { MonthlyComparison } from "@/components/reports/monthly-comparison";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_COLORS } from "@/lib/utils/chart-colors";
import { formatCompact, formatCurrency } from "@/lib/utils/format";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { buildChartConfig } from "@/lib/utils/chart-colors";

export default function ResourceGroupsPage() {
  const { filteredData } = useReport();

  const grouped = useMemo(
    () => groupBy(filteredData, (r) => r.x_ResourceGroupName),
    [filteredData]
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cost by Resource Group</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={buildChartConfig(grouped.slice(0, 10).map((g) => g.name))}
            className="h-[350px] w-full"
          >
            <BarChart data={grouped.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => formatCompact(v)} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatCurrency(v as number)} />} />
              <Bar dataKey="effectiveCost" radius={[0, 4, 4, 0]}>
                {grouped.slice(0, 10).map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <CostTable data={grouped} nameLabel="Resource Group" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Comparison by Resource Group</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyComparison
            data={filteredData}
            keyFn={(r) => r.x_ResourceGroupName}
            nameLabel="Resource Group"
          />
        </CardContent>
      </Card>
    </div>
  );
}
