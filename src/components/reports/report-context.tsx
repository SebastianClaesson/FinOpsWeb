"use client";

import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import { FocusCostRecord, FilterState } from "@/lib/types/focus";
import {
  getCostData,
  filterCostData,
  filterByTags,
  getUniqueValues,
  getUniqueTagKeysAndValues,
} from "@/lib/data/cost-data";

interface ReportContextValue {
  allData: FocusCostRecord[];
  filteredData: FocusCostRecord[];
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  tagFilters: Record<string, string[]>;
  setTagFilters: (tagFilters: Record<string, string[]>) => void;
  availableSubscriptions: string[];
  availableResourceGroups: string[];
  availableRegions: string[];
  availableServices: string[];
  availableCommitmentTypes: string[];
  availableTagKeys: Record<string, string[]>;
}

const ReportContext = createContext<ReportContextValue | null>(null);

export function useReport() {
  const ctx = useContext(ReportContext);
  if (!ctx) throw new Error("useReport must be used within ReportProvider");
  return ctx;
}

// Module-level cache — generated once, shared across re-renders
const ALL_DATA = getCostData();

export function ReportProvider({ children }: { children: ReactNode }) {
  const allData = ALL_DATA;

  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: "2024-10-01", end: "2025-03-31" },
    subscriptions: [],
    resourceGroups: [],
    regions: [],
    services: [],
    commitmentTypes: [],
    currency: "USD",
  });

  const [tagFilters, setTagFilters] = useState<Record<string, string[]>>({});

  // Compute available filter values from full dataset
  const availableSubscriptions = useMemo(
    () => getUniqueValues(allData, (r) => r.SubAccountName),
    [allData]
  );
  const availableResourceGroups = useMemo(
    () => getUniqueValues(allData, (r) => r.x_ResourceGroupName),
    [allData]
  );
  const availableRegions = useMemo(
    () => getUniqueValues(allData, (r) => r.RegionName),
    [allData]
  );
  const availableServices = useMemo(
    () => getUniqueValues(allData, (r) => r.ServiceCategory),
    [allData]
  );
  const availableCommitmentTypes = useMemo(() => {
    const types = new Set<string>();
    for (const r of allData) {
      if (r.PricingCategory === "On-Demand") types.add("On-Demand");
      if (r.CommitmentDiscountType) types.add(r.CommitmentDiscountType);
    }
    return [...types].sort();
  }, [allData]);
  const availableTagKeys = useMemo(
    () => getUniqueTagKeysAndValues(allData),
    [allData]
  );

  // Apply filters
  const filteredData = useMemo(() => {
    const dimensionFiltered = filterCostData(allData, filters);
    return filterByTags(dimensionFiltered, tagFilters);
  }, [allData, filters, tagFilters]);

  const value: ReportContextValue = {
    allData,
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
  };

  return (
    <ReportContext.Provider value={value}>{children}</ReportContext.Provider>
  );
}
