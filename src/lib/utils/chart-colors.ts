/**
 * Chart color palette using CSS custom properties.
 * These map to --chart-1 through --chart-10 in globals.css.
 */
export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
  "var(--chart-9)",
  "var(--chart-10)",
] as const;

/**
 * Get a chart color by index (wraps around).
 */
export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

/**
 * Build a ChartConfig object for shadcn/ui charts.
 */
export function buildChartConfig(
  keys: string[]
): Record<string, { label: string; color: string }> {
  const config: Record<string, { label: string; color: string }> = {};
  for (let i = 0; i < keys.length; i++) {
    config[keys[i]] = {
      label: keys[i],
      color: getChartColor(i),
    };
  }
  return config;
}
