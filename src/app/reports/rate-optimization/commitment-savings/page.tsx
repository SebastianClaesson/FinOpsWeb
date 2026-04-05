"use client";

import { useMemo } from "react";
import { useReport } from "@/components/reports/report-context";
import {
  calculateFactTotals,
  groupByDimension,
  groupFactsByDate,
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
import { TrendingDown, Percent, Sparkles } from "lucide-react";

export default function CommitmentSavingsPage() {
  const { formatCurrency, formatCompact, currency } = useCurrencyFormat();
  const { filteredFacts } = useReport();

  const commitmentFacts = useMemo(
    () => filteredFacts.filter((f) => f.PricingCategory === "Commitment Discount"),
    [filteredFacts]
  );

  const allTotals = useMemo(() => calculateFactTotals(filteredFacts), [filteredFacts]);
  const commitmentTotals = useMemo(
    () => calculateFactTotals(commitmentFacts),
    [commitmentFacts]
  );

  const commitmentSavings = useMemo(
    () => commitmentTotals.listCost - commitmentTotals.effectiveCost,
    [commitmentTotals]
  );

  const percentOfTotal = useMemo(
    () =>
      allTotals.effectiveCost > 0
        ? (commitmentTotals.effectiveCost / allTotals.effectiveCost) * 100
        : 0,
    [commitmentTotals, allTotals]
  );

  const monthlyCommitment = useMemo(() => {
    const monthly = groupFactsByDate(commitmentFacts, "month");
    return monthly.map((m) => ({
      month: formatMonth(m.date + "-01"),
      date: m.date,
      effectiveCost: m.effectiveCost,
      savings: m.savings,
    }));
  }, [commitmentFacts]);

  const byCommitmentType = useMemo(
    () => groupByDimension(commitmentFacts, "CommitmentDiscountType"),
    [commitmentFacts]
  );

  const bySubscription = useMemo(
    () => groupByDimension(commitmentFacts, "SubAccountName"),
    [commitmentFacts]
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Commitment Cost
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-xs font-bold text-primary">{currency}</span>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {formatCompact(commitmentTotals.effectiveCost)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatCurrency(commitmentTotals.effectiveCost)} effective cost
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent dark:from-green-500/10" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Commitment Savings
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
              <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight text-green-600 dark:text-green-400">
              {formatCompact(commitmentSavings)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {commitmentTotals.savingsPercent.toFixed(1)}% off list price
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent dark:from-blue-500/10" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              % of Total Spend
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <Percent className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight text-blue-500">
              {percentOfTotal.toFixed(1)}%
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Commitment share of effective cost
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Commitment Cost vs Savings</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyCommitment.length > 0 ? (
            <ChartContainer
              config={{
                effectiveCost: { label: "Effective Cost", color: "var(--chart-1)" },
                savings: { label: "Savings", color: "var(--chart-2)" },
              }}
              className="h-[300px] w-full"
            >
              <BarChart data={monthlyCommitment}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
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
                <Bar
                  dataKey="effectiveCost"
                  fill="var(--chart-1)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="savings"
                  fill="var(--chart-2)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
              No commitment discount data available.
            </div>
          )}
        </CardContent>
      </Card>

      {/* By Commitment Discount Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">By Commitment Discount Type</CardTitle>
        </CardHeader>
        <CardContent>
          <CostTable data={byCommitmentType} nameLabel="Discount Type" />
        </CardContent>
      </Card>

      {/* By Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">By Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <CostTable data={bySubscription} nameLabel="Subscription" />
        </CardContent>
      </Card>
    </div>
  );
}
