"use client";

import { ReportProvider, useReport } from "@/components/reports/report-context";
import { FilterBar } from "@/components/filters/filter-bar";
import { ExportButton } from "@/components/export/export-button";
import { Suspense, type ReactNode } from "react";

function ReportShell({ children }: { children: ReactNode }) {
  const {
    filteredData,
    filters,
    setFilters,
    tagFilters,
    setTagFilters,
    availableSubscriptions,
    availableResourceGroups,
    availableRegions,
    availableServices,
    availableCommitmentTypes,
    availableTagKeys,
  } = useReport();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cost Summary</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Azure consumption overview &middot;{" "}
            <span className="font-mono text-xs">
              {filteredData.length.toLocaleString()} records
            </span>
          </p>
        </div>
        <ExportButton data={filteredData} filename="cost-summary" />
      </div>

      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        availableSubscriptions={availableSubscriptions}
        availableResourceGroups={availableResourceGroups}
        availableRegions={availableRegions}
        availableServices={availableServices}
        availableCommitmentTypes={availableCommitmentTypes}
        availableTagKeys={availableTagKeys}
        tagFilters={tagFilters}
        onTagFiltersChange={setTagFilters}
      />

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Loading report...</p>
            </div>
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}

export default function CostSummaryLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ReportProvider>
      <ReportShell>{children}</ReportShell>
    </ReportProvider>
  );
}
