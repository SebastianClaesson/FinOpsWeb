"use client";

import { useMemo } from "react";
import { useReport } from "@/components/reports/report-context";
import { calculateTotals, groupByDate } from "@/lib/data/cost-data";
import { formatCurrency, formatCompact, formatMonth } from "@/lib/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { DollarSign, TrendingDown, Percent } from "lucide-react";

export default function RateOptimizationSummaryPage() {
  const { filteredData } = useReport();
  const totals = useMemo(() => calculateTotals(filteredData), [filteredData]);

  const effectiveSavingsRate = useMemo(
    () => (totals.listCost > 0 ? (totals.totalSavings / totals.listCost) * 100 : 0),
    [totals]
  );

  const monthlyCostVsSavings = useMemo(() => {
    const monthly = groupByDate(filteredData, "month");
    return monthly.map((m) => ({
      month: formatMonth(m.date + "-01"),
      date: m.date,
      effectiveCost: m.effectiveCost,
      savings: m.savings,
    }));
  }, [filteredData]);

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
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent dark:from-blue-500/10" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Effective Savings Rate
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <Percent className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight text-blue-500">
              {effectiveSavingsRate.toFixed(1)}%
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Savings / list cost</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Effective Cost vs Savings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Effective Cost vs Savings</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              effectiveCost: { label: "Effective Cost", color: "var(--chart-1)" },
              savings: { label: "Savings", color: "var(--chart-2)" },
            }}
            className="h-[300px] w-full"
          >
            <BarChart data={monthlyCostVsSavings}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => formatCompact(v)} tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatCurrency(v as number)} />} />
              <Bar dataKey="effectiveCost" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="savings" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
