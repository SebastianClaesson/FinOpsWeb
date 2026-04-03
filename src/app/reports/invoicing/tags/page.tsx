"use client";

import { useMemo } from "react";
import { useReport } from "@/components/reports/report-context";
import { getUniqueTagKeysAndValues, parseTags, GroupedCost } from "@/lib/data/cost-data";
import { CostTable } from "@/components/reports/cost-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function TagsPage() {
  const { filteredData } = useReport();

  const tagKeys = useMemo(
    () => Object.keys(getUniqueTagKeysAndValues(filteredData)).sort(),
    [filteredData]
  );

  const tagCostsByKey = useMemo(() => {
    const result: Record<string, GroupedCost[]> = {};

    for (const tagKey of tagKeys) {
      const map = new Map<
        string,
        { effectiveCost: number; billedCost: number; listCost: number }
      >();

      for (const record of filteredData) {
        const tags = parseTags(record.Tags);
        const value = tags[tagKey] ?? "(untagged)";
        const existing = map.get(value) ?? {
          effectiveCost: 0,
          billedCost: 0,
          listCost: 0,
        };
        existing.effectiveCost += record.EffectiveCost;
        existing.billedCost += record.BilledCost;
        existing.listCost += record.ListCost;
        map.set(value, existing);
      }

      result[tagKey] = Array.from(map.entries())
        .map(([name, costs]) => ({
          name,
          effectiveCost: Math.round(costs.effectiveCost * 100) / 100,
          billedCost: Math.round(costs.billedCost * 100) / 100,
          listCost: Math.round(costs.listCost * 100) / 100,
          savings:
            Math.round((costs.listCost - costs.effectiveCost) * 100) / 100,
        }))
        .sort((a, b) => b.effectiveCost - a.effectiveCost);
    }

    return result;
  }, [filteredData, tagKeys]);

  if (tagKeys.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-8 text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>No tagged resources found in the selected period.</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {tagKeys.map((tagKey) => (
        <Card key={tagKey}>
          <CardHeader>
            <CardTitle className="text-base">
              Cost by Tag: {tagKey}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CostTable
              data={tagCostsByKey[tagKey]}
              nameLabel={tagKey}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
