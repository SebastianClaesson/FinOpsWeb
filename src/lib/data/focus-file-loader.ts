/**
 * Server-side FOCUS CSV file loader.
 * Uses streaming parser + aggregation for large files.
 */

import fs from "fs";
import path from "path";
import { parseAndAggregate } from "./csv-stream-parser";
import { parseParquetAndAggregate } from "./parquet-parser";
import { createMaps, finalizeAggregation } from "./aggregate";
import { PreAggregatedData } from "@/lib/types/aggregated";
import { parseManifest, type ExportMetadata } from "@/lib/types/focus-manifest";

function isDataFile(name: string): boolean {
  return name.endsWith(".csv") || name.endsWith(".parquet");
}

function isCsvFile(name: string): boolean {
  return name.endsWith(".csv");
}

function isParquetFile(name: string): boolean {
  return name.endsWith(".parquet");
}

function getExportsDir(): string {
  return process.env.FOCUS_EXPORTS_DIR || path.join(/* turbopackIgnore: true */ process.cwd(), "data", "exports");
}

/**
 * List all CSV files in the exports directory.
 */
export function listExportFiles(): { name: string; size: number; modified: Date }[] {
  const dir = getExportsDir();
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter(isDataFile)
    .map((name) => {
      const stat = fs.statSync(path.join(dir, name));
      return { name, size: stat.size, modified: stat.mtime };
    })
    .sort((a, b) => b.modified.getTime() - a.modified.getTime());
}

/** Global row budget across all files. Override via FOCUS_MAX_ROWS env var. */
function getGlobalMaxRows(): number {
  const env = process.env.FOCUS_MAX_ROWS;
  if (env) {
    const n = Number(env);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  return 500_000;
}

/** Path for the disk cache file. Sits alongside the CSV exports. */
function getCachePath(): string {
  return path.join(getExportsDir(), ".aggregated-cache.json");
}

/**
 * Check if the disk cache is still valid by comparing its mtime
 * against all CSV files in the exports directory.
 */
function isCacheValid(cachePath: string, csvFiles: string[], dir: string): boolean {
  if (!fs.existsSync(cachePath)) return false;
  const cacheStat = fs.statSync(cachePath);
  for (const file of csvFiles) {
    const csvStat = fs.statSync(path.join(dir, file));
    if (csvStat.mtimeMs > cacheStat.mtimeMs) return false;
  }
  return true;
}

/**
 * Load all FOCUS CSV files and return pre-aggregated data.
 * Results are cached to disk — subsequent loads read the cache
 * (~5 MB JSON) instead of re-parsing CSVs (~1 GB).
 * Cache auto-invalidates when any CSV file is newer than the cache.
 */
export async function loadAllExportsAggregated(): Promise<PreAggregatedData> {
  const dir = getExportsDir();

  if (!fs.existsSync(dir)) {
    const maps = createMaps();
    return finalizeAggregation(maps, "csv", [], false);
  }

  const dataFiles = fs
    .readdirSync(dir)
    .filter(isDataFile)
    .sort();

  // Try disk cache first
  const cachePath = getCachePath();
  if (isCacheValid(cachePath, dataFiles, dir)) {
    try {
      const cached = JSON.parse(fs.readFileSync(cachePath, "utf-8")) as PreAggregatedData;
      console.log(`[focus-file-loader] Loaded from cache (${cached.factTable.length} fact rows)`);
      return cached;
    } catch {
      // Cache corrupted — fall through to re-parse
    }
  }

  // Parse data files and aggregate
  console.log(`[focus-file-loader] Parsing ${dataFiles.length} data files...`);
  const maps = createMaps();
  const loadedFiles: string[] = [];
  const allErrors: string[] = [];
  const globalMax = getGlobalMaxRows();
  let totalRows = 0;
  let truncated = false;

  for (const file of dataFiles) {
    const remaining = globalMax - totalRows;
    if (remaining <= 0) {
      truncated = true;
      allErrors.push(`Skipped ${file}: global row limit (${globalMax}) reached`);
      continue;
    }

    const filePath = path.join(dir, file);

    try {
      let result: { rowCount: number; errors: string[]; truncated: boolean };

      if (isParquetFile(file)) {
        result = await parseParquetAndAggregate(filePath, maps, remaining);
      } else {
        result = await parseAndAggregate(filePath, maps, remaining);
      }

      totalRows += result.rowCount;
      loadedFiles.push(file);

      if (result.truncated) {
        truncated = true;
      }

      if (result.errors.length > 0) {
        allErrors.push(...result.errors.map((e) => `${file}: ${e}`));
      }
    } catch (err) {
      allErrors.push(`${file}: ${err instanceof Error ? err.message : "failed to read"}`);
    }
  }

  const data = finalizeAggregation(maps, "csv", loadedFiles, truncated);

  // Read manifest files for data freshness metadata
  const manifestFiles = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".json") && f.toLowerCase().includes("manifest"));
  let latestManifest: ExportMetadata | undefined;
  for (const mf of manifestFiles) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(dir, mf), "utf-8"));
      const parsed = parseManifest(raw);
      if (parsed) {
        if (!latestManifest || parsed.submittedAt > latestManifest.submittedAt) {
          latestManifest = parsed;
        }
      }
    } catch { /* skip invalid manifests */ }
  }
  if (latestManifest) {
    data.meta.manifest = latestManifest;
  }

  if (allErrors.length > 0) {
    console.warn("[focus-file-loader] Errors:", allErrors);
  }

  // Write cache to disk for instant subsequent loads
  try {
    fs.writeFileSync(cachePath, JSON.stringify(data));
    const sizeMB = (fs.statSync(cachePath).size / 1024 / 1024).toFixed(1);
    console.log(`[focus-file-loader] Cache written (${sizeMB} MB, ${data.factTable.length} fact rows)`);
  } catch (err) {
    console.warn("[focus-file-loader] Failed to write cache:", err);
  }

  return data;
}

/**
 * Check if there are any export files available.
 */
export function hasExportFiles(): boolean {
  const dir = getExportsDir();
  if (!fs.existsSync(dir)) return false;
  return fs.readdirSync(dir).some(isDataFile);
}
