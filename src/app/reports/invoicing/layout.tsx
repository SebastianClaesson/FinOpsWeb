"use client";

import { ReportProvider, useReport } from "@/components/reports/report-context";
import { FilterBar } from "@/components/filters/filter-bar";
import { ExportButton } from "@/components/export/export-button";
import { Suspense, type ReactNode } from "react";

function ReportShell({ children }: { children: ReactNode }) {
  const {
    filteredFacts, filters, setFilters,
    amortizedView, setAmortizedView,
    showInUsd, setShowInUsd,
    availableSubscriptions, availableResourceGroups, availableRegions,
    availableServices, availableCommitmentTypes, availableTagKeys,
  } = useReport();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoicing &amp; Chargeback</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Billed cost trends and invoice reconciliation &middot;{" "}
            <span className="font-mono text-xs">{filteredFacts.length.toLocaleString()} records</span>
          </p>
        </div>
        <ExportButton data={filteredFacts} filename="invoicing" />
      </div>
      <FilterBar
        filters={filters} onFiltersChange={setFilters}
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
      <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
        {children}
      </Suspense>
    </div>
  );
}

export default function InvoicingLayout({ children }: { children: ReactNode }) {
  return (
    <ReportProvider>
      <ReportShell>{children}</ReportShell>
    </ReportProvider>
  );
}
