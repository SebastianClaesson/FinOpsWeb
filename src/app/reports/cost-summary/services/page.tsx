"use client";

import { useMemo } from "react";
import { useReport } from "@/components/reports/report-context";
import { groupByDimension, groupFactsByDateAndDimension } from "@/lib/data/fact-helpers";
import { CostTable } from "@/components/reports/cost-table";
import { MonthlyComparison } from "@/components/reports/monthly-comparison";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_COLORS, buildChartConfig } from "@/lib/utils/chart-colors";
import { formatMonth } from "@/lib/utils/format";
import { useCurrencyFormat } from "@/lib/hooks/use-currency-format";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from "recharts";

export default function ServicesPage() {
  const { filteredFacts } = useReport();
  const { formatCurrency, formatCompact } = useCurrencyFormat();

  const byCategory = useMemo(
    () => groupByDimension(filteredFacts, 'ServiceCategory'),
    [filteredFacts]
  );

  const byName = useMemo(
    () => groupByDimension(filteredFacts, 'ServiceName'),
    [filteredFacts]
  );

  const byMeter = useMemo(
    () => groupByDimension(filteredFacts, 'x_SkuMeterCategory'),
    [filteredFacts]
  );

  const monthlyByService = useMemo(
    () =>
      groupFactsByDateAndDimension(
        filteredFacts,
        'ServiceCategory',
        "month"
      ),
    [filteredFacts]
  );

  const serviceKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const row of monthlyByService) {
      for (const key of Object.keys(row)) {
        if (key !== "date") keys.add(key);
      }
    }
    return [...keys];
  }, [monthlyByService]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost by Service Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={buildChartConfig(byCategory.map((g) => g.name))}
              className="h-[300px] w-full"
            >
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent formatter={(v) => formatCurrency(v as number)} />}
                />
                <Pie
                  data={byCategory}
                  dataKey="effectiveCost"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-2 flex flex-wrap gap-2 justify-center">
              {byCategory.map((s, i) => (
                <div key={s.name} className="flex items-center gap-1 text-xs">
                  <div
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="text-muted-foreground">{s.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Monthly by Service Category (Stacked)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={buildChartConfig(serviceKeys)}
              className="h-[300px] w-full"
            >
              <BarChart data={monthlyByService}>
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
                {serviceKeys.map((key, i) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    stackId="a"
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                    radius={i === serviceKeys.length - 1 ? [4, 4, 0, 0] : 0}
                  />
                ))}
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <CostTable data={byCategory} nameLabel="Service Category" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cost by Service Name</CardTitle>
        </CardHeader>
        <CardContent>
          <CostTable data={byName} nameLabel="Service Name" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cost by Meter Category</CardTitle>
        </CardHeader>
        <CardContent>
          <CostTable data={byMeter} nameLabel="Meter Category" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Comparison by Service</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyComparison
            data={filteredFacts}
            dimension="ServiceCategory"
            nameLabel="Service Category"
          />
        </CardContent>
      </Card>
    </div>
  );
}
