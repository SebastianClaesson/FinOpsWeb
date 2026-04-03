"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";

type SortDir = "asc" | "desc";

/**
 * Hook for sortable table columns.
 * Returns sorted data + a SortHeader component wired to the state.
 */
export function useSortableTable<T>(
  data: T[],
  defaultField: keyof T & string,
  defaultDir: SortDir = "desc"
) {
  const [sortField, setSortField] = useState<string>(defaultField);
  const [sortDir, setSortDir] = useState<SortDir>(defaultDir);

  const toggleSort = useCallback(
    (field: string) => {
      if (sortField === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDir("desc");
      }
    },
    [sortField]
  );

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const mult = sortDir === "asc" ? 1 : -1;
      const aVal = a[sortField as keyof T];
      const bVal = b[sortField as keyof T];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return mult * aVal.localeCompare(bVal);
      }
      return mult * (Number(aVal) - Number(bVal));
    });
  }, [data, sortField, sortDir]);

  function SortHeader({
    field,
    children,
    align = "left",
  }: {
    field: string;
    children: React.ReactNode;
    align?: "left" | "right";
  }) {
    const isActive = sortField === field;
    return (
      <button
        onClick={() => toggleSort(field)}
        className={`inline-flex items-center gap-1 text-xs font-medium transition-colors hover:text-foreground ${
          align === "right" ? "ml-auto flex-row-reverse" : ""
        } ${isActive ? "text-foreground" : "text-muted-foreground"}`}
      >
        {children}
        {isActive ? (
          sortDir === "asc" ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-30" />
        )}
      </button>
    );
  }

  return { sorted, SortHeader, sortField, sortDir };
}
