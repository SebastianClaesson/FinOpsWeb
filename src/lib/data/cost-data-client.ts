/**
 * Client-side data layer.
 *
 * Data source priority:
 * 1. IndexedDB (user-uploaded CSV data, persists across refreshes)
 * 2. Server API /api/cost-data (server-side CSV files or dummy data)
 *
 * All data is pre-aggregated — the client never receives raw CSV records.
 */

import { PreAggregatedData } from "@/lib/types/aggregated";
import { parseManifest, type ExportMetadata } from "@/lib/types/focus-manifest";
import { parseFocusCsv, validateFocusHeaders } from "./csv-parser";
import { aggregateRecords } from "./aggregate";
import {
  saveAggregatedData,
  loadAggregatedData,
  clearStoredData,
} from "./indexed-db";

let cachedResponse: PreAggregatedData | null = null;

/**
 * Fetch pre-aggregated cost data. Checks IndexedDB first, then falls back to the API.
 */
export async function fetchCostData(
  force = false
): Promise<PreAggregatedData> {
  if (cachedResponse && !force) return cachedResponse;

  // Check IndexedDB for uploaded data
  if (typeof window !== "undefined") {
    try {
      const stored = await loadAggregatedData();
      if (stored && stored.data.factTable.length > 0) {
        cachedResponse = stored.data;
        return cachedResponse;
      }
    } catch {
      // IndexedDB unavailable, continue to API
    }
  }

  // Fall back to server API
  const res = await fetch("/api/cost-data");
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to load cost data: ${res.status} ${errorBody?.errors?.join(", ") ?? res.statusText}`
    );
  }

  cachedResponse = await res.json();
  return cachedResponse!;
}

/**
 * Parse and store uploaded CSV files in IndexedDB.
 * CSVs are parsed and aggregated in-browser, then stored as compact summaries.
 */
export async function uploadCsvFiles(
  files: File[]
): Promise<PreAggregatedData> {
  const allRecords: import("@/lib/types/focus").FocusCostRecord[] = [];
  const fileNames: string[] = [];
  const allErrors: string[] = [];
  let manifest: ExportMetadata | undefined;

  // Check for manifest.json first
  const manifestFile = files.find((f) => f.name.toLowerCase() === "manifest.json");
  if (manifestFile) {
    try {
      const manifestContent = await manifestFile.text();
      const parsed = parseManifest(JSON.parse(manifestContent));
      if (parsed) {
        manifest = parsed;
      }
    } catch {
      allErrors.push("manifest.json: failed to parse");
    }
  }

  // Process CSV files (including .csv.gz)
  const csvFiles = files.filter(
    (f) =>
      f.name.endsWith(".csv") ||
      f.name.endsWith(".csv.gz") ||
      f.type === "text/csv"
  );

  for (const file of csvFiles) {
    let content: string;
    if (file.name.endsWith(".gz")) {
      const buffer = await file.arrayBuffer();
      const ds = new DecompressionStream("gzip");
      const decompressed = new Response(
        new Blob([buffer]).stream().pipeThrough(ds)
      );
      content = await decompressed.text();
    } else {
      content = await file.text();
    }

    // Strip BOM if present
    if (content.charCodeAt(0) === 0xfeff) {
      content = content.slice(1);
    }

    // Validate headers
    const missing = validateFocusHeaders(content);
    if (missing.length > 0) {
      allErrors.push(`${file.name}: missing columns: ${missing.join(", ")}`);
      continue;
    }

    const result = parseFocusCsv(content);
    allRecords.push(...result.records);
    fileNames.push(file.name);

    if (result.errors.length > 0) {
      allErrors.push(...result.errors.map((e) => `${file.name}: ${e}`));
    }
  }

  if (allRecords.length === 0) {
    // Return empty aggregated data
    const empty = aggregateRecords([], "csv-upload", fileNames);
    return empty;
  }

  // Aggregate parsed records into compact format
  const data = aggregateRecords(allRecords, "csv-upload", fileNames);

  // Persist to IndexedDB
  const meta = {
    files: fileNames,
    recordCount: allRecords.length,
    uploadedAt: new Date().toISOString(),
  };
  await saveAggregatedData(data, meta);

  // Update cache
  cachedResponse = data;
  void manifest; // manifest metadata available for future use

  return cachedResponse;
}

/**
 * Clear uploaded data from IndexedDB and reset to server data.
 */
export async function clearUploadedData(): Promise<void> {
  await clearStoredData();
  cachedResponse = null;
}

/**
 * Clear the in-memory cache (does not affect IndexedDB).
 */
export function clearCostDataCache() {
  cachedResponse = null;
}
