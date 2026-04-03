"use client";

import { useMemo } from "react";
import { useReport } from "@/components/reports/report-context";
import { groupBy } from "@/lib/data/cost-data";
import { CostTable } from "@/components/reports/cost-table";
import { MonthlyComparison } from "@/components/reports/monthly-comparison";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChargebackPage() {
  const { filteredData } = useReport();

  const bySubscription = useMemo(
    () => groupBy(filteredData, (r) => r.SubAccountName),
    [filteredData]
  );

  const byResourceGroup = useMemo(
    () => groupBy(filteredData, (r) => r.x_ResourceGroupName),
    [filteredData]
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Effective Cost by Subscription (Chargeback)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CostTable data={bySubscription} nameLabel="Subscription" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Effective Cost by Resource Group
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CostTable data={byResourceGroup} nameLabel="Resource Group" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Monthly Comparison by Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyComparison
            data={filteredData}
            keyFn={(r) => r.SubAccountName}
            nameLabel="Subscription"
          />
        </CardContent>
      </Card>
    </div>
  );
}
