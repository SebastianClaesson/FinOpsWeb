"use client";

import { useMemo } from "react";
import { useReport } from "@/components/reports/report-context";
import { groupBy, parseTags } from "@/lib/data/cost-data";
import { formatCurrency } from "@/lib/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MonthlyComparison } from "@/components/reports/monthly-comparison";

export default function ResourcesPage() {
  const { filteredData } = useReport();

  // Build resource detail list
  const resources = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        type: string;
        resourceGroup: string;
        subscription: string;
        region: string;
        effectiveCost: number;
        tags: Record<string, string>;
      }
    >();

    for (const record of filteredData) {
      const existing = map.get(record.ResourceName);
      if (existing) {
        existing.effectiveCost += record.EffectiveCost;
      } else {
        map.set(record.ResourceName, {
          name: record.ResourceName,
          type: record.ResourceType,
          resourceGroup: record.x_ResourceGroupName,
          subscription: record.SubAccountName,
          region: record.RegionName,
          effectiveCost: record.EffectiveCost,
          tags: parseTags(record.Tags),
        });
      }
    }

    return [...map.values()].sort((a, b) => b.effectiveCost - a.effectiveCost);
  }, [filteredData]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Resources ({resources.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Resource Group</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead className="text-right">Effective Cost</TableHead>
                  <TableHead>Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-48 truncate">
                      {r.type}
                    </TableCell>
                    <TableCell>{r.resourceGroup}</TableCell>
                    <TableCell>{r.subscription}</TableCell>
                    <TableCell>{r.region}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(r.effectiveCost)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-64">
                        {Object.entries(r.tags).map(([k, v]) => (
                          <Badge
                            key={k}
                            variant="outline"
                            className="text-[10px] px-1 py-0"
                          >
                            {k}: {v}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Comparison by Resource</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyComparison
            data={filteredData}
            keyFn={(r) => r.ResourceName}
            nameLabel="Resource"
          />
        </CardContent>
      </Card>
    </div>
  );
}
