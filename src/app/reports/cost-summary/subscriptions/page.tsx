"use client";

import { useMemo } from "react";
import { useReport } from "@/components/reports/report-context";
import { groupByDimension } from "@/lib/data/fact-helpers";
import { CostTable } from "@/components/reports/cost-table";
import { MonthlyComparison } from "@/components/reports/monthly-comparison";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_COLORS } from "@/lib/utils/chart-colors";
import { useCurrencyFormat } from "@/lib/hooks/use-currency-format";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { buildChartConfig } from "@/lib/utils/chart-colors";

export default function SubscriptionsPage() {
  const { filteredFacts } = useReport();
  const { formatCurrency, formatCompact } = useCurrencyFormat();

  const grouped = useMemo(
    () => groupByDimension(filteredFacts, 'SubAccountName'),
    [filteredFacts]
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cost by Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={buildChartConfig(grouped.map((g) => g.name))}
            className="h-[300px] w-full"
          >
            <BarChart data={grouped} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => formatCompact(v)} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatCurrency(v as number)} />} />
              <Bar dataKey="effectiveCost" radius={[0, 4, 4, 0]}>
                {grouped.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <CostTable data={grouped} nameLabel="Subscription" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Monthly Comparison by Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyComparison
            data={filteredFacts}
            dimension="SubAccountName"
            nameLabel="Subscription"
          />
        </CardContent>
      </Card>
    </div>
  );
}
