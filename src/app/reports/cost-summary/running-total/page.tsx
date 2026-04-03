"use client";

import { useMemo } from "react";
import { useReport } from "@/components/reports/report-context";
import { getRunningTotal, calculateTotals } from "@/lib/data/cost-data";
import { formatCurrency, formatCompact } from "@/lib/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

export default function RunningTotalPage() {
  const { filteredData } = useReport();

  const runningTotal = useMemo(
    () => getRunningTotal(filteredData),
    [filteredData]
  );

  const totals = useMemo(() => calculateTotals(filteredData), [filteredData]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Running Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCompact(totals.effectiveCost)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCompact(totals.totalSavings)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Daily Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {runningTotal.length > 0
                ? formatCurrency(
                    totals.effectiveCost / runningTotal.length
                  )
                : "$0"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accumulated Cost Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              runningTotal: { label: "Running Total", color: "var(--chart-1)" },
            }}
            className="h-[400px] w-full"
          >
            <AreaChart data={runningTotal}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(v) =>
                  new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis tickFormatter={(v) => formatCompact(v)} tick={{ fontSize: 12 }} />
              <ChartTooltip
                content={
                  <ChartTooltipContent formatter={(v) => formatCurrency(v as number)} />
                }
              />
              <defs>
                <linearGradient id="fillRunning" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="runningTotal"
                stroke="var(--chart-1)"
                fill="url(#fillRunning)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily Cost</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              dailyCost: { label: "Daily Cost", color: "var(--chart-2)" },
              savings: { label: "Savings", color: "var(--chart-3)" },
            }}
            className="h-[300px] w-full"
          >
            <AreaChart data={runningTotal}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(v) =>
                  new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis tickFormatter={(v) => formatCompact(v)} tick={{ fontSize: 12 }} />
              <ChartTooltip
                content={
                  <ChartTooltipContent formatter={(v) => formatCurrency(v as number)} />
                }
              />
              <Area
                type="monotone"
                dataKey="dailyCost"
                stroke="var(--chart-2)"
                fill="var(--chart-2)"
                fillOpacity={0.15}
                strokeWidth={1.5}
              />
              <Area
                type="monotone"
                dataKey="savings"
                stroke="var(--chart-3)"
                fill="var(--chart-3)"
                fillOpacity={0.15}
                strokeWidth={1.5}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
