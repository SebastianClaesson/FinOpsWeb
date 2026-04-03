"use client";

import { useState, useEffect } from "react";
import {
  loadSettings,
  saveSettings,
  resetSettings,
  DEFAULT_SETTINGS,
  type UserSettings,
} from "@/lib/config/user-settings";
import { getCostData, getUniqueValues } from "@/lib/data/cost-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, RotateCcw, User, Check } from "lucide-react";

const LOCALE_OPTIONS = [
  { value: "en-US", label: "English (US) — 1,234.56" },
  { value: "en-GB", label: "English (UK) — 1,234.56" },
  { value: "de-DE", label: "German — 1.234,56" },
  { value: "fr-FR", label: "French — 1 234,56" },
  { value: "sv-SE", label: "Swedish — 1 234,56" },
  { value: "ja-JP", label: "Japanese — 1,234.56" },
  { value: "nb-NO", label: "Norwegian — 1 234,56" },
];

const DATE_RANGE_OPTIONS = [
  { value: 1, label: "Last 1 month" },
  { value: 3, label: "Last 3 months" },
  { value: 6, label: "Last 6 months" },
  { value: 12, label: "Last 12 months" },
];

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200];

const LANDING_OPTIONS = [
  { value: "/reports/cost-summary", label: "Cost Summary" },
  { value: "/reports/invoicing", label: "Invoicing & Chargeback" },
  { value: "/reports/rate-optimization", label: "Rate Optimization" },
  { value: "/reports/governance", label: "Policy & Governance" },
  { value: "/reports/workload-optimization", label: "Workload Optimization" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Available subscriptions from data
  const [availableSubs, setAvailableSubs] = useState<string[]>([]);

  useEffect(() => {
    setSettings(loadSettings());
    const data = getCostData();
    setAvailableSubs(getUniqueValues(data, (r) => r.SubAccountName));
    setMounted(true);
  }, []);

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    resetSettings();
    setSettings(DEFAULT_SETTINGS);
  };

  const handleSelectChange = (field: keyof UserSettings) => (value: string | null) => {
    if (value === null) return;
    setSettings((s) => ({ ...s, [field]: value }));
  };

  const toggleSubscription = (sub: string) => {
    setSettings((s) => ({
      ...s,
      defaultSubscriptions: s.defaultSubscriptions.includes(sub)
        ? s.defaultSubscriptions.filter((v) => v !== sub)
        : [...s.defaultSubscriptions, sub],
    }));
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your default preferences. Settings are saved to your browser.
        </p>
      </div>

      {/* Default Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Default Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Date Range</label>
            <Select
              value={String(settings.defaultDateRangeMonths)}
              onValueChange={(v) =>
                v && setSettings((s) => ({ ...s, defaultDateRangeMonths: Number(v) }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              When opening a report, the date range will default to this period.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Default Subscriptions</label>
            <div className="flex flex-wrap gap-2">
              {availableSubs.map((sub) => {
                const isSelected = settings.defaultSubscriptions.includes(sub);
                return (
                  <button
                    key={sub}
                    onClick={() => toggleSubscription(sub)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    {sub}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {settings.defaultSubscriptions.length === 0
                ? "All subscriptions selected by default."
                : `${settings.defaultSubscriptions.length} subscription(s) pre-selected.`}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Default Currency</label>
            <Select
              value={settings.defaultCurrency}
              onValueChange={handleSelectChange("defaultCurrency")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD — US Dollar</SelectItem>
                <SelectItem value="EUR">EUR — Euro</SelectItem>
                <SelectItem value="GBP">GBP — British Pound</SelectItem>
                <SelectItem value="SEK">SEK — Swedish Krona</SelectItem>
                <SelectItem value="NOK">NOK — Norwegian Krone</SelectItem>
                <SelectItem value="JPY">JPY — Japanese Yen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Display Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Display Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Landing Report</label>
            <Select
              value={settings.defaultLandingReport}
              onValueChange={handleSelectChange("defaultLandingReport")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANDING_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Which report to show when you first open the portal.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Number Format</label>
            <Select
              value={settings.numberFormatLocale}
              onValueChange={handleSelectChange("numberFormatLocale")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCALE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Table Rows per Page</label>
            <Select
              value={String(settings.tablePageSize)}
              onValueChange={(v) =>
                v && setSettings((s) => ({ ...s, tablePageSize: Number(v) }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Yearly Budget</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">$</span>
              <input
                type="number"
                value={settings.yearlyBudget || ""}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    yearlyBudget: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="e.g. 500000"
                className="h-9 w-full rounded-lg border bg-background px-3 text-sm font-mono transition-colors focus:border-primary focus:outline-none"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Set a yearly budget to compare against actual spend on the Summary page. Leave empty for no budget.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Show Savings Columns</p>
              <p className="text-xs text-muted-foreground">
                Display savings columns in cost tables
              </p>
            </div>
            <button
              onClick={() =>
                setSettings((s) => ({ ...s, showSavings: !s.showSavings }))
              }
              className={`relative h-6 w-11 rounded-full transition-colors ${
                settings.showSavings ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  settings.showSavings ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Account Info (placeholder for MSAL) */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Not signed in
              </p>
              <p className="text-xs text-muted-foreground">
                Sign in with Entra ID to sync settings across devices
              </p>
            </div>
            <Badge variant="outline" className="ml-auto">
              Coming soon
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} className="gap-2">
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? "Saved!" : "Save Settings"}
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
