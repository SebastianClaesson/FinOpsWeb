"use client";

import { useMemo } from "react";
import { useReport } from "@/components/reports/report-context";
import { groupByDimension } from "@/lib/data/fact-helpers";
import { CostTable } from "@/components/reports/cost-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function InvoiceReconPage() {
  const { filteredFacts } = useReport();

  const byMeterCategory = useMemo(
    () => groupByDimension(filteredFacts, "x_SkuMeterCategory"),
    [filteredFacts]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Full MCA invoice reconciliation requires Invoice Section data, which is
          not yet available. This view uses Meter Category (x_SkuMeterCategory) as
          a proxy for invoice line grouping.
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Billed Cost by Meter Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CostTable
            data={byMeterCategory}
            nameLabel="Meter Category"
          />
        </CardContent>
      </Card>
    </div>
  );
}
