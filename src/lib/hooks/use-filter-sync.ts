"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { FilterState } from "@/lib/types/focus";

/**
 * Bidirectionally syncs FilterState with URL search params.
 *
 * URL format: ?start=2026-01-01&end=2026-03-31&subs=A,B&rgs=C&regions=D&services=E&commit=F&currency=SEK
 * Empty arrays are omitted from the URL.
 */

function filtersToParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.dateRange.start) params.set("start", filters.dateRange.start);
  if (filters.dateRange.end) params.set("end", filters.dateRange.end);
  if (filters.subscriptions.length > 0) params.set("subs", filters.subscriptions.join(","));
  if (filters.resourceGroups.length > 0) params.set("rgs", filters.resourceGroups.join(","));
  if (filters.regions.length > 0) params.set("regions", filters.regions.join(","));
  if (filters.services.length > 0) params.set("services", filters.services.join(","));
  if (filters.commitmentTypes.length > 0) params.set("commit", filters.commitmentTypes.join(","));
  if (filters.currency) params.set("currency", filters.currency);

  return params;
}

function paramsToFilters(params: URLSearchParams, currentFilters: FilterState): FilterState | null {
  const hasFilterParams = ["start", "end", "subs", "rgs", "regions", "services", "commit", "currency"]
    .some((key) => params.has(key));

  if (!hasFilterParams) return null;

  return {
    dateRange: {
      start: params.get("start") || currentFilters.dateRange.start,
      end: params.get("end") || currentFilters.dateRange.end,
    },
    subscriptions: params.get("subs")?.split(",").filter(Boolean) ?? [],
    resourceGroups: params.get("rgs")?.split(",").filter(Boolean) ?? [],
    regions: params.get("regions")?.split(",").filter(Boolean) ?? [],
    services: params.get("services")?.split(",").filter(Boolean) ?? [],
    commitmentTypes: params.get("commit")?.split(",").filter(Boolean) ?? [],
    currency: params.get("currency") || currentFilters.currency,
  };
}

/**
 * Hook to sync filter state with URL search params.
 * Uses window.location directly to avoid the useSearchParams Suspense requirement.
 */
export function useFilterSync(
  filters: FilterState,
  setFilters: (filters: FilterState) => void,
  isLoading: boolean
) {
  const pathname = usePathname();
  const initializedRef = useRef(false);
  const updatingUrlRef = useRef(false);

  // On mount + data loaded: apply URL params to filters
  useEffect(() => {
    if (isLoading || initializedRef.current) return;
    if (typeof window === "undefined") return;
    initializedRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const fromUrl = paramsToFilters(params, filters);
    if (fromUrl) {
      setFilters(fromUrl);
    }
  }, [isLoading, filters, setFilters]);

  // On filter change: update URL (debounced)
  useEffect(() => {
    if (!initializedRef.current || updatingUrlRef.current) return;
    if (typeof window === "undefined") return;

    const timer = setTimeout(() => {
      const newParams = filtersToParams(filters);
      const currentParams = new URLSearchParams(window.location.search);

      if (newParams.toString() !== currentParams.toString()) {
        updatingUrlRef.current = true;
        const url = newParams.toString() ? `${pathname}?${newParams.toString()}` : pathname;
        window.history.replaceState(null, "", url);
        setTimeout(() => { updatingUrlRef.current = false; }, 100);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, pathname]);
}
