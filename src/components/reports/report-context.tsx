"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { FilterState } from "@/lib/types/focus";
import {
  PreAggregatedData,
  CostFactRow,
  ResourceDetail,
  PriceDetail,
  PurchaseDetail,
  UsageDetail,
  TagCostRow,
  DataQualityStats,
} from "@/lib/types/aggregated";
import { type ExportMetadata } from "@/lib/types/focus-manifest";
import { filterFactTable } from "@/lib/data/fact-helpers";
import { useFilterSync } from "@/lib/hooks/use-filter-sync";
import {
  fetchCostData,
  uploadCsvFiles,
  clearUploadedData,
} from "@/lib/data/cost-data-client";

interface ReportContextValue {
  /** Pre-aggregated fact table (all data, unfiltered) */
  factTable: CostFactRow[];
  /** Fact table filtered by current global filters */
  filteredFacts: CostFactRow[];
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  amortizedView: boolean;
  setAmortizedView: (v: boolean) => void;
  availableSubscriptions: string[];
  availableResourceGroups: string[];
  availableRegions: string[];
  availableServices: string[];
  availableCommitmentTypes: string[];
  availableTagKeys: Record<string, string[]>;
  /** Detail tables for specific report pages */
  resources: ResourceDetail[];
  prices: PriceDetail[];
  purchases: PurchaseDetail[];
  usage: UsageDetail[];
  tagCosts: TagCostRow[];
  dataQuality: DataQualityStats;
  /** Detected billing currency from the data (e.g. "SEK", "USD") */
  currency: string;
  /** Export manifest metadata (data freshness) */
  manifest: ExportMetadata | null;
  /** "csv" | "csv-upload" | "dummy" — indicates where data was loaded from */
  dataSource: "csv" | "csv-upload" | "dummy" | "loading";
  /** Files loaded (when source is csv) */
  dataFiles: string[];
  /** True while data is being fetched */
  isLoading: boolean;
  /** Error message if data loading failed */
  loadError: string | null;
  /** Reload data from the API */
  reloadData: () => void;
  /** Upload CSV files client-side (parsed + aggregated in browser) */
  uploadFiles: (files: File[]) => Promise<PreAggregatedData>;
  /** Clear uploaded data and revert to server/dummy data */
  clearUploaded: () => Promise<void>;
}

const ReportContext = createContext<ReportContextValue | null>(null);

export function useReport() {
  const ctx = useContext(ReportContext);
  if (!ctx) throw new Error("useReport must be used within ReportProvider");
  return ctx;
}

const emptyQuality: DataQualityStats = {
  totalRecords: 0,
  missingResourceName: 0,
  missingRegion: 0,
  missingService: 0,
  negativeCost: 0,
  zeroCost: 0,
  currencies: [],
};

export function ReportProvider({ children }: { children: ReactNode }) {
  const [aggregated, setAggregated] = useState<PreAggregatedData | null>(null);
  const [dataSource, setDataSource] = useState<"csv" | "csv-upload" | "dummy" | "loading">("loading");
  const [dataFiles, setDataFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = async (force = false) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchCostData(force);
      setAggregated(data);
      setDataSource(data.source);
      setDataFiles(data.meta.files ?? []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load data");
      setAggregated(null);
      setDataSource("dummy");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const reloadData = () => {
    loadData(true);
  };

  const uploadFiles = async (files: File[]): Promise<PreAggregatedData> => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await uploadCsvFiles(files);
      if (data.factTable.length > 0) {
        setAggregated(data);
        setDataSource(data.source);
        setDataFiles(data.meta.files ?? []);
      }
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const clearUploaded = async () => {
    await clearUploadedData();
    loadData(true);
  };

  const [amortizedView, setAmortizedView] = useState(false);

  const factTable = aggregated?.factTable ?? [];

  // Derive date range from fact table
  const dateRange = useMemo(() => {
    if (factTable.length === 0) return { start: "2024-10-01", end: "2025-03-31" };
    let minDate = factTable[0].date;
    let maxDate = factTable[0].date;
    for (const r of factTable) {
      if (r.date < minDate) minDate = r.date;
      if (r.date > maxDate) maxDate = r.date;
    }
    return { start: minDate, end: maxDate };
  }, [factTable]);

  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: "2024-10-01", end: "2025-03-31" },
    subscriptions: [],
    resourceGroups: [],
    regions: [],
    services: [],
    commitmentTypes: [],
    currency: "USD",
  });

  // Detect currency from data
  const detectedCurrency = useMemo(() => {
    if (factTable.length === 0) return "USD";
    return factTable[0].BillingCurrency || "USD";
  }, [factTable]);

  // Update date range and currency when data loads
  useEffect(() => {
    if (factTable.length > 0) {
      setFilters((prev) => ({
        ...prev,
        dateRange: dateRange,
        currency: detectedCurrency,
      }));
    }
  }, [dateRange, detectedCurrency, factTable.length]);

  // Filter options come pre-computed from the server
  const filterOptions = aggregated?.filterOptions;
  const availableSubscriptions = filterOptions?.subscriptions ?? [];
  const availableResourceGroups = filterOptions?.resourceGroups ?? [];
  const availableRegions = filterOptions?.regions ?? [];
  const availableServices = filterOptions?.services ?? [];
  const availableCommitmentTypes = filterOptions?.commitmentTypes ?? [];
  const availableTagKeys = filterOptions?.tagKeysAndValues ?? {};

  // Sync filters with URL search params
  useFilterSync(filters, setFilters, isLoading);

  // Apply filters to fact table
  const filteredFacts = useMemo(() => {
    let facts = filterFactTable(factTable, filters);
    if (amortizedView) {
      facts = facts.filter(f => f.ChargeCategory !== "Purchase");
    }
    return facts;
  }, [factTable, filters, amortizedView]);

  // Detail tables (unfiltered — pages apply their own filtering)
  const resources = aggregated?.resources ?? [];
  const prices = aggregated?.prices ?? [];
  const purchases = aggregated?.purchases ?? [];
  const usage = aggregated?.usage ?? [];
  const tagCosts = aggregated?.tagCosts ?? [];
  const dataQuality = aggregated?.dataQuality ?? emptyQuality;

  const value: ReportContextValue = {
    factTable,
    filteredFacts,
    filters,
    setFilters,
    amortizedView,
    setAmortizedView,
    availableSubscriptions,
    availableResourceGroups,
    availableRegions,
    availableServices,
    availableCommitmentTypes,
    availableTagKeys,
    resources,
    prices,
    purchases,
    usage,
    tagCosts,
    dataQuality,
    currency: detectedCurrency,
    manifest: aggregated?.meta.manifest ?? null,
    dataSource,
    dataFiles,
    isLoading,
    loadError,
    reloadData,
    uploadFiles,
    clearUploaded,
  };

  return (
    <ReportContext.Provider value={value}>{children}</ReportContext.Provider>
  );
}
