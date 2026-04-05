"use client";

import { useMemo } from "react";
import { useReport } from "@/components/reports/report-context";
import { groupByDimension, calculateFactTotals } from "@/lib/data/fact-helpers";
import { useCurrencyFormat } from "@/lib/hooks/use-currency-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, AlertTriangle, TrendingDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSortableTable } from "@/components/reports/sortable-header";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function HybridBenefitPage() {
  const { filteredFacts } = useReport();
  const { formatCurrency, formatCompact } = useCurrencyFormat();

  // Filter to commitment discount charges only
  const commitmentFacts = useMemo(
    () => filteredFacts.filter((f) => f.ChargeCategory === "Commitment Discount"),
    [filteredFacts]
  );

  const commitmentTotals = useMemo(
    () => calculateFactTotals(commitmentFacts),
    [commitmentFacts]
  );

  // Group commitment discounts by service category
  const commitmentByService = useMemo(
    () => groupByDimension(commitmentFacts, "ServiceCategory"),
    [commitmentFacts]
  );

  const chartData = useMemo(
    () =>
      commitmentByService.slice(0, 10).map((s) => ({
        service: s.name,
        effectiveCost: s.effectiveCost,
        savings: s.savings,
      })),
    [commitmentByService]
  );

  const { sorted, SortHeader } = useSortableTable(
    commitmentByService,
    "effectiveCost"
  );

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
              Azure Hybrid Benefit (AHUB)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pl-14">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Azure Hybrid Benefit lets you use your on-premises Windows Server
            and SQL Server licenses with Software Assurance on Azure, reducing
            compute costs by up to 40% for Windows VMs and up to 55% for SQL
            Server. It applies to Windows Server, SQL Server, and Linux
            subscription customers with qualifying licenses.
          </p>
        </CardContent>
      </Card>

      {/* Limitation Note */}
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardHeader className="flex flex-row items-start gap-3 pb-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              Data Limitation
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pl-14">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Full Azure Hybrid Benefit tracking requires the{" "}
            <code className="rounded bg-amber-200/50 px-1 py-0.5 text-xs dark:bg-amber-800/50">
              x_PricingSubcategory
            </code>{" "}
            field in the cost data, which is not currently available in the
            aggregated fact table. The data below shows commitment discount
            savings by service as useful context for understanding your overall
            license-related savings.
          </p>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Commitment Discount Cost
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {formatCompact(commitmentTotals.effectiveCost)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatCurrency(commitmentTotals.effectiveCost)} total
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
              {formatCompact(commitmentTotals.totalSavings)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {commitmentTotals.savingsPercent.toFixed(1)}% off list price
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Services with Commitments
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {commitmentByService.length}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Distinct service categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart: Commitment Savings by Service */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Top Commitment Discounts by Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                effectiveCost: {
                  label: "Effective Cost",
                  color: "var(--chart-1)",
                },
                savings: { label: "Savings", color: "var(--chart-2)" },
              }}
              className="h-[300px] w-full"
            >
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="service"
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
      )}

      {/* Commitment Discounts Table by Service */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Commitment Discounts by Service ({commitmentByService.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortHeader field="name">Service Category</SortHeader>
                  </TableHead>
                  <TableHead className="text-right">
                    <SortHeader field="effectiveCost" align="right">
                      Effective Cost
                    </SortHeader>
                  </TableHead>
                  <TableHead className="text-right">
                    <SortHeader field="listCost" align="right">
                      List Cost
                    </SortHeader>
                  </TableHead>
                  <TableHead className="text-right">
                    <SortHeader field="savings" align="right">
                      Savings
                    </SortHeader>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((s) => (
                  <TableRow key={s.name}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(s.effectiveCost)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(s.listCost)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span className="text-green-600 dark:text-green-400">
                        {formatCurrency(s.savings)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {sorted.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No commitment discount data available.
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
