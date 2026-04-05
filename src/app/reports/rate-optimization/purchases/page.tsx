"use client";

import { useMemo, useState } from "react";
import { useReport } from "@/components/reports/report-context";
import { PurchaseDetail } from "@/lib/types/aggregated";
import { formatDate } from "@/lib/utils/format";
import { useCurrencyFormat } from "@/lib/hooks/use-currency-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useSortableTable } from "@/components/reports/sortable-header";
import {
  TrendingDown,
  ShoppingCart,
  Info,
} from "lucide-react";

interface PurchaseRow {
  id: string;
  name: string;
  type: string;
  subscription: string;
  totalCost: number;
  totalSavings: number;
  firstSeen: string;
}

export default function PurchasesPage() {
  const { purchases: purchaseDetails } = useReport();
  const { formatCurrency, formatCompact, currency } = useCurrencyFormat();
  const [activeOnly, setActiveOnly] = useState(true);

  const allPurchases = useMemo<PurchaseRow[]>(() => {
    return purchaseDetails.map((p: PurchaseDetail) => ({
      id: p.CommitmentDiscountId,
      name: p.CommitmentDiscountName,
      type: p.CommitmentDiscountType,
      subscription: p.SubAccountName,
      totalCost: p.effectiveCost,
      totalSavings: p.listCost - p.effectiveCost,
      firstSeen: p.firstSeen,
    }));
  }, [purchaseDetails]);

  const purchases = useMemo(() => {
    if (!activeOnly) return allPurchases;
    return allPurchases.filter((p) => Math.round(p.totalCost * 100) !== 0);
  }, [allPurchases, activeOnly]);

  const hiddenCount = allPurchases.length - purchases.length;

  const kpis = useMemo(() => {
    let totalCost = 0;
    let totalSavings = 0;
    for (const p of purchases) {
      totalCost += p.totalCost;
      totalSavings += p.totalSavings;
    }
    return {
      count: purchases.length,
      totalCost: Math.round(totalCost * 100) / 100,
      totalSavings: Math.round(totalSavings * 100) / 100,
    };
  }, [purchases]);

  const { sorted, SortHeader } = useSortableTable(purchases, "totalCost");

  if (allPurchases.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-8 text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>
            No commitment discount purchases found in the selected period.
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Purchases
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <ShoppingCart className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {kpis.count}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Commitment discounts
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Cost
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <span className="text-xs font-bold text-muted-foreground">{currency}</span>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {formatCompact(kpis.totalCost)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatCurrency(kpis.totalCost)} effective cost
            </p>
          </CardContent>
        </Card>

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
              {formatCompact(kpis.totalSavings)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatCurrency(kpis.totalSavings)} saved vs list price
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Commitment Discounts &amp; Purchases ({purchases.length})
            </CardTitle>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Switch
                checked={activeOnly}
                onCheckedChange={(checked) => setActiveOnly(checked)}
              />
              <span>Active only</span>
              {activeOnly && hiddenCount > 0 && (
                <span className="text-xs">
                  ({hiddenCount} hidden)
                </span>
              )}
            </label>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortHeader field="name">Name</SortHeader>
                  </TableHead>
                  <TableHead>
                    <SortHeader field="type">Type</SortHeader>
                  </TableHead>
                  <TableHead>
                    <SortHeader field="subscription">Subscription</SortHeader>
                  </TableHead>
                  <TableHead>
                    <SortHeader field="firstSeen">First Seen</SortHeader>
                  </TableHead>
                  <TableHead className="text-right">
                    <SortHeader field="totalCost" align="right">
                      Total Cost
                    </SortHeader>
                  </TableHead>
                  <TableHead className="text-right">
                    <SortHeader field="totalSavings" align="right">
                      Savings
                    </SortHeader>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                      All purchases hidden by filter. Toggle &quot;Active only&quot; to show expired reservations.
                    </TableCell>
                  </TableRow>
                ) : sorted.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.type}</Badge>
                    </TableCell>
                    <TableCell>{p.subscription}</TableCell>
                    <TableCell>{formatDate(p.firstSeen)}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(p.totalCost)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-green-600">
                      {p.totalSavings > 0
                        ? formatCurrency(p.totalSavings)
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
