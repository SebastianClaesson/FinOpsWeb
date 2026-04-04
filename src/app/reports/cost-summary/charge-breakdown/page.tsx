"use client";

import { useMemo } from "react";
import { useReport } from "@/components/reports/report-context";
import { groupByDimension } from "@/lib/data/fact-helpers";
import { CostTable } from "@/components/reports/cost-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChargeBreakdownPage() {
  const { filteredFacts } = useReport();

  const byChargeCategory = useMemo(
    () => groupByDimension(filteredFacts, 'ChargeCategory'),
    [filteredFacts]
  );

  const byChargeSubcategory = useMemo(
    () => groupByDimension(filteredFacts, 'ChargeSubcategory'),
    [filteredFacts]
  );

  const byPricingCategory = useMemo(
    () => groupByDimension(filteredFacts, 'PricingCategory'),
    [filteredFacts]
  );

  const byServiceCategory = useMemo(
    () => groupByDimension(filteredFacts, 'ServiceCategory'),
    [filteredFacts]
  );

  const byServiceName = useMemo(
    () => groupByDimension(filteredFacts, 'ServiceName'),
    [filteredFacts]
  );

  const byMeterCategory = useMemo(
    () => groupByDimension(filteredFacts, 'x_SkuMeterCategory'),
    [filteredFacts]
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Hierarchical breakdown of all charges. Drill down through charge
        categories to understand cost composition.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">By Charge Category</CardTitle>
        </CardHeader>
        <CardContent>
          <CostTable data={byChargeCategory} nameLabel="Charge Category" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">By Charge Subcategory</CardTitle>
        </CardHeader>
        <CardContent>
          <CostTable data={byChargeSubcategory} nameLabel="Charge Subcategory" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">By Pricing Category</CardTitle>
        </CardHeader>
        <CardContent>
          <CostTable data={byPricingCategory} nameLabel="Pricing Category" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">By Service Category</CardTitle>
        </CardHeader>
        <CardContent>
          <CostTable data={byServiceCategory} nameLabel="Service Category" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">By Service Name</CardTitle>
        </CardHeader>
        <CardContent>
          <CostTable data={byServiceName} nameLabel="Service Name" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">By Meter Category</CardTitle>
        </CardHeader>
        <CardContent>
          <CostTable data={byMeterCategory} nameLabel="Meter Category" />
        </CardContent>
      </Card>
    </div>
  );
}
