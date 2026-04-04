"use client";

import { useMemo } from "react";
import { useReport } from "@/components/reports/report-context";
import { calculateFactTotals, groupFactsByDate } from "@/lib/data/fact-helpers";
import { formatPercent, formatMonth } from "@/lib/utils/format";
import { useCurrencyFormat } from "@/lib/hooks/use-currency-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingDown } from "lucide-react";

export default function InvoicingSummaryPage() {
  const { formatCurrency, formatCompact, currency } = useCurrencyFormat();
  const { filteredFacts } = useReport();
  const totals = useMemo(() => calculateFactTotals(filteredFacts), [filteredFacts]);

  const monthlyBilled = useMemo(() => {
    const monthly = groupFactsByDate(filteredFacts, "month");
    return monthly.map((m, i) => {
      const prev = i > 0 ? monthly[i - 1].effectiveCost : m.effectiveCost;
      const changePct = prev > 0 ? ((m.effectiveCost - prev) / prev) * 100 : 0;
      return {
        month: formatMonth(m.date + "-01"),
        date: m.date,
        billedCost: m.effectiveCost,
        changePct: Math.round(changePct * 100) / 100,
      };
    });
  }, [filteredFacts]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Billed Cost</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-xs font-bold text-primary">{currency}</span>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">{formatCompact(totals.billedCost)}</div>
            <p className="mt-1 text-xs text-muted-foreground">{formatCurrency(totals.billedCost)} total</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent dark:from-green-500/10" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Savings</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
              <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight text-green-600 dark:text-green-400">{formatCompact(totals.totalSavings)}</div>
            <p className="mt-1 text-xs text-muted-foreground">{totals.savingsPercent.toFixed(1)}% off list</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">List Cost</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <span className="text-xs font-bold text-muted-foreground">{currency}</span>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">{formatCompact(totals.listCost)}</div>
            <p className="mt-1 text-xs text-muted-foreground">Before discounts</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Monthly Billed Cost</CardTitle></CardHeader>
        <CardContent>
          <ChartContainer config={{ billedCost: { label: "Billed Cost", color: "var(--chart-1)" } }} className="h-[300px] w-full">
            <BarChart data={monthlyBilled}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => formatCompact(v)} tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatCurrency(v as number)} />} />
              <Bar dataKey="billedCost" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Monthly Trend</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b"><th className="pb-2 text-left font-medium">Month</th><th className="pb-2 text-right font-medium">Billed Cost</th><th className="pb-2 text-right font-medium">Change %</th></tr>
              </thead>
              <tbody>
                {monthlyBilled.map((m, i) => (
                  <tr key={m.date} className="border-b last:border-0">
                    <td className="py-2">{m.month}</td>
                    <td className="py-2 text-right font-mono">{formatCurrency(m.billedCost)}</td>
                    <td className={`py-2 text-right font-mono ${m.changePct > 0 ? "text-red-500" : m.changePct < 0 ? "text-green-600" : ""}`}>
                      {i > 0 ? formatPercent(m.changePct) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
