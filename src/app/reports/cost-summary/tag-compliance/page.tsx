"use client";

import { useMemo, useState } from "react";
import { useReport } from "@/components/reports/report-context";
import { useCurrencyFormat } from "@/lib/hooks/use-currency-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { CHART_COLORS, buildChartConfig } from "@/lib/utils/chart-colors";
import { CheckCircle2, AlertTriangle, Tag, Filter } from "lucide-react";

const DEFAULT_REQUIRED_TAGS = ["Environment", "Owner", "CostCenter"];

interface TagCompliance {
  tagKey: string;
  taggedCount: number;
  untaggedCount: number;
  totalCount: number;
  compliancePct: number;
  untaggedCost: number;
  taggedCost: number;
}

export default function TagCompliancePage() {
  const { resources } = useReport();
  const { formatCurrency, formatCompact } = useCurrencyFormat();
  const [requiredTags, setRequiredTags] = useState<string[]>(DEFAULT_REQUIRED_TAGS);
  const [customTag, setCustomTag] = useState("");
  const [showUntagged, setShowUntagged] = useState<string | null>(null);

  // All unique tag keys found in the data
  const allTagKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const r of resources) {
      for (const key of Object.keys(r.tags)) {
        keys.add(key);
      }
    }
    return [...keys].sort();
  }, [resources]);

  // Compliance analysis per required tag
  const compliance = useMemo(() => {
    return requiredTags.map((tagKey) => {
      let taggedCount = 0;
      let untaggedCount = 0;
      let taggedCost = 0;
      let untaggedCost = 0;

      for (const r of resources) {
        if (r.tags[tagKey]) {
          taggedCount++;
          taggedCost += r.effectiveCost;
        } else {
          untaggedCount++;
          untaggedCost += r.effectiveCost;
        }
      }

      const totalCount = taggedCount + untaggedCount;
      const compliancePct = totalCount > 0 ? (taggedCount / totalCount) * 100 : 0;

      return {
        tagKey,
        taggedCount,
        untaggedCount,
        totalCount,
        compliancePct: Math.round(compliancePct * 10) / 10,
        untaggedCost: Math.round(untaggedCost * 100) / 100,
        taggedCost: Math.round(taggedCost * 100) / 100,
      };
    });
  }, [resources, requiredTags]);

  // Overall compliance score
  const overallScore = useMemo(() => {
    if (compliance.length === 0) return 0;
    const avg = compliance.reduce((sum, c) => sum + c.compliancePct, 0) / compliance.length;
    return Math.round(avg * 10) / 10;
  }, [compliance]);

  const totalUntaggedCost = useMemo(
    () => compliance.reduce((sum, c) => sum + c.untaggedCost, 0),
    [compliance]
  );

  // Untagged resources for a selected tag
  const untaggedResources = useMemo(() => {
    if (!showUntagged) return [];
    return resources
      .filter((r) => !r.tags[showUntagged])
      .sort((a, b) => b.effectiveCost - a.effectiveCost);
  }, [resources, showUntagged]);

  const chartData = compliance.map((c) => ({
    name: c.tagKey,
    tagged: c.compliancePct,
    untagged: Math.round((100 - c.compliancePct) * 10) / 10,
  }));

  const addTag = () => {
    const tag = customTag.trim();
    if (tag && !requiredTags.includes(tag)) {
      setRequiredTags((prev) => [...prev, tag]);
      setCustomTag("");
    }
  };

  const removeTag = (tag: string) => {
    setRequiredTags((prev) => prev.filter((t) => t !== tag));
    if (showUntagged === tag) setShowUntagged(null);
  };

  const scoreColor =
    overallScore >= 80 ? "text-green-600 dark:text-green-400" :
    overallScore >= 50 ? "text-amber-600 dark:text-amber-400" :
    "text-red-500";

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Overall Compliance
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className={`text-3xl font-bold tracking-tight ${scoreColor}`}>
              {overallScore}%
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Average across {requiredTags.length} required tags
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Resources
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <Tag className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {resources.length.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {allTagKeys.length} unique tag keys found
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-500/10" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Untagged Cost
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {formatCompact(totalUntaggedCost)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Cost of resources missing required tags
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Required Tags
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <Filter className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {requiredTags.length}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Tags being tracked</p>
          </CardContent>
        </Card>
      </div>

      {/* Required Tags Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Required Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {requiredTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <span className="text-xs">&times;</span>
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <select
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              className="h-8 rounded-lg border bg-background px-2 text-sm"
            >
              <option value="">Add a tag...</option>
              {allTagKeys
                .filter((k) => !requiredTags.includes(k))
                .map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
            </select>
            <Button variant="outline" size="sm" className="h-8" onClick={addTag} disabled={!customTag}>
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compliance by Tag</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={buildChartConfig(["tagged", "untagged"])}
              className="h-[250px] w-full"
            >
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent formatter={(v) => `${v}%`} />} />
                <Bar dataKey="tagged" stackId="a" fill={CHART_COLORS[2]} name="Tagged" radius={0} />
                <Bar dataKey="untagged" stackId="a" fill={CHART_COLORS[4]} name="Untagged" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Compliance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compliance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag Key</TableHead>
                  <TableHead className="text-right">Tagged</TableHead>
                  <TableHead className="text-right">Untagged</TableHead>
                  <TableHead className="text-right">Compliance</TableHead>
                  <TableHead className="text-right">Untagged Cost</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compliance.map((c) => (
                  <TableRow key={c.tagKey}>
                    <TableCell className="font-medium">{c.tagKey}</TableCell>
                    <TableCell className="text-right font-mono text-green-600">{c.taggedCount}</TableCell>
                    <TableCell className="text-right font-mono text-amber-500">{c.untaggedCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${c.compliancePct >= 80 ? "bg-green-500" : c.compliancePct >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${c.compliancePct}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono w-12 text-right">{c.compliancePct}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-amber-500">
                      {formatCurrency(c.untaggedCost)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setShowUntagged(showUntagged === c.tagKey ? null : c.tagKey)}
                      >
                        {showUntagged === c.tagKey ? "Hide" : "Show"} untagged
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Untagged Resources Drill-down */}
      {showUntagged && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Resources Missing &quot;{showUntagged}&quot; Tag ({untaggedResources.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Resource Group</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {untaggedResources.slice(0, 100).map((r) => (
                    <TableRow key={r.ResourceName}>
                      <TableCell className="font-medium max-w-[200px] truncate">{r.ResourceName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.ResourceType}</TableCell>
                      <TableCell className="text-xs">{r.SubAccountName}</TableCell>
                      <TableCell className="text-xs">{r.x_ResourceGroupName}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(r.effectiveCost)}</TableCell>
                    </TableRow>
                  ))}
                  {untaggedResources.length > 100 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-4">
                        Showing top 100 of {untaggedResources.length} untagged resources
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
