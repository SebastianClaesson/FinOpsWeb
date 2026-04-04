/**
 * API route: GET /api/cost-data/files
 *
 * Lists available FOCUS CSV export files.
 */

import { listExportFiles, hasExportFiles } from "@/lib/data/focus-file-loader";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    hasExports: hasExportFiles(),
    files: listExportFiles(),
  });
}
