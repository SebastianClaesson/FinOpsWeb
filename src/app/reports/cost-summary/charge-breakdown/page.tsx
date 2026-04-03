"use client";

import { useMemo } from "react";
import { useReport } from "@/components/reports/report-context";
import { groupBy } from "@/lib/data/cost-data";
import { CostTable } from "@/components/reports/cost-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChargeBreakdownPage() {
  const { filteredData } = useReport();

  const byChargeCategory = useMemo(
    () => groupBy(filteredData, (r) => r.ChargeCategory),
    [filteredData]
  );

  const byChargeSubcategory = useMemo(
    () => groupBy(filteredData, (r) => r.ChargeSubcategory),
    [filteredData]
  );

  const byPricingCategory = useMemo(
    () => groupBy(filteredData, (r) => r.PricingCategory),
    [filteredData]
  );

  const byServiceCategory = useMemo(
    () => groupBy(filteredData, (r) => r.ServiceCategory),
    [filteredData]
  );

  const byServiceName = useMemo(
    () => groupBy(filteredData, (r) => r.ServiceName),
    [filteredData]
  );

  const byMeterCategory = useMemo(
    () => groupBy(filteredData, (r) => r.x_SkuMeterCategory),
    [filteredData]
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
