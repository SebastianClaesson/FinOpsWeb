"use client";

import { useMemo } from "react";
import { useReport } from "@/components/reports/report-context";
import {
  groupByDimension,
  groupFactsByDateAndDimension,
} from "@/lib/data/fact-helpers";
import { CostTable } from "@/components/reports/cost-table";
import { formatMonth } from "@/lib/utils/format";
import { useCurrencyFormat } from "@/lib/hooks/use-currency-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { CHART_COLORS, buildChartConfig } from "@/lib/utils/chart-colors";

export default function ChargebackPage() {
  const { formatCurrency, formatCompact } = useCurrencyFormat();
  const { filteredFacts } = useReport();

  const commitmentFacts = useMemo(
    () => filteredFacts.filter((f) => f.PricingCategory === "Commitment Discount"),
    [filteredFacts]
  );

  const bySubscription = useMemo(
    () => groupByDimension(commitmentFacts, "SubAccountName"),
    [commitmentFacts]
  );

  const byResourceGroup = useMemo(
    () => groupByDimension(commitmentFacts, "x_ResourceGroupName"),
    [commitmentFacts]
  );

  const monthlyBySub = useMemo(
    () =>
      groupFactsByDateAndDimension(
        commitmentFacts,
        "SubAccountName",
        "month"
      ),
    [commitmentFacts]
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
      {/* By Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Commitment Cost by Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CostTable data={bySubscription} nameLabel="Subscription" />
        </CardContent>
      </Card>

      {/* By Resource Group */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Commitment Cost by Resource Group
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CostTable data={byResourceGroup} nameLabel="Resource Group" />
        </CardContent>
      </Card>

      {/* Monthly stacked bar by Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Monthly Commitment Cost by Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyBySub.length > 0 ? (
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
                <YAxis
                  tickFormatter={(v) => formatCompact(v)}
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(v) => formatCurrency(v as number)}
                    />
                  }
                />
                {subKeys.map((key, i) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    stackId="a"
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                    radius={
                      i === subKeys.length - 1 ? [4, 4, 0, 0] : 0
                    }
                  />
                ))}
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
              No commitment discount data available for the selected period.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
