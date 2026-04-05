"use client";

import { ReportProvider, useReport } from "@/components/reports/report-context";
import { FilterBar } from "@/components/filters/filter-bar";
import { ExportButton } from "@/components/export/export-button";
import { Suspense, type ReactNode } from "react";

function ReportShell({ children }: { children: ReactNode }) {
  const {
    filteredFacts,
    filters,
    setFilters,
    amortizedView,
    setAmortizedView,
    showInUsd,
    setShowInUsd,
    availableSubscriptions,
    availableResourceGroups,
    availableRegions,
    availableServices,
    availableCommitmentTypes,
    availableTagKeys,
    dataQuality,
    currency,
    manifest,
    dataSource,
    dataFiles,
    isLoading,
    loadError,
  } = useReport();

  const hasMixedCurrencies = dataQuality.currencies.length > 1;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading cost data...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-destructive">{loadError}</p>
          <p className="text-xs text-muted-foreground">Falling back to dummy data if available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cost Summary</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Azure consumption overview &middot;{" "}
            <span className="font-mono text-xs">
              {filteredFacts.length.toLocaleString()} rows
            </span>
            {(dataSource === "csv" || dataSource === "csv-upload") && dataFiles.length > 0 && (
              <>
                {" "}&middot;{" "}
                <span className="font-mono text-xs text-green-600 dark:text-green-400">
                  FOCUS CSV ({dataFiles.length} file{dataFiles.length !== 1 ? "s" : ""})
                </span>
              </>
            )}
            {" "}&middot;{" "}
            <span className="font-mono text-xs">{currency}</span>
            {manifest && (
              <>
                {" "}&middot;{" "}
                <span className="font-mono text-xs text-blue-600 dark:text-blue-400" title={`Exported ${new Date(manifest.submittedAt).toLocaleString()}`}>
                  Data: {new Date(manifest.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  –{new Date(manifest.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              </>
            )}
            {dataSource === "dummy" && (
              <>
                {" "}&middot;{" "}
                <span className="font-mono text-xs text-amber-600 dark:text-amber-400">
                  Sample data
                </span>
              </>
            )}
          </p>
        </div>
        <ExportButton data={filteredFacts} filename="cost-summary" />
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
        amortizedView={amortizedView}
        onAmortizedChange={setAmortizedView}
        showInUsd={showInUsd}
        onShowInUsdChange={setShowInUsd}
      />

      {hasMixedCurrencies && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          <strong>Mixed currencies detected:</strong> {dataQuality.currencies.join(", ")}.
          Cost totals may be inaccurate when mixing currencies. Use the Currency filter to view one currency at a time.
        </div>
      )}

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
