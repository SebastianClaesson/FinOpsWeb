"use client";

import { useMemo } from "react";
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
import { Info } from "lucide-react";
import { useSortableTable } from "@/components/reports/sortable-header";

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
  const { formatCurrency } = useCurrencyFormat();

  const purchases = useMemo(() => {
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

  const { sorted, SortHeader } = useSortableTable(purchases, "totalCost");

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
            Commitment Discounts &amp; Purchases ({purchases.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortHeader field="name">Name</SortHeader></TableHead>
                  <TableHead><SortHeader field="type">Type</SortHeader></TableHead>
                  <TableHead><SortHeader field="subscription">Subscription</SortHeader></TableHead>
                  <TableHead><SortHeader field="firstSeen">First Seen</SortHeader></TableHead>
                  <TableHead className="text-right"><SortHeader field="totalCost" align="right">Total Cost</SortHeader></TableHead>
                  <TableHead className="text-right"><SortHeader field="totalSavings" align="right">Total Savings</SortHeader></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                    <TableCell>{p.subscription}</TableCell>
                    <TableCell>{formatDate(p.firstSeen)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(p.totalCost)}</TableCell>
                    <TableCell className="text-right font-mono text-green-600">{formatCurrency(p.totalSavings)}</TableCell>
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
