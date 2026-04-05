"use client";

import { useMemo } from "react";
import { useReport } from "@/components/reports/report-context";
import {
  calculateFactTotals,
  groupByDimension,
} from "@/lib/data/fact-helpers";
import { useCurrencyFormat } from "@/lib/hooks/use-currency-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Info, DollarSign, Percent, TrendingDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSortableTable } from "@/components/reports/sortable-header";

export default function RecommendationsPage() {
  const { filteredFacts } = useReport();
  const { formatCurrency, formatCompact, currency } = useCurrencyFormat();

  // Overall totals
  const allTotals = useMemo(
    () => calculateFactTotals(filteredFacts),
    [filteredFacts]
  );

  // Filter to on-demand only
  const onDemandFacts = useMemo(
    () => filteredFacts.filter((f) => f.PricingCategory === "On-Demand"),
    [filteredFacts]
  );

  const onDemandTotals = useMemo(
    () => calculateFactTotals(onDemandFacts),
    [onDemandFacts]
  );

  const onDemandPercent = useMemo(
    () =>
      allTotals.effectiveCost > 0
        ? (onDemandTotals.effectiveCost / allTotals.effectiveCost) * 100
        : 0,
    [onDemandTotals, allTotals]
  );

  const potentialSavings = useMemo(
    () => onDemandTotals.effectiveCost * 0.3,
    [onDemandTotals]
  );

  // Top services by on-demand cost
  const topServicesByOnDemand = useMemo(
    () => groupByDimension(onDemandFacts, "ServiceCategory"),
    [onDemandFacts]
  );

  const serviceChartData = useMemo(
    () =>
      topServicesByOnDemand.slice(0, 10).map((s) => ({
        name: s.name,
        cost: s.effectiveCost,
      })),
    [topServicesByOnDemand]
  );

  // Top subscriptions by on-demand cost
  const topSubsByOnDemand = useMemo(
    () => groupByDimension(onDemandFacts, "SubAccountName"),
    [onDemandFacts]
  );

  const subChartData = useMemo(
    () =>
      topSubsByOnDemand.slice(0, 10).map((s) => ({
        name: s.name,
        cost: s.effectiveCost,
      })),
    [topSubsByOnDemand]
  );

  const {
    sorted: sortedServices,
    SortHeader: ServiceSortHeader,
  } = useSortableTable(topServicesByOnDemand, "effectiveCost");

  const {
    sorted: sortedSubs,
    SortHeader: SubSortHeader,
  } = useSortableTable(topSubsByOnDemand, "effectiveCost");

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardHeader className="flex flex-row items-start gap-3 pb-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              On-Demand Spend Analysis
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pl-14">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Full reservation recommendations require Azure Advisor API
            integration. Below is an analysis of your current on-demand spend to
            help identify commitment opportunities. Services with high on-demand
            costs are strong candidates for Reserved Instances or Savings Plans.
          </p>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total On-Demand Cost
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {formatCompact(onDemandTotals.effectiveCost)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatCurrency(onDemandTotals.effectiveCost)} total
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-500/10" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              On-Demand % of Total
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <Percent className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {onDemandPercent.toFixed(1)}%
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              of {formatCompact(allTotals.effectiveCost)} total spend
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent dark:from-green-500/10" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Potential Savings (30%)
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
              <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight text-green-600 dark:text-green-400">
              {formatCompact(potentialSavings)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              If 30% covered by commitments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Services by On-Demand Cost */}
      {serviceChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Top Services by On-Demand Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                cost: {
                  label: "On-Demand Cost",
                  color: "var(--chart-1)",
                },
              }}
              className="h-[300px] w-full"
            >
              <BarChart data={serviceChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-25}
                  textAnchor="end"
                  height={60}
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
                <Bar
                  dataKey="cost"
                  fill="var(--chart-1)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            On-Demand Cost by Service ({topServicesByOnDemand.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <ServiceSortHeader field="name">
                      Service Category
                    </ServiceSortHeader>
                  </TableHead>
                  <TableHead className="text-right">
                    <ServiceSortHeader field="effectiveCost" align="right">
                      On-Demand Cost
                    </ServiceSortHeader>
                  </TableHead>
                  <TableHead className="text-right">
                    <ServiceSortHeader field="listCost" align="right">
                      List Cost
                    </ServiceSortHeader>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedServices.map((s) => (
                  <TableRow key={s.name}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(s.effectiveCost)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(s.listCost)}
                    </TableCell>
                  </TableRow>
                ))}
                {sortedServices.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No on-demand cost data available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Top Subscriptions by On-Demand Cost */}
      {subChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Top Subscriptions by On-Demand Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                cost: {
                  label: "On-Demand Cost",
                  color: "var(--chart-3)",
                },
              }}
              className="h-[300px] w-full"
            >
              <BarChart data={subChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-25}
                  textAnchor="end"
                  height={60}
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
                <Bar
                  dataKey="cost"
                  fill="var(--chart-3)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            On-Demand Cost by Subscription ({topSubsByOnDemand.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SubSortHeader field="name">Subscription</SubSortHeader>
                  </TableHead>
                  <TableHead className="text-right">
                    <SubSortHeader field="effectiveCost" align="right">
                      On-Demand Cost
                    </SubSortHeader>
                  </TableHead>
                  <TableHead className="text-right">
                    <SubSortHeader field="listCost" align="right">
                      List Cost
                    </SubSortHeader>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSubs.map((s) => (
                  <TableRow key={s.name}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(s.effectiveCost)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(s.listCost)}
                    </TableCell>
                  </TableRow>
                ))}
                {sortedSubs.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No on-demand cost data available.
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
