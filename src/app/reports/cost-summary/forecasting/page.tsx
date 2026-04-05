"use client";

import { useMemo, useState } from "react";
import { useReport } from "@/components/reports/report-context";
import {
  generateForecast,
  groupFactsByDate,
  calculateFactTotals,
} from "@/lib/data/fact-helpers";
import { useCurrencyFormat } from "@/lib/hooks/use-currency-format";
import { formatDate } from "@/lib/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { TrendingUp } from "lucide-react";

const PROJECTION_OPTIONS = [7, 14, 30, 60, 90] as const;

export default function ForecastingPage() {
  const { filteredFacts } = useReport();
  const { formatCurrency, formatCompact } = useCurrencyFormat();
  const [forecastDays, setForecastDays] = useState(30);

  const historical = useMemo(
    () => groupFactsByDate(filteredFacts, "day"),
    [filteredFacts]
  );

  const forecast = useMemo(
    () => generateForecast(filteredFacts, forecastDays, 60),
    [filteredFacts, forecastDays]
  );

  const totals = useMemo(
    () => calculateFactTotals(filteredFacts),
    [filteredFacts]
  );

  // KPIs
  const projected30DayCost = useMemo(() => {
    const fc = generateForecast(filteredFacts, 30, 60);
    return fc.reduce((sum, p) => sum + p.forecastCost, 0);
  }, [filteredFacts]);

  const dailyAverage = useMemo(() => {
    if (historical.length === 0) return 0;
    return totals.effectiveCost / historical.length;
  }, [totals, historical]);

  const monthlyRunRate = dailyAverage * 30;

  const trendDirection = useMemo(() => {
    if (forecast.length < 2) return 0;
    const first = forecast[0].forecastCost;
    const last = forecast[forecast.length - 1].forecastCost;
    if (first === 0) return 0;
    return ((last - first) / first) * 100;
  }, [forecast]);

  // Chart data: merge historical and forecast
  const chartData = useMemo(() => {
    const histEntries = historical.map((d) => ({
      date: d.date,
      historicalCost: d.effectiveCost,
      forecastCost: null as number | null,
      upperBound: null as number | null,
      lowerBound: null as number | null,
    }));

    // Bridge: last historical point also appears as first forecast point
    const forecastEntries = forecast.map((f) => ({
      date: f.date,
      historicalCost: null as number | null,
      forecastCost: f.forecastCost,
      upperBound: f.upperBound,
      lowerBound: f.lowerBound,
    }));

    // Add a bridge point so lines connect
    if (histEntries.length > 0 && forecastEntries.length > 0) {
      const lastHist = histEntries[histEntries.length - 1];
      forecastEntries.unshift({
        date: lastHist.date,
        historicalCost: null,
        forecastCost: lastHist.historicalCost,
        upperBound: lastHist.historicalCost,
        lowerBound: lastHist.historicalCost,
      });
    }

    return [...histEntries, ...forecastEntries];
  }, [historical, forecast]);

  const chartConfig = {
    historicalCost: { label: "Historical Cost", color: "var(--chart-1)" },
    forecastCost: { label: "Forecast", color: "hsl(25 95% 53%)" },
    upperBound: { label: "Upper Bound", color: "hsl(25 95% 53% / 0.2)" },
    lowerBound: { label: "Lower Bound", color: "hsl(25 95% 53% / 0.2)" },
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Projected 30-Day Cost
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {formatCompact(projected30DayCost)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              next 30 days forecast total
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent dark:from-blue-500/10" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Monthly Run Rate
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <span className="text-xs font-bold text-blue-500">MRR</span>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {formatCompact(monthlyRunRate)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              avg daily cost x 30
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent dark:from-orange-500/10" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Trend Direction
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div
              className={`text-3xl font-bold tracking-tight ${
                trendDirection > 0
                  ? "text-red-500"
                  : trendDirection < 0
                  ? "text-green-500"
                  : ""
              }`}
            >
              {trendDirection > 0 ? "+" : ""}
              {trendDirection.toFixed(1)}%
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {trendDirection > 0
                ? "costs increasing"
                : trendDirection < 0
                ? "costs decreasing"
                : "flat trend"}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent dark:from-emerald-500/10" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Daily Average
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <span className="text-xs font-bold text-emerald-500">AVG</span>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {formatCompact(dailyAverage)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              across {historical.length} days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projection Slider */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Projection Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label
              htmlFor="forecastDays"
              className="text-sm text-muted-foreground whitespace-nowrap"
            >
              Forecast Days
            </label>
            <input
              id="forecastDays"
              type="range"
              min={0}
              max={PROJECTION_OPTIONS.length - 1}
              step={1}
              value={PROJECTION_OPTIONS.indexOf(forecastDays as (typeof PROJECTION_OPTIONS)[number])}
              onChange={(e) =>
                setForecastDays(PROJECTION_OPTIONS[parseInt(e.target.value)])
              }
              className="w-full max-w-xs accent-primary"
            />
            <span className="text-sm font-mono font-medium w-16 text-right">
              {forecastDays} days
            </span>
          </div>
          <div className="mt-2 flex gap-2">
            {PROJECTION_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setForecastDays(d)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  forecastDays === d
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Cost Forecast ({forecastDays}-Day Projection)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historical.length < 7 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Not enough historical data to generate a forecast. At least 7 days
              of data required.
            </p>
          ) : (
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <ComposedChart data={chartData}>
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
                      formatter={(value) =>
                        value != null ? formatCurrency(value as number) : "---"
                      }
                      labelFormatter={(label) => formatDate(label as string)}
                    />
                  }
                />
                {/* Confidence band */}
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="none"
                  fill="hsl(25 95% 53% / 0.15)"
                  fillOpacity={1}
                  name="Upper Bound"
                  connectNulls={false}
                />
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="none"
                  fill="hsl(0 0% 100%)"
                  fillOpacity={1}
                  name="Lower Bound"
                  connectNulls={false}
                />
                {/* Historical line */}
                <Line
                  type="monotone"
                  dataKey="historicalCost"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={false}
                  name="Historical Cost"
                  connectNulls={false}
                />
                {/* Forecast line */}
                <Line
                  type="monotone"
                  dataKey="forecastCost"
                  stroke="hsl(25 95% 53%)"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={false}
                  name="Forecast"
                  connectNulls={false}
                />
              </ComposedChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Forecast Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Projected Daily Costs</CardTitle>
        </CardHeader>
        <CardContent>
          {forecast.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <TrendingUp className="mb-3 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm">
                No forecast data available. Need at least 7 days of historical
                data.
              </p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Forecast</TableHead>
                    <TableHead className="text-right">Lower Bound</TableHead>
                    <TableHead className="text-right">Upper Bound</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forecast.map((f) => (
                    <TableRow key={f.date}>
                      <TableCell>{formatDate(f.date)}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(f.forecastCost)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {formatCurrency(f.lowerBound)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {formatCurrency(f.upperBound)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
