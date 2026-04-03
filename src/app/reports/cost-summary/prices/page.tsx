"use client";

import { useMemo, useState } from "react";
import { useReport } from "@/components/reports/report-context";
import { formatCurrencyPrecise } from "@/lib/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter } from "lucide-react";
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

interface PriceRow {
  skuId: string;
  serviceName: string;
  meterCategory: string;
  meterSubcategory: string;
  meterName: string;
  unit: string;
  listUnitPrice: number;
  contractedUnitPrice: number;
  discount: number;
}

export default function PricesPage() {
  const { filteredData } = useReport();

  const [fService, setFService] = useState("");
  const [fCategory, setFCategory] = useState("");
  const [fSubcat, setFSubcat] = useState("");
  const [fMeter, setFMeter] = useState("");
  const [fUnit, setFUnit] = useState("");

  const hasFilters = fService || fCategory || fSubcat || fMeter || fUnit;

  const prices = useMemo(() => {
    const map = new Map<string, PriceRow>();

    for (const record of filteredData) {
      if (!map.has(record.SkuId)) {
        const listP = record.ListUnitPrice;
        const contractP = record.ContractedUnitPrice;
        map.set(record.SkuId, {
          skuId: record.SkuId,
          serviceName: record.ServiceName,
          meterCategory: record.x_SkuMeterCategory,
          meterSubcategory: record.x_SkuMeterSubcategory,
          meterName: record.x_SkuMeterName,
          unit: record.PricingUnit,
          listUnitPrice: listP,
          contractedUnitPrice: contractP,
          discount: listP > 0 ? ((listP - contractP) / listP) * 100 : 0,
        });
      }
    }

    return [...map.values()];
  }, [filteredData]);

  const filtered = useMemo(() => {
    let result = prices;
    if (fService) { const q = fService.toLowerCase(); result = result.filter((r) => r.serviceName.toLowerCase().includes(q)); }
    if (fCategory) { const q = fCategory.toLowerCase(); result = result.filter((r) => r.meterCategory.toLowerCase().includes(q)); }
    if (fSubcat) { const q = fSubcat.toLowerCase(); result = result.filter((r) => r.meterSubcategory.toLowerCase().includes(q)); }
    if (fMeter) { const q = fMeter.toLowerCase(); result = result.filter((r) => r.meterName.toLowerCase().includes(q)); }
    if (fUnit) { const q = fUnit.toLowerCase(); result = result.filter((r) => r.unit.toLowerCase().includes(q)); }
    return result;
  }, [prices, fService, fCategory, fSubcat, fMeter, fUnit]);

  const { sorted, SortHeader } = useSortableTable(filtered, "serviceName", "asc");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Price Sheet ({filtered.length}{hasFilters ? ` of ${prices.length}` : ""} products)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasFilters && (
            <div className="mb-2 flex items-center justify-between rounded-md bg-muted/30 px-3 py-1.5">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Filter className="h-3 w-3" />
                {filtered.length} of {prices.length} products
              </span>
              <Button variant="ghost" size="sm" className="h-6 text-[11px]" onClick={() => { setFService(""); setFCategory(""); setFSubcat(""); setFMeter(""); setFUnit(""); }}>
                Clear
              </Button>
            </div>
          )}
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortHeader field="serviceName">Service</SortHeader></TableHead>
                  <TableHead><SortHeader field="meterCategory">Meter Category</SortHeader></TableHead>
                  <TableHead><SortHeader field="meterSubcategory">Meter Subcategory</SortHeader></TableHead>
                  <TableHead><SortHeader field="meterName">Meter Name</SortHeader></TableHead>
                  <TableHead><SortHeader field="unit">Unit</SortHeader></TableHead>
                  <TableHead className="text-right"><SortHeader field="listUnitPrice" align="right">List Price</SortHeader></TableHead>
                  <TableHead className="text-right"><SortHeader field="contractedUnitPrice" align="right">Contracted</SortHeader></TableHead>
                  <TableHead className="text-right"><SortHeader field="discount" align="right">Discount</SortHeader></TableHead>
                </TableRow>
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="py-1">
                    <input type="text" value={fService} onChange={(e) => setFService(e.target.value)} placeholder="Service..." className="h-6 w-full rounded border border-border/50 bg-background px-1.5 text-[11px] font-normal placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none" />
                  </TableHead>
                  <TableHead className="py-1">
                    <input type="text" value={fCategory} onChange={(e) => setFCategory(e.target.value)} placeholder="Category..." className="h-6 w-full rounded border border-border/50 bg-background px-1.5 text-[11px] font-normal placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none" />
                  </TableHead>
                  <TableHead className="py-1">
                    <input type="text" value={fSubcat} onChange={(e) => setFSubcat(e.target.value)} placeholder="Subcat..." className="h-6 w-full rounded border border-border/50 bg-background px-1.5 text-[11px] font-normal placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none" />
                  </TableHead>
                  <TableHead className="py-1">
                    <input type="text" value={fMeter} onChange={(e) => setFMeter(e.target.value)} placeholder="Meter..." className="h-6 w-full rounded border border-border/50 bg-background px-1.5 text-[11px] font-normal placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none" />
                  </TableHead>
                  <TableHead className="py-1">
                    <input type="text" value={fUnit} onChange={(e) => setFUnit(e.target.value)} placeholder="Unit..." className="h-6 w-full rounded border border-border/50 bg-background px-1.5 text-[11px] font-normal placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none" />
                  </TableHead>
                  <TableHead className="py-1"></TableHead>
                  <TableHead className="py-1"></TableHead>
                  <TableHead className="py-1"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((p) => (
                  <TableRow key={p.skuId}>
                    <TableCell className="font-medium">{p.serviceName}</TableCell>
                    <TableCell>{p.meterCategory}</TableCell>
                    <TableCell>{p.meterSubcategory}</TableCell>
                    <TableCell>{p.meterName}</TableCell>
                    <TableCell>{p.unit}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrencyPrecise(p.listUnitPrice)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrencyPrecise(p.contractedUnitPrice)}</TableCell>
                    <TableCell className="text-right">
                      {p.discount > 0 ? (
                        <span className="text-green-600">{p.discount.toFixed(1)}%</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {sorted.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">No products match the current filters.</TableCell>
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
