"use client";

import { useMemo, useState } from "react";
import { useReport } from "@/components/reports/report-context";
import { formatCurrencyPrecise } from "@/lib/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PricesPage() {
  const { filteredData } = useReport();
  const [search, setSearch] = useState("");

  const prices = useMemo(() => {
    const map = new Map<
      string,
      {
        skuId: string;
        serviceName: string;
        meterCategory: string;
        meterSubcategory: string;
        meterName: string;
        unit: string;
        listUnitPrice: number;
        contractedUnitPrice: number;
      }
    >();

    for (const record of filteredData) {
      if (!map.has(record.SkuId)) {
        map.set(record.SkuId, {
          skuId: record.SkuId,
          serviceName: record.ServiceName,
          meterCategory: record.x_SkuMeterCategory,
          meterSubcategory: record.x_SkuMeterSubcategory,
          meterName: record.x_SkuMeterName,
          unit: record.PricingUnit,
          listUnitPrice: record.ListUnitPrice,
          contractedUnitPrice: record.ContractedUnitPrice,
        });
      }
    }

    return [...map.values()].sort((a, b) =>
      a.serviceName.localeCompare(b.serviceName)
    );
  }, [filteredData]);

  const filtered = prices.filter(
    (p) =>
      p.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      p.meterName.toLowerCase().includes(search.toLowerCase()) ||
      p.meterCategory.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">
              Price Sheet ({filtered.length} products)
            </CardTitle>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-64 rounded-md border bg-background px-3 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Meter Category</TableHead>
                  <TableHead>Meter Subcategory</TableHead>
                  <TableHead>Meter Name</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">List Price</TableHead>
                  <TableHead className="text-right">
                    Contracted Price
                  </TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => {
                  const discount =
                    p.listUnitPrice > 0
                      ? ((p.listUnitPrice - p.contractedUnitPrice) /
                          p.listUnitPrice) *
                        100
                      : 0;
                  return (
                    <TableRow key={p.skuId}>
                      <TableCell className="font-medium">
                        {p.serviceName}
                      </TableCell>
                      <TableCell>{p.meterCategory}</TableCell>
                      <TableCell>{p.meterSubcategory}</TableCell>
                      <TableCell>{p.meterName}</TableCell>
                      <TableCell>{p.unit}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrencyPrecise(p.listUnitPrice)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrencyPrecise(p.contractedUnitPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        {discount > 0 ? (
                          <span className="text-green-600">
                            {discount.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
