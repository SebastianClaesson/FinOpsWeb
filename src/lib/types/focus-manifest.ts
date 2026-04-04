/**
 * Azure Cost Management FOCUS export manifest.json schema.
 * Included alongside partitioned CSV data files in every export.
 */

export interface FocusExportManifest {
  manifestVersion: string;
  byteCount: number;
  blobCount: number;
  dataRowCount: number;
  exportConfig: {
    exportName: string;
    resourceId: string;
    /** Schema version: "1.0", "1.0r2", "1.0-preview(v1)", etc. */
    dataVersion: string;
    apiVersion: string;
    /** Dataset type: "FocusCost", "ActualCost", "AmortizedCost", "PriceSheet", etc. */
    type: string;
    /** "OneTime", "TheLastMonth", "MonthToDate" */
    timeFrame: string;
    /** "Daily" or null */
    granularity: string | null;
  };
  deliveryConfig: {
    partitionData: boolean;
    dataOverwriteBehavior: string;
    /** "Csv" or "Parquet" */
    fileFormat: string;
    /** "None", "Gzip", "Snappy" */
    compressionMode: string;
    containerUri: string;
    rootFolderPath: string;
  };
  runInfo: {
    /** "Scheduled" or "OnDemand" */
    executionType: string;
    submittedTime: string;
    runId: string;
    /** Start of exported date range (ISO 8601) */
    startDate: string;
    /** End of exported date range (ISO 8601) */
    endDate: string;
  };
  blobs: {
    blobName: string;
    byteCount: number;
    dataRowCount: number;
  }[];
}

/**
 * Parsed metadata extracted from a manifest for display in the UI.
 */
export interface ExportMetadata {
  exportName: string;
  dataVersion: string;
  type: string;
  startDate: string;
  endDate: string;
  totalRows: number;
  totalBytes: number;
  fileCount: number;
  fileNames: string[];
  granularity: string | null;
  executionType: string;
  submittedAt: string;
}

/**
 * Parse a manifest.json and extract useful metadata.
 */
export function parseManifest(json: unknown): ExportMetadata | null {
  try {
    const m = json as FocusExportManifest;
    if (!m.exportConfig || !m.runInfo || !m.blobs) return null;

    return {
      exportName: m.exportConfig.exportName,
      dataVersion: m.exportConfig.dataVersion,
      type: m.exportConfig.type,
      startDate: m.runInfo.startDate,
      endDate: m.runInfo.endDate,
      totalRows: m.dataRowCount,
      totalBytes: m.byteCount,
      fileCount: m.blobCount,
      fileNames: m.blobs.map((b) => {
        // Extract just the filename from the blob path
        const parts = b.blobName.split("/");
        return parts[parts.length - 1];
      }),
      granularity: m.exportConfig.granularity,
      executionType: m.runInfo.executionType,
      submittedAt: m.runInfo.submittedTime,
    };
  } catch {
    return null;
  }
}
