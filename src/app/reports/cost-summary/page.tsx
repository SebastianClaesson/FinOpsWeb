"use client";

import { useReport } from "@/components/reports/report-context";
import { useMemo } from "react";
import {
  calculateTotals,
  groupBy,
  groupByDate,
  groupByDateAndDimension,
} from "@/lib/data/cost-data";
import { formatCurrency, formatCompact, formatPercent, formatMonth } from "@/lib/utils/format";
import { buildChartConfig, CHART_COLORS } from "@/lib/utils/chart-colors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";

export default function SummaryPage() {
  const { filteredData } = useReport();

  const totals = useMemo(() => calculateTotals(filteredData), [filteredData]);

  const topSubscriptions = useMemo(
    () => groupBy(filteredData, (r) => r.SubAccountName).slice(0, 10),
    [filteredData]
  );
  const topResourceGroups = useMemo(
    () => groupBy(filteredData, (r) => r.x_ResourceGroupName).slice(0, 10),
    [filteredData]
  );
  const topServices = useMemo(
    () => groupBy(filteredData, (r) => r.ServiceCategory).slice(0, 10),
    [filteredData]
  );

  const monthlyByPricing = useMemo(
    () =>
      groupByDateAndDimension(
        filteredData,
        (r) => r.PricingCategory,
        "month"
      ),
    [filteredData]
  );

  const dailyTrend = useMemo(
    () => groupByDate(filteredData, "day").slice(-30),
    [filteredData]
  );

  // Month-over-month cost trend for the "last 6 months" comparison
  const monthlyTrend = useMemo(() => {
    const monthly = groupByDate(filteredData, "month");
    return monthly.map((m, i) => {
      const prev = i > 0 ? monthly[i - 1].effectiveCost : m.effectiveCost;
      const changeAbs = m.effectiveCost - prev;
      const changePct = prev > 0 ? (changeAbs / prev) * 100 : 0;
      return {
        ...m,
        month: formatMonth(m.date + "-01"),
        changeAbs: Math.round(changeAbs * 100) / 100,
        changePct: Math.round(changePct * 100) / 100,
      };
    });
  }, [filteredData]);

  const pricingKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const row of monthlyByPricing) {
      for (const key of Object.keys(row)) {
        if (key !== "date") keys.add(key);
      }
    }
    return [...keys];
  }, [monthlyByPricing]);

  const pricingChartConfig = useMemo(
    () => buildChartConfig(pricingKeys),
    [pricingKeys]
  );

  const subChartConfig = useMemo(
    () => buildChartConfig(topSubscriptions.map((s) => s.name)),
    [topSubscriptions]
  );

  const lastMonthChange =
    monthlyTrend.length > 1
      ? monthlyTrend[monthlyTrend.length - 1].changePct
      : 0;
  const isUp = lastMonthChange > 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Effective Cost
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {formatCompact(totals.effectiveCost)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatCurrency(totals.effectiveCost)} total
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              List Cost
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {formatCompact(totals.listCost)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Before discounts</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent dark:from-green-500/10" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Savings
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
              <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight text-green-600 dark:text-green-400">
              {formatCompact(totals.totalSavings)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {totals.savingsPercent.toFixed(1)}% off list price
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${isUp ? "from-red-500/5 dark:from-red-500/10" : "from-green-500/5 dark:from-green-500/10"} to-transparent`}
          />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Month-over-Month
            </CardTitle>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${isUp ? "bg-red-500/10" : "bg-green-500/10"}`}
            >
              {isUp ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
              )}
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div
              className={`text-3xl font-bold tracking-tight ${isUp ? "text-red-500" : "text-green-600 dark:text-green-400"}`}
            >
              {monthlyTrend.length > 1 ? formatPercent(lastMonthChange) : "N/A"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">vs previous month</p>
          </CardContent>
        </Card>
      </div>

      {/* Month-over-Month Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Cost Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium">Month</th>
                  <th className="pb-2 font-medium text-right">Effective Cost</th>
                  <th className="pb-2 font-medium text-right">Change</th>
                  <th className="pb-2 font-medium text-right">Change %</th>
                </tr>
              </thead>
              <tbody>
                {monthlyTrend.map((m) => (
                  <tr key={m.date} className="border-b last:border-0">
                    <td className="py-2">{m.month}</td>
                    <td className="py-2 text-right font-mono">
                      {formatCurrency(m.effectiveCost)}
                    </td>
                    <td
                      className={`py-2 text-right font-mono ${
                        m.changeAbs > 0
                          ? "text-red-500"
                          : m.changeAbs < 0
                            ? "text-green-600"
                            : ""
                      }`}
                    >
                      {m.changeAbs > 0 ? "+" : ""}
                      {formatCurrency(m.changeAbs)}
                    </td>
                    <td
                      className={`py-2 text-right font-mono ${
                        m.changePct > 0
                          ? "text-red-500"
                          : m.changePct < 0
                            ? "text-green-600"
                            : ""
                      }`}
                    >
                      {formatPercent(m.changePct)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Monthly by Pricing Category (stacked bar) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Monthly Cost by Pricing Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={pricingChartConfig} className="h-[300px] w-full">
            <BarChart data={monthlyByPricing}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => formatMonth(v + "-01")}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(v) => formatCompact(v)}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) =>
                      formatCurrency(value as number)
                    }
                  />
                }
              />
              {pricingKeys.map((key, i) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="a"
                  fill={`var(--color-${key.replace(/\s+/g, "-")})`}
                  style={
                    {
                      [`--color-${key.replace(/\s+/g, "-")}`]:
                        CHART_COLORS[i % CHART_COLORS.length],
                    } as React.CSSProperties
                  }
                  radius={i === pricingKeys.length - 1 ? [4, 4, 0, 0] : 0}
                />
              ))}
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Daily Trend (last 30 days) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Daily Spend Trend (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ effectiveCost: { label: "Effective Cost", color: "var(--chart-1)" } }}
            className="h-[250px] w-full"
          >
            <AreaChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(v) =>
                  new Date(v).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={(v) => formatCompact(v)}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(value as number)}
                  />
                }
              />
              <defs>
                <linearGradient id="fillCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="effectiveCost"
                stroke="var(--chart-1)"
                fill="url(#fillCost)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Top 10 charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Top Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={subChartConfig}
              className="h-[300px] w-full"
            >
              <BarChart data={topSubscriptions} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(v) => formatCompact(v)}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) =>
                    v.length > 18 ? v.slice(0, 18) + "..." : v
                  }
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(value as number)}
                    />
                  }
                />
                <Bar dataKey="effectiveCost" radius={[0, 4, 4, 0]}>
                  {topSubscriptions.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Resource Groups */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Resource Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={buildChartConfig(topResourceGroups.map((r) => r.name))}
              className="h-[300px] w-full"
            >
              <BarChart data={topResourceGroups} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(v) => formatCompact(v)}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) =>
                    v.length > 18 ? v.slice(0, 18) + "..." : v
                  }
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(value as number)}
                    />
                  }
                />
                <Bar dataKey="effectiveCost" radius={[0, 4, 4, 0]}>
                  {topResourceGroups.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Services (Pie) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost by Service</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={buildChartConfig(topServices.map((s) => s.name))}
              className="h-[300px] w-full"
            >
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(value as number)}
                    />
                  }
                />
                <Pie
                  data={topServices}
                  dataKey="effectiveCost"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {topServices.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-2 flex flex-wrap gap-2 justify-center">
              {topServices.slice(0, 6).map((s, i) => (
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
      </div>
    </div>
  );
}
