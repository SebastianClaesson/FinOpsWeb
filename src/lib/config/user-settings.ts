/**
 * User preferences, persisted to localStorage.
 * When MSAL auth is added, these can be synced to a backend.
 */

export interface UserSettings {
  /** Default start date offset in months from today (e.g., -6 = 6 months ago) */
  defaultDateRangeMonths: number;
  /** Default subscriptions to pre-select (empty = all) */
  defaultSubscriptions: string[];
  /** Default currency */
  defaultCurrency: string;
  /** Which report to land on after login */
  defaultLandingReport: string;
  /** Number format locale (e.g., en-US, de-DE, sv-SE) */
  numberFormatLocale: string;
  /** Rows per page for tables */
  tablePageSize: number;
  /** Show savings columns by default */
  showSavings: boolean;
  /** Yearly budget in dollars (0 = no budget set) */
  yearlyBudget: number;
  /** Per-region yearly budgets (region name -> amount). Empty = no regional budgets. */
  regionBudgets: Record<string, number>;
  /** Budget alert thresholds as percentages (e.g. [80, 90, 100]) */
  budgetAlertThresholds: number[];
}

const STORAGE_KEY = "finops-user-settings";

export const DEFAULT_SETTINGS: UserSettings = {
  defaultDateRangeMonths: 6,
  defaultSubscriptions: [],
  defaultCurrency: "USD",
  defaultLandingReport: "/reports/cost-summary",
  numberFormatLocale: "en-US",
  tablePageSize: 50,
  showSavings: true,
  yearlyBudget: 0,
  regionBudgets: {},
  budgetAlertThresholds: [80, 90, 100],
};

export function loadSettings(): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function resetSettings(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
