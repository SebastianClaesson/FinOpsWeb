/**
 * API route: GET /api/cost-data
 *
 * Returns pre-aggregated FOCUS cost data as JSON.
 * Data source priority:
 * 1. FOCUS CSV exports from the exports directory (if any exist)
 * 2. Generated dummy data (fallback)
 *
 * Query params:
 *   ?source=dummy   - force dummy data
 *   ?source=csv     - force CSV (returns error if no files)
 *   (omit)          - auto-detect
 *
 * Response shape: PreAggregatedData (see src/lib/types/aggregated.ts)
 */

import { NextRequest } from "next/server";
import { hasExportFiles, loadAllExportsAggregated } from "@/lib/data/focus-file-loader";
import { generateCostData } from "@/data/dummy/generate-data";
import { aggregateRecords } from "@/lib/data/aggregate";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get("source");

  // Determine data source
  const useCSV =
    source === "csv" ||
    (source !== "dummy" && hasExportFiles());

  if (useCSV) {
    const data = await loadAllExportsAggregated();

    if (data.factTable.length === 0 && data.meta.totalRawRecords === 0) {
      return Response.json(data, { status: 400 });
    }

    return Response.json(data);
  }

  // Fallback to dummy data
  const records = generateCostData();
  const data = aggregateRecords(records, "dummy");
  return Response.json(data);
}
