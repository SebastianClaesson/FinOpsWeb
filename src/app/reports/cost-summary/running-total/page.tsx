"use client";

import { useMemo, useState, useEffect } from "react";
import { useReport } from "@/components/reports/report-context";
import { getFactRunningTotal, calculateFactTotals } from "@/lib/data/fact-helpers";
import { useCurrencyFormat } from "@/lib/hooks/use-currency-format";
import { loadSettings } from "@/lib/config/user-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Target } from "lucide-react";

export default function RunningTotalPage() {
  const { filteredFacts } = useReport();
  const { formatCurrency, formatCompact } = useCurrencyFormat();
  const [yearlyBudget, setYearlyBudget] = useState(0);

  useEffect(() => {
    setYearlyBudget(loadSettings().yearlyBudget);
  }, []);

  const runningTotal = useMemo(
    () => getFactRunningTotal(filteredFacts),
    [filteredFacts]
  );

  const totals = useMemo(() => calculateFactTotals(filteredFacts), [filteredFacts]);

  const numMonths = useMemo(() => {
    const months = new Set(filteredFacts.map((row) => row.date.substring(0, 7)));
    return months.size || 1;
  }, [filteredFacts]);

  const periodBudget = yearlyBudget > 0 ? (yearlyBudget / 12) * numMonths : 0;
  const pctUsed = periodBudget > 0 ? (totals.effectiveCost / periodBudget) * 100 : 0;
  const isOver = pctUsed > 100;
  const annualPace = numMonths > 0 ? (totals.effectiveCost / numMonths) * 12 : 0;
  const annualPacePct = yearlyBudget > 0 ? (annualPace / yearlyBudget) * 100 : 0;

  // Add budget line to running total chart data
  const runningTotalWithBudget = useMemo(() => {
    if (periodBudget <= 0 || runningTotal.length === 0) return runningTotal;
    const totalDays = runningTotal.length;
    const dailyBudget = periodBudget / totalDays;
    return runningTotal.map((d, i) => ({
      ...d,
      budgetLine: Math.round(dailyBudget * (i + 1) * 100) / 100,
    }));
  }, [runningTotal, periodBudget]);

  return (
    <div className="space-y-6">
      <div className={`grid gap-4 ${yearlyBudget > 0 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"}`}>
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
                ? formatCurrency(totals.effectiveCost / runningTotal.length)
                : "$0"}
            </div>
          </CardContent>
        </Card>

        {yearlyBudget > 0 && (
          <Card className="relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${isOver ? "from-red-500/5 dark:from-red-500/10" : "from-primary/5"} to-transparent`} />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Budget
              </CardTitle>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isOver ? "bg-red-500/10" : "bg-primary/10"}`}>
                <Target className={`h-4 w-4 ${isOver ? "text-red-500" : "text-primary"}`} />
              </div>
            </CardHeader>
            <CardContent className="relative space-y-2">
              <div className={`text-2xl font-bold tracking-tight ${isOver ? "text-red-500" : ""}`}>
                {pctUsed.toFixed(0)}%
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${isOver ? "bg-red-500" : "bg-primary"}`}
                  style={{ width: `${Math.min(pctUsed, 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {formatCompact(totals.effectiveCost)} of {formatCompact(periodBudget)} ({numMonths}mo)
              </p>
              <p className="text-[11px] text-muted-foreground">
                Annual pace: {formatCompact(annualPace)} / {formatCompact(yearlyBudget)} ({annualPacePct.toFixed(0)}%)
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Accumulated Cost Over Time
            {yearlyBudget > 0 && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                (dashed line = budget pace)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              runningTotal: { label: "Running Total", color: "var(--chart-1)" },
              ...(yearlyBudget > 0
                ? { budgetLine: { label: "Budget Pace", color: "var(--destructive)" } }
                : {}),
            }}
            className="h-[400px] w-full"
          >
            <AreaChart data={runningTotalWithBudget}>
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
              {yearlyBudget > 0 && (
                <Area
                  type="monotone"
                  dataKey="budgetLine"
                  stroke="var(--destructive)"
                  strokeWidth={1.5}
                  strokeDasharray="6 3"
                  fill="none"
                />
              )}
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
