"use client";

import { useMemo, useState, useCallback } from "react";
import { useReport } from "@/components/reports/report-context";
import { ResourceDetail } from "@/lib/types/aggregated";
import { useCurrencyFormat } from "@/lib/hooks/use-currency-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filter, ChevronRight, ChevronDown, ChevronsUpDown } from "lucide-react";
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

interface ResourceTypeGroup {
  type: string;
  totalCost: number;
  resources: ResourceRow[];
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

  // Track which groups are expanded (empty Set = all collapsed by default)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

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

  // Group sorted resources by ResourceType, sorted by total cost descending
  const groups = useMemo(() => {
    const groupMap = new Map<string, ResourceRow[]>();
    for (const r of sorted) {
      const existing = groupMap.get(r.type);
      if (existing) {
        existing.push(r);
      } else {
        groupMap.set(r.type, [r]);
      }
    }

    const groupList: ResourceTypeGroup[] = [];
    for (const [type, resources] of groupMap) {
      const totalCost = resources.reduce((sum, r) => sum + r.effectiveCost, 0);
      groupList.push({ type, totalCost, resources });
    }

    // Sort groups by total cost descending
    groupList.sort((a, b) => b.totalCost - a.totalCost);

    return groupList;
  }, [sorted]);

  const toggleGroup = useCallback((type: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const allExpanded = groups.length > 0 && expandedGroups.size === groups.length;

  const toggleAll = useCallback(() => {
    if (allExpanded) {
      setExpandedGroups(new Set());
    } else {
      setExpandedGroups(new Set(groups.map((g) => g.type)));
    }
  }, [allExpanded, groups]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Resources ({filtered.length}{hasFilters ? ` of ${resourceRows.length}` : ""})
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {groups.length} resource type{groups.length !== 1 ? "s" : ""}
              </span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={toggleAll}
            >
              <ChevronsUpDown className="h-3.5 w-3.5" />
              {allExpanded ? "Collapse all" : "Expand all"}
            </Button>
          </div>
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
                  <TableHead className="w-8"></TableHead>
                  <TableHead><SortHeader field="name">Resource</SortHeader></TableHead>
                  <TableHead><SortHeader field="type">Type</SortHeader></TableHead>
                  <TableHead><SortHeader field="resourceGroup">Resource Group</SortHeader></TableHead>
                  <TableHead><SortHeader field="subscription">Subscription</SortHeader></TableHead>
                  <TableHead><SortHeader field="region">Region</SortHeader></TableHead>
                  <TableHead className="text-right"><SortHeader field="effectiveCost" align="right">Effective Cost</SortHeader></TableHead>
                  <TableHead>Tags</TableHead>
                </TableRow>
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="py-1"></TableHead>
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
                {groups.map((group) => {
                  const isExpanded = expandedGroups.has(group.type);
                  return (
                    <GroupSection
                      key={group.type}
                      group={group}
                      isExpanded={isExpanded}
                      onToggle={() => toggleGroup(group.type)}
                      formatCurrency={formatCurrency}
                    />
                  );
                })}
                {groups.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">No resources match the current filters.</TableCell>
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

function GroupSection({
  group,
  isExpanded,
  onToggle,
  formatCurrency,
}: {
  group: ResourceTypeGroup;
  isExpanded: boolean;
  onToggle: () => void;
  formatCurrency: (value: number) => string;
}) {
  return (
    <>
      {/* Group header row */}
      <TableRow
        className="cursor-pointer bg-muted/40 hover:bg-muted/60 transition-colors"
        onClick={onToggle}
      >
        <TableCell className="w-8 py-2 pl-3 pr-0">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </TableCell>
        <TableCell colSpan={5} className="py-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{group.type || "(No type)"}</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {group.resources.length} resource{group.resources.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </TableCell>
        <TableCell className="text-right py-2 font-mono font-medium text-sm">
          {formatCurrency(group.totalCost)}
        </TableCell>
        <TableCell className="py-2"></TableCell>
      </TableRow>

      {/* Resource rows within the group */}
      {isExpanded && group.resources.map((r) => (
        <TableRow key={`${group.type}-${r.name}`}>
          <TableCell className="w-8"></TableCell>
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
    </>
  );
}
