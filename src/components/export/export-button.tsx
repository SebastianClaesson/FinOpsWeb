"use client";

import { FocusCostRecord } from "@/lib/types/focus";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface ExportButtonProps {
  data: FocusCostRecord[];
  filename?: string;
}

/**
 * Convert records to CSV string.
 */
function toCSV(data: FocusCostRecord[]): string {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map((record) =>
    headers
      .map((h) => {
        const val = record[h as keyof FocusCostRecord];
        const str = String(val ?? "");
        // Escape CSV values that contain commas, quotes, or newlines
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

/**
 * Convert records to an HTML table string.
 */
function toHTML(data: FocusCostRecord[]): string {
  if (data.length === 0) return "<p>No data</p>";
  const headers = Object.keys(data[0]);
  const headerRow = headers.map((h) => `<th>${h}</th>`).join("");
  const bodyRows = data
    .map(
      (record) =>
        `<tr>${headers
          .map((h) => {
            const val = record[h as keyof FocusCostRecord];
            return `<td>${String(val ?? "")}</td>`;
          })
          .join("")}</tr>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Cost Report Export</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 20px; }
  table { border-collapse: collapse; width: 100%; font-size: 12px; }
  th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
  th { background: #f5f5f5; font-weight: 600; position: sticky; top: 0; }
  tr:nth-child(even) { background: #fafafa; }
</style></head><body>
<h1>Cost Report Export</h1>
<p>Records: ${data.length}</p>
<table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>
</body></html>`;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportButton({ data, filename = "cost-report" }: ExportButtonProps) {
  const [format, setFormat] = useState("csv");

  const handleFormatChange = (value: string | null) => {
    if (value) setFormat(value);
  };

  const handleExport = () => {
    switch (format) {
      case "csv": {
        downloadFile(toCSV(data), `${filename}.csv`, "text/csv;charset=utf-8;");
        break;
      }
      case "html": {
        downloadFile(toHTML(data), `${filename}.html`, "text/html;charset=utf-8;");
        break;
      }
      case "json": {
        downloadFile(
          JSON.stringify(data, null, 2),
          `${filename}.json`,
          "application/json;charset=utf-8;"
        );
        break;
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={format} onValueChange={handleFormatChange}>
        <SelectTrigger className="h-8 w-24 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="csv">CSV</SelectItem>
          <SelectItem value="json">JSON</SelectItem>
          <SelectItem value="html">HTML</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleExport}>
        <Download className="h-3.5 w-3.5" />
        Export
      </Button>
    </div>
  );
}
