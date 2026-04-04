"use client";

import { useCallback } from "react";
import { useReport } from "@/components/reports/report-context";
import {
  formatCurrency as rawFormatCurrency,
  formatCompact as rawFormatCompact,
  formatCurrencyPrecise as rawFormatCurrencyPrecise,
} from "@/lib/utils/format";

/**
 * Hook that returns currency-aware format functions.
 * Automatically uses the detected currency from the loaded data.
 */
export function useCurrencyFormat() {
  const { currency } = useReport();

  const fmtCurrency = useCallback(
    (value: number) => rawFormatCurrency(value, currency),
    [currency]
  );

  const fmtCompact = useCallback(
    (value: number) => rawFormatCompact(value, currency),
    [currency]
  );

  const fmtPrecise = useCallback(
    (value: number) => rawFormatCurrencyPrecise(value, currency),
    [currency]
  );

  return { formatCurrency: fmtCurrency, formatCompact: fmtCompact, formatCurrencyPrecise: fmtPrecise, currency };
}
