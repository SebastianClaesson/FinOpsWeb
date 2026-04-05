"use client";

import { useMemo } from "react";
import { useReport } from "@/components/reports/report-context";
import { groupByDimension, groupFactsByDateAndDimension } from "@/lib/data/fact-helpers";
import { CostTable } from "@/components/reports/cost-table";
import { ChargebackExport } from "@/components/export/chargeback-export";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_COLORS, buildChartConfig } from "@/lib/utils/chart-colors";
import { formatMonth } from "@/lib/utils/format";
import { useCurrencyFormat } from "@/lib/hooks/use-currency-format";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function ChargebackPage() {
  const { formatCurrency, formatCompact } = useCurrencyFormat();
  const { filteredFacts, filters, currency } = useReport();

  const bySubscription = useMemo(
    () => groupByDimension(filteredFacts, "SubAccountName"),
    [filteredFacts]
  );

  const byResourceGroup = useMemo(
    () => groupByDimension(filteredFacts, "x_ResourceGroupName"),
    [filteredFacts]
  );

  const monthlyBySub = useMemo(
    () => groupFactsByDateAndDimension(filteredFacts, "SubAccountName", "month"),
    [filteredFacts]
  );

  const subKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const row of monthlyBySub) {
      for (const key of Object.keys(row)) {
        if (key !== "date") keys.add(key);
      }
    }
    return [...keys];
  }, [monthlyBySub]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <ChargebackExport
          bySubscription={bySubscription}
          byResourceGroup={byResourceGroup}
          dateRange={filters.dateRange}
          currency={currency}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Effective Cost by Subscription (Chargeback)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CostTable data={bySubscription} nameLabel="Subscription" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Effective Cost by Resource Group
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CostTable data={byResourceGroup} nameLabel="Resource Group" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Monthly Comparison by Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={buildChartConfig(subKeys)}
            className="h-[300px] w-full"
          >
            <BarChart data={monthlyBySub}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => formatMonth(v + "-01")}
                tick={{ fontSize: 11 }}
              />
              <YAxis tickFormatter={(v) => formatCompact(v)} tick={{ fontSize: 11 }} />
              <ChartTooltip
                content={<ChartTooltipContent formatter={(v) => formatCurrency(v as number)} />}
              />
              {subKeys.map((key, i) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="a"
                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                  radius={i === subKeys.length - 1 ? [4, 4, 0, 0] : 0}
                />
              ))}
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
