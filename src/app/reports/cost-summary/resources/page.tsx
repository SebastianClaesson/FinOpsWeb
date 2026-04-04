"use client";

import { useMemo, useState } from "react";
import { useReport } from "@/components/reports/report-context";
import { ResourceDetail } from "@/lib/types/aggregated";
import { useCurrencyFormat } from "@/lib/hooks/use-currency-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

function ColFilter({
  value,
  onChange,
  placeholder,
  align = "left",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  align?: "left" | "right";
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "Filter..."}
      className={`h-6 w-full rounded border border-border/50 bg-background px-1.5 text-[11px] font-normal transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none ${align === "right" ? "text-right" : ""}`}
    />
  );
}

interface ResourceRow {
  name: string;
  type: string;
  resourceGroup: string;
  subscription: string;
  region: string;
  effectiveCost: number;
  tags: Record<string, string>;
}

export default function ResourcesPage() {
  const { resources } = useReport();
  const { formatCurrency } = useCurrencyFormat();

  const [fName, setFName] = useState("");
  const [fType, setFType] = useState("");
  const [fRg, setFRg] = useState("");
  const [fSub, setFSub] = useState("");
  const [fRegion, setFRegion] = useState("");
  const [fCostMin, setFCostMin] = useState("");
  const [fTag, setFTag] = useState("");

  const hasFilters = fName || fType || fRg || fSub || fRegion || fCostMin || fTag;

  const clearFilters = () => {
    setFName(""); setFType(""); setFRg(""); setFSub("");
    setFRegion(""); setFCostMin(""); setFTag("");
  };

  const resourceRows = useMemo(() => {
    return resources.map((r: ResourceDetail) => ({
      name: r.ResourceName,
      type: r.ResourceType,
      resourceGroup: r.x_ResourceGroupName,
      subscription: r.SubAccountName,
      region: r.RegionName,
      effectiveCost: r.effectiveCost,
      tags: r.tags,
    }));
  }, [resources]);

  const filtered = useMemo(() => {
    let result = resourceRows;
    if (fName) { const q = fName.toLowerCase(); result = result.filter((r) => r.name.toLowerCase().includes(q)); }
    if (fType) { const q = fType.toLowerCase(); result = result.filter((r) => r.type.toLowerCase().includes(q)); }
    if (fRg) { const q = fRg.toLowerCase(); result = result.filter((r) => r.resourceGroup.toLowerCase().includes(q)); }
    if (fSub) { const q = fSub.toLowerCase(); result = result.filter((r) => r.subscription.toLowerCase().includes(q)); }
    if (fRegion) { const q = fRegion.toLowerCase(); result = result.filter((r) => r.region.toLowerCase().includes(q)); }
    if (fCostMin) { const min = parseFloat(fCostMin); if (!isNaN(min)) result = result.filter((r) => r.effectiveCost >= min); }
    if (fTag) {
      const q = fTag.toLowerCase();
      result = result.filter((r) =>
        Object.entries(r.tags).some(([k, v]) => k.toLowerCase().includes(q) || v.toLowerCase().includes(q))
      );
    }
    return result;
  }, [resourceRows, fName, fType, fRg, fSub, fRegion, fCostMin, fTag]);

  const { sorted, SortHeader } = useSortableTable(filtered, "effectiveCost");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Resources ({filtered.length}{hasFilters ? ` of ${resourceRows.length}` : ""})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasFilters && (
            <div className="mb-2 flex items-center justify-between rounded-md bg-muted/30 px-3 py-1.5">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Filter className="h-3 w-3" />
                {filtered.length} of {resourceRows.length} resources
              </span>
              <Button variant="ghost" size="sm" className="h-6 text-[11px]" onClick={clearFilters}>Clear</Button>
            </div>
          )}
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortHeader field="name">Resource</SortHeader></TableHead>
                  <TableHead><SortHeader field="type">Type</SortHeader></TableHead>
                  <TableHead><SortHeader field="resourceGroup">Resource Group</SortHeader></TableHead>
                  <TableHead><SortHeader field="subscription">Subscription</SortHeader></TableHead>
                  <TableHead><SortHeader field="region">Region</SortHeader></TableHead>
                  <TableHead className="text-right"><SortHeader field="effectiveCost" align="right">Effective Cost</SortHeader></TableHead>
                  <TableHead>Tags</TableHead>
                </TableRow>
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="py-1"><ColFilter value={fName} onChange={setFName} placeholder="Name..." /></TableHead>
                  <TableHead className="py-1"><ColFilter value={fType} onChange={setFType} placeholder="Type..." /></TableHead>
                  <TableHead className="py-1"><ColFilter value={fRg} onChange={setFRg} placeholder="RG..." /></TableHead>
                  <TableHead className="py-1"><ColFilter value={fSub} onChange={setFSub} placeholder="Sub..." /></TableHead>
                  <TableHead className="py-1"><ColFilter value={fRegion} onChange={setFRegion} placeholder="Region..." /></TableHead>
                  <TableHead className="py-1"><ColFilter value={fCostMin} onChange={setFCostMin} placeholder="Min $..." align="right" /></TableHead>
                  <TableHead className="py-1"><ColFilter value={fTag} onChange={setFTag} placeholder="Key or value..." /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-48 truncate">{r.type}</TableCell>
                    <TableCell>{r.resourceGroup}</TableCell>
                    <TableCell>{r.subscription}</TableCell>
                    <TableCell>{r.region}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(r.effectiveCost)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-64">
                        {Object.entries(r.tags).map(([k, v]) => (
                          <Badge key={k} variant="outline" className="text-[10px] px-1 py-0">{k}: {v}</Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {sorted.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">No resources match the current filters.</TableCell>
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
