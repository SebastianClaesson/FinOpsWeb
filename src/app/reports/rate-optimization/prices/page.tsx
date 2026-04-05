"use client";

import { useMemo, useState } from "react";
import { useReport } from "@/components/reports/report-context";
import { PriceDetail } from "@/lib/types/aggregated";
import { useCurrencyFormat } from "@/lib/hooks/use-currency-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Tag, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSortableTable } from "@/components/reports/sortable-header";

interface DiscountedPriceRow {
  skuId: string;
  serviceName: string;
  meterCategory: string;
  meterName: string;
  unit: string;
  listUnitPrice: number;
  contractedUnitPrice: number;
  discount: number;
}

export default function PricesPage() {
  const { prices: priceDetails } = useReport();
  const { formatCurrencyPrecise } = useCurrencyFormat();

  const [fService, setFService] = useState("");

  const hasFilters = !!fService;

  const discountedPrices = useMemo(() => {
    return priceDetails
      .filter(
        (p: PriceDetail) =>
          p.ListUnitPrice > 0 && p.ListUnitPrice !== p.ContractedUnitPrice
      )
      .map((p: PriceDetail) => ({
        skuId: p.SkuId,
        serviceName: p.ServiceName,
        meterCategory: p.x_SkuMeterCategory,
        meterName: p.x_SkuMeterName,
        unit: p.PricingUnit,
        listUnitPrice: p.ListUnitPrice,
        contractedUnitPrice: p.ContractedUnitPrice,
        discount:
          ((p.ListUnitPrice - p.ContractedUnitPrice) / p.ListUnitPrice) * 100,
      }));
  }, [priceDetails]);

  const filtered = useMemo(() => {
    let result = discountedPrices;
    if (fService) {
      const q = fService.toLowerCase();
      result = result.filter((r) => r.serviceName.toLowerCase().includes(q));
    }
    return result;
  }, [discountedPrices, fService]);

  const { sorted, SortHeader } = useSortableTable(filtered, "discount");

  const averageDiscount = useMemo(() => {
    if (discountedPrices.length === 0) return 0;
    const total = discountedPrices.reduce((sum, p) => sum + p.discount, 0);
    return total / discountedPrices.length;
  }, [discountedPrices]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              SKUs with Discounts
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Tag className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {discountedPrices.length}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              of {priceDetails.length} total SKUs
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent dark:from-green-500/10" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Average Discount
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
              <Percent className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight text-green-600 dark:text-green-400">
              {averageDiscount.toFixed(1)}%
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Across discounted SKUs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Discounted Prices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Discounted Prices ({filtered.length}
            {hasFilters ? ` of ${discountedPrices.length}` : ""} SKUs)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasFilters && (
            <div className="mb-2 flex items-center justify-between rounded-md bg-muted/30 px-3 py-1.5">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Filter className="h-3 w-3" />
                {filtered.length} of {discountedPrices.length} SKUs
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[11px]"
                onClick={() => setFService("")}
              >
                Clear
              </Button>
            </div>
          )}
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortHeader field="serviceName">Service</SortHeader>
                  </TableHead>
                  <TableHead>
                    <SortHeader field="meterCategory">
                      Meter Category
                    </SortHeader>
                  </TableHead>
                  <TableHead>
                    <SortHeader field="meterName">Meter Name</SortHeader>
                  </TableHead>
                  <TableHead>
                    <SortHeader field="unit">Unit</SortHeader>
                  </TableHead>
                  <TableHead className="text-right">
                    <SortHeader field="listUnitPrice" align="right">
                      List Price
                    </SortHeader>
                  </TableHead>
                  <TableHead className="text-right">
                    <SortHeader field="contractedUnitPrice" align="right">
                      Contracted Price
                    </SortHeader>
                  </TableHead>
                  <TableHead className="text-right">
                    <SortHeader field="discount" align="right">
                      Discount %
                    </SortHeader>
                  </TableHead>
                </TableRow>
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="py-1">
                    <input
                      type="text"
                      value={fService}
                      onChange={(e) => setFService(e.target.value)}
                      placeholder="Service..."
                      className="h-6 w-full rounded border border-border/50 bg-background px-1.5 text-[11px] font-normal placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                    />
                  </TableHead>
                  <TableHead className="py-1" />
                  <TableHead className="py-1" />
                  <TableHead className="py-1" />
                  <TableHead className="py-1" />
                  <TableHead className="py-1" />
                  <TableHead className="py-1" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((p) => (
                  <TableRow key={p.skuId}>
                    <TableCell className="font-medium">
                      {p.serviceName}
                    </TableCell>
                    <TableCell>{p.meterCategory}</TableCell>
                    <TableCell>{p.meterName}</TableCell>
                    <TableCell>{p.unit}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrencyPrecise(p.listUnitPrice)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrencyPrecise(p.contractedUnitPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-green-600 dark:text-green-400">
                        {p.discount.toFixed(1)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {sorted.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No discounted prices found.
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
