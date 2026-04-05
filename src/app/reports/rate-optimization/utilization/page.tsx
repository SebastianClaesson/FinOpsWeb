"use client";

import { useMemo } from "react";
import { useReport } from "@/components/reports/report-context";
import {
  calculateFactTotals,
  groupFactsByDateAndDimension,
} from "@/lib/data/fact-helpers";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Percent, BarChart3 } from "lucide-react";

export default function UtilizationPage() {
  const { formatCurrency, formatCompact, currency } = useCurrencyFormat();
  const { filteredFacts } = useReport();

  const totals = useMemo(() => calculateFactTotals(filteredFacts), [filteredFacts]);

  const commitmentCost = useMemo(() => {
    let sum = 0;
    for (const f of filteredFacts) {
      if (f.PricingCategory === "Commitment Discount") {
        sum += f.effectiveCost;
      }
    }
    return Math.round(sum * 100) / 100;
  }, [filteredFacts]);

  const coveragePercent = useMemo(
    () =>
      totals.effectiveCost > 0
        ? (commitmentCost / totals.effectiveCost) * 100
        : 0,
    [commitmentCost, totals]
  );

  const onDemandCost = useMemo(
    () => Math.round((totals.effectiveCost - commitmentCost) * 100) / 100,
    [totals, commitmentCost]
  );

  // Monthly stacked bar: On-Demand vs Commitment Discount
  const monthlyByPricing = useMemo(
    () =>
      groupFactsByDateAndDimension(filteredFacts, "PricingCategory", "month"),
    [filteredFacts]
  );

  const pricingKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const row of monthlyByPricing) {
      for (const key of Object.keys(row)) {
        if (key !== "date") keys.add(key);
      }
    }
    return [...keys];
  }, [monthlyByPricing]);

  // Coverage by subscription
  const coverageBySubscription = useMemo(() => {
    const subMap = new Map<
      string,
      { onDemand: number; commitment: number; total: number }
    >();

    for (const f of filteredFacts) {
      const sub = f.SubAccountName;
      if (!subMap.has(sub)) {
        subMap.set(sub, { onDemand: 0, commitment: 0, total: 0 });
      }
      const entry = subMap.get(sub)!;
      entry.total += f.effectiveCost;
      if (f.PricingCategory === "Commitment Discount") {
        entry.commitment += f.effectiveCost;
      } else {
        entry.onDemand += f.effectiveCost;
      }
    }

    return Array.from(subMap.entries())
      .map(([name, costs]) => ({
        name,
        totalCost: Math.round(costs.total * 100) / 100,
        onDemandCost: Math.round(costs.onDemand * 100) / 100,
        commitmentCost: Math.round(costs.commitment * 100) / 100,
        onDemandPct:
          costs.total > 0
            ? Math.round((costs.onDemand / costs.total) * 10000) / 100
            : 0,
        commitmentPct:
          costs.total > 0
            ? Math.round((costs.commitment / costs.total) * 10000) / 100
            : 0,
      }))
      .sort((a, b) => b.totalCost - a.totalCost);
  }, [filteredFacts]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent dark:from-blue-500/10" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Commitment Coverage
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <Percent className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight text-blue-500">
              {coveragePercent.toFixed(1)}%
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Of total effective cost covered by commitments
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-500/10" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Commitment Cost
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <span className="text-xs font-bold text-amber-500">{currency}</span>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight text-amber-500">
              {formatCompact(commitmentCost)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatCurrency(commitmentCost)} commitment spend
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              On-Demand Cost
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {formatCompact(onDemandCost)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatCurrency(onDemandCost)} uncovered spend
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly stacked bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Monthly Cost by Pricing Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={buildChartConfig(pricingKeys)}
            className="h-[300px] w-full"
          >
            <BarChart data={monthlyByPricing}>
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
              {pricingKeys.map((key, i) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="a"
                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                  radius={
                    i === pricingKeys.length - 1 ? [4, 4, 0, 0] : 0
                  }
                />
              ))}
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Coverage by Subscription Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Commitment Coverage by Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subscription</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead className="text-right">Commitment Cost</TableHead>
                  <TableHead className="text-right">On-Demand Cost</TableHead>
                  <TableHead className="text-right">Commitment %</TableHead>
                  <TableHead className="text-right">On-Demand %</TableHead>
                  <TableHead className="w-32">Coverage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coverageBySubscription.map((sub) => (
                  <TableRow key={sub.name}>
                    <TableCell className="font-medium">{sub.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(sub.totalCost)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(sub.commitmentCost)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(sub.onDemandCost)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-blue-500">
                      {sub.commitmentPct.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {sub.onDemandPct.toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${sub.commitmentPct}%` }}
                        />
                        <div
                          className="h-full bg-muted-foreground/30 transition-all"
                          style={{ width: `${sub.onDemandPct}%` }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {coverageBySubscription.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No data available for the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
