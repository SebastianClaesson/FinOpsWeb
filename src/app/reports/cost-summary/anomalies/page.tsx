"use client";

import { useMemo, useState } from "react";
import { useReport } from "@/components/reports/report-context";
import { detectAnomalies } from "@/lib/data/fact-helpers";
import { useCurrencyFormat } from "@/lib/hooks/use-currency-format";
import { formatDate, formatPercent } from "@/lib/utils/format";
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
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { AlertTriangle } from "lucide-react";

export default function AnomaliesPage() {
  const { filteredFacts } = useReport();
  const { formatCurrency, formatCompact } = useCurrencyFormat();
  const [threshold, setThreshold] = useState(2.0);

  const allPoints = useMemo(
    () => detectAnomalies(filteredFacts, 30, threshold),
    [filteredFacts, threshold]
  );

  const anomalies = useMemo(
    () => allPoints.filter((p) => p.isAnomaly),
    [allPoints]
  );

  // Chart data: every point gets cost + mean line; anomaly points get a separate key
  const chartData = useMemo(
    () =>
      allPoints.map((p) => ({
        date: p.date,
        cost: p.cost,
        rollingAvg: p.mean,
        anomalyCost: p.isAnomaly ? p.cost : null,
      })),
    [allPoints]
  );

  // KPI computations
  const anomalyCount = anomalies.length;

  const highestSpike = useMemo(() => {
    if (anomalies.length === 0) return null;
    return anomalies.reduce((max, a) => (a.cost > max.cost ? a : max), anomalies[0]);
  }, [anomalies]);

  const averageDailyCost = useMemo(() => {
    if (allPoints.length === 0) return 0;
    return allPoints.reduce((sum, p) => sum + p.cost, 0) / allPoints.length;
  }, [allPoints]);

  const totalExcessCost = useMemo(
    () =>
      anomalies.reduce((sum, a) => sum + Math.max(0, a.cost - a.mean), 0),
    [anomalies]
  );

  // Anomaly table sorted by date descending
  const sortedAnomalies = useMemo(
    () => [...anomalies].sort((a, b) => b.date.localeCompare(a.date)),
    [anomalies]
  );

  const chartConfig = {
    cost: { label: "Daily Cost", color: "var(--chart-1)" },
    rollingAvg: { label: "Rolling Average", color: "var(--chart-2)" },
    anomalyCost: { label: "Anomaly", color: "hsl(0 84% 60%)" },
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-500/10" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Anomalies Detected
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {anomalyCount}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              at {threshold.toFixed(1)} sigma threshold
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent dark:from-red-500/10" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Highest Spike
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {highestSpike ? formatCompact(highestSpike.cost) : "N/A"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {highestSpike ? formatDate(highestSpike.date) : "No anomalies"}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Avg Daily Cost
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-xs font-bold text-primary">AVG</span>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {formatCompact(averageDailyCost)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              across {allPoints.length} days
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent dark:from-orange-500/10" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Excess Cost
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
              <span className="text-xs font-bold text-orange-500">EXC</span>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight text-orange-500">
              {formatCompact(totalExcessCost)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              cost above expected on anomaly days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Threshold Slider */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detection Threshold</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label htmlFor="threshold" className="text-sm text-muted-foreground whitespace-nowrap">
              Z-Score Threshold
            </label>
            <input
              id="threshold"
              type="range"
              min={1.5}
              max={3.0}
              step={0.5}
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full max-w-xs accent-primary"
            />
            <span className="text-sm font-mono font-medium w-10 text-right">
              {threshold.toFixed(1)}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Lower values detect more anomalies; higher values only flag extreme spikes.
          </p>
        </CardContent>
      </Card>

      {/* Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Cost Anomaly Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allPoints.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Not enough data to detect anomalies.
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
                        formatCurrency(value as number)
                      }
                      labelFormatter={(label) => formatDate(label as string)}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={false}
                  name="Daily Cost"
                />
                <Line
                  type="monotone"
                  dataKey="rollingAvg"
                  stroke="var(--chart-2)"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Rolling Average"
                />
                <Scatter
                  dataKey="anomalyCost"
                  fill="hsl(0 84% 60%)"
                  name="Anomaly"
                  shape={(props: { cx?: number; cy?: number }) => {
                    if (props.cx == null || props.cy == null) return null;
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={5}
                        fill="hsl(0 84% 60%)"
                        stroke="hsl(0 84% 40%)"
                        strokeWidth={1.5}
                      />
                    );
                  }}
                />
              </ComposedChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Anomaly Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Anomaly Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedAnomalies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <AlertTriangle className="mb-3 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm">No anomalies detected at this threshold</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actual Cost</TableHead>
                  <TableHead className="text-right">Expected (Mean)</TableHead>
                  <TableHead className="text-right">Excess</TableHead>
                  <TableHead className="text-right">Deviation %</TableHead>
                  <TableHead className="text-right">Z-Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAnomalies.map((a) => {
                  const excess = Math.max(0, a.cost - a.mean);
                  const deviationPct =
                    a.mean > 0
                      ? ((a.cost - a.mean) / a.mean) * 100
                      : 0;
                  return (
                    <TableRow key={a.date}>
                      <TableCell>{formatDate(a.date)}</TableCell>
                      <TableCell className="text-right font-mono text-red-500">
                        {formatCurrency(a.cost)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {formatCurrency(a.mean)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-orange-500">
                        {formatCurrency(excess)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-amber-500">
                        {formatPercent(deviationPct)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {a.zScore.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
