"use client";

import { FilterState } from "@/lib/types/focus";
import { MultiSelect } from "@/components/filters/multi-select";
import { Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableSubscriptions: string[];
  availableResourceGroups: string[];
  availableRegions: string[];
  availableServices: string[];
  availableCommitmentTypes: string[];
  availableTagKeys?: Record<string, string[]>;
  tagFilters?: Record<string, string[]>;
  onTagFiltersChange?: (tagFilters: Record<string, string[]>) => void;
  amortizedView?: boolean;
  onAmortizedChange?: (v: boolean) => void;
  showInUsd?: boolean;
  onShowInUsdChange?: (v: boolean) => void;
}

export function FilterBar({
  filters,
  onFiltersChange,
  availableSubscriptions,
  availableResourceGroups,
  availableRegions,
  availableServices,
  availableCommitmentTypes,
  availableTagKeys,
  tagFilters,
  onTagFiltersChange,
  amortizedView,
  onAmortizedChange,
  showInUsd,
  onShowInUsdChange,
}: FilterBarProps) {
  const hasActiveFilters =
    filters.subscriptions.length > 0 ||
    filters.resourceGroups.length > 0 ||
    filters.regions.length > 0 ||
    filters.services.length > 0 ||
    filters.commitmentTypes.length > 0 ||
    (tagFilters && Object.values(tagFilters).some((v) => v.length > 0));

  const clearAllFilters = () => {
    onFiltersChange({
      ...filters,
      subscriptions: [],
      resourceGroups: [],
      regions: [],
      services: [],
      commitmentTypes: [],
    });
    if (onTagFiltersChange) {
      onTagFiltersChange({});
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 shadow-sm">
      {/* Date range */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <label className="text-xs font-semibold uppercase tracking-wider">
            Period
          </label>
        </div>
        <input
          type="date"
          value={filters.dateRange.start}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              dateRange: { ...filters.dateRange, start: e.target.value },
            })
          }
          className="h-8 rounded-lg border border-border/50 bg-background px-2.5 text-sm transition-colors focus:border-primary focus:outline-none"
        />
        <span className="text-xs text-muted-foreground">to</span>
        <input
          type="date"
          value={filters.dateRange.end}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              dateRange: { ...filters.dateRange, end: e.target.value },
            })
          }
          className="h-8 rounded-lg border border-border/50 bg-background px-2.5 text-sm transition-colors focus:border-primary focus:outline-none"
        />
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="ml-auto h-7 gap-1 rounded-lg text-xs text-muted-foreground hover:text-destructive"
          >
            <X className="h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>

      {/* Dimension filters */}
      <div className="flex flex-wrap gap-1.5">
        <MultiSelect
          label="Subscription"
          options={availableSubscriptions}
          selected={filters.subscriptions}
          onChange={(v) => onFiltersChange({ ...filters, subscriptions: v })}
        />
        <MultiSelect
          label="Resource Group"
          options={availableResourceGroups}
          selected={filters.resourceGroups}
          onChange={(v) => onFiltersChange({ ...filters, resourceGroups: v })}
        />
        <MultiSelect
          label="Region"
          options={availableRegions}
          selected={filters.regions}
          onChange={(v) => onFiltersChange({ ...filters, regions: v })}
        />
        <MultiSelect
          label="Service"
          options={availableServices}
          selected={filters.services}
          onChange={(v) => onFiltersChange({ ...filters, services: v })}
        />
        <MultiSelect
          label="Commitment"
          options={availableCommitmentTypes}
          selected={filters.commitmentTypes}
          onChange={(v) => onFiltersChange({ ...filters, commitmentTypes: v })}
        />
      </div>

      {/* Tag filters */}
      {availableTagKeys && onTagFiltersChange && tagFilters && (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(availableTagKeys).map(([tagKey, tagValues]) => (
            <MultiSelect
              key={tagKey}
              label={`Tag: ${tagKey}`}
              options={tagValues}
              selected={tagFilters[tagKey] ?? []}
              onChange={(v) =>
                onTagFiltersChange({ ...tagFilters, [tagKey]: v })
              }
            />
          ))}
        </div>
      )}

      {/* Amortized & USD view toggles */}
      {(onAmortizedChange || onShowInUsdChange) && (
        <div className="flex items-center gap-4">
          {onAmortizedChange && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Amortized</label>
              <button
                onClick={() => onAmortizedChange(!amortizedView)}
                className={`relative h-5 w-9 rounded-full transition-colors ${amortizedView ? 'bg-primary' : 'bg-input'}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${amortizedView ? 'translate-x-4' : ''}`} />
              </button>
            </div>
          )}
          {onShowInUsdChange && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">USD</label>
              <button
                onClick={() => onShowInUsdChange(!showInUsd)}
                className={`relative h-5 w-9 rounded-full transition-colors ${showInUsd ? 'bg-primary' : 'bg-input'}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${showInUsd ? 'translate-x-4' : ''}`} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
