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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { CHART_COLORS, buildChartConfig } from "@/lib/utils/chart-colors";
import { TrendingDown, Percent, BadgeDollarSign, Sparkles } from "lucide-react";

export default function TotalSavingsPage() {
  const { formatCurrency, formatCompact, currency } = useCurrencyFormat();
  const { filteredFacts } = useReport();

  const totals = useMemo(() => calculateFactTotals(filteredFacts), [filteredFacts]);

  const totalSavings = useMemo(
    () => totals.listCost - totals.effectiveCost,
    [totals]
  );

  const savingsRate = useMemo(
    () => (totals.listCost > 0 ? (totalSavings / totals.listCost) * 100 : 0),
    [totals, totalSavings]
  );

  const negotiatedSavings = useMemo(() => {
    const nonCommitmentNonOnDemand = filteredFacts.filter(
      (f) =>
        f.PricingCategory !== "Commitment Discount" &&
        f.PricingCategory !== "On-Demand"
    );
    let listCost = 0;
    let effectiveCost = 0;
    for (const f of nonCommitmentNonOnDemand) {
      listCost += f.listCost;
      effectiveCost += f.effectiveCost;
    }
    return Math.round((listCost - effectiveCost) * 100) / 100;
  }, [filteredFacts]);

  const commitmentSavings = useMemo(() => {
    const commitmentFacts = filteredFacts.filter(
      (f) => f.PricingCategory === "Commitment Discount"
    );
    let listCost = 0;
    let effectiveCost = 0;
    for (const f of commitmentFacts) {
      listCost += f.listCost;
      effectiveCost += f.effectiveCost;
    }
    return Math.round((listCost - effectiveCost) * 100) / 100;
  }, [filteredFacts]);

  const byPricingCategory = useMemo(
    () => groupByDimension(filteredFacts, "PricingCategory"),
    [filteredFacts]
  );

  const savingsByPricingCategory = useMemo(
    () => byPricingCategory.filter((g) => g.savings > 0).sort((a, b) => b.savings - a.savings),
    [byPricingCategory]
  );

  const monthlySavings = useMemo(() => {
    const monthly = groupFactsByDate(filteredFacts, "month");
    return monthly.map((m) => ({
      month: formatMonth(m.date + "-01"),
      date: m.date,
      savings: m.savings,
      effectiveCost: m.effectiveCost,
    }));
  }, [filteredFacts]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              {formatCompact(totalSavings)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatCurrency(totalSavings)} total
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent dark:from-blue-500/10" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Savings Rate
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <Percent className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight text-blue-500">
              {savingsRate.toFixed(1)}%
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Of list cost
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent dark:from-purple-500/10" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Negotiated Savings
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
              <BadgeDollarSign className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight text-purple-500">
              {formatCompact(negotiatedSavings)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Non-commitment discounts
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-500/10" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Commitment Savings
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <Sparkles className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight text-amber-500">
              {formatCompact(commitmentSavings)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Reservation &amp; savings plans
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Pie: Savings by Pricing Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Savings by Pricing Category</CardTitle>
          </CardHeader>
          <CardContent>
            {savingsByPricingCategory.length > 0 ? (
              <>
                <ChartContainer
                  config={buildChartConfig(savingsByPricingCategory.map((g) => g.name))}
                  className="h-[300px] w-full"
                >
                  <PieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(v) => formatCurrency(v as number)}
                        />
                      }
                    />
                    <Pie
                      data={savingsByPricingCategory}
                      dataKey="savings"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                    >
                      {savingsByPricingCategory.map((_, i) => (
                        <Cell
                          key={i}
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="mt-2 flex flex-wrap gap-2 justify-center">
                  {savingsByPricingCategory.map((s, i) => (
                    <div key={s.name} className="flex items-center gap-1 text-xs">
                      <div
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{
                          background: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                      <span className="text-muted-foreground">{s.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                No savings data available.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Bar: Savings over time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Savings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                savings: { label: "Savings", color: "var(--chart-2)" },
                effectiveCost: { label: "Effective Cost", color: "var(--chart-1)" },
              }}
              className="h-[300px] w-full"
            >
              <BarChart data={monthlySavings}>
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
          </CardContent>
        </Card>
      </div>

      {/* CostTable by Pricing Category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Breakdown by Pricing Category</CardTitle>
        </CardHeader>
        <CardContent>
          <CostTable data={byPricingCategory} nameLabel="Pricing Category" />
        </CardContent>
      </Card>
    </div>
  );
}
