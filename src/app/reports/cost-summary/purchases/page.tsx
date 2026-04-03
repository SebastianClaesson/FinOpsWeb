"use client";

import { useMemo } from "react";
import { useReport } from "@/components/reports/report-context";
import { formatCurrency, formatDate } from "@/lib/utils/format";
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
import { Info } from "lucide-react";

export default function PurchasesPage() {
  const { filteredData } = useReport();

  // In real data, purchases have ChargeCategory === "Purchase"
  // For dummy data, commitment discounts represent purchases
  const purchases = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        type: string;
        subscription: string;
        totalCost: number;
        totalSavings: number;
        firstSeen: string;
      }
    >();

    for (const record of filteredData) {
      if (!record.CommitmentDiscountId) continue;

      const existing = map.get(record.CommitmentDiscountId);
      if (existing) {
        existing.totalCost += record.EffectiveCost;
        existing.totalSavings += record.ListCost - record.EffectiveCost;
        if (record.ChargePeriodStart < existing.firstSeen) {
          existing.firstSeen = record.ChargePeriodStart;
        }
      } else {
        map.set(record.CommitmentDiscountId, {
          id: record.CommitmentDiscountId,
          name: record.CommitmentDiscountName,
          type: record.CommitmentDiscountType,
          subscription: record.SubAccountName,
          totalCost: record.EffectiveCost,
          totalSavings: record.ListCost - record.EffectiveCost,
          firstSeen: record.ChargePeriodStart,
        });
      }
    }

    return [...map.values()].sort((a, b) => b.totalCost - a.totalCost);
  }, [filteredData]);

  if (purchases.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-8 text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>No commitment discount purchases found in the selected period.</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Commitment Discounts & Purchases ({purchases.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>First Seen</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead className="text-right">Total Savings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((p) => (
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
                      {formatCurrency(p.totalSavings)}
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
