"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { type PreAggregatedData } from "@/lib/types/aggregated";

interface CsvUploadProps {
  dataSource: string;
  dataFiles: string[];
  recordCount: number;
  uploadedAt?: string;
  onUpload: (files: File[]) => Promise<PreAggregatedData>;
  onClear: () => Promise<void>;
}

export function CsvUpload({
  dataSource,
  dataFiles,
  recordCount,
  uploadedAt,
  onUpload,
  onClear,
}: CsvUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const allFiles = Array.from(files);
    const csvFiles = allFiles.filter(
      (f) =>
        f.name.endsWith(".csv") ||
        f.name.endsWith(".csv.gz") ||
        f.type === "text/csv"
    );
    const hasManifest = allFiles.some(
      (f) => f.name.toLowerCase() === "manifest.json"
    );

    if (csvFiles.length === 0) {
      setResult({ success: false, message: "No CSV files selected." });
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      // Pass both CSV files and manifest.json if present
      const filesToUpload = hasManifest
        ? [...csvFiles, ...allFiles.filter((f) => f.name.toLowerCase() === "manifest.json")]
        : csvFiles;
      const response = await onUpload(filesToUpload);

      if (response.factTable.length > 0) {
        setResult({
          success: true,
          message: `Loaded ${response.meta.totalRawRecords.toLocaleString()} records from ${response.meta.files?.length ?? 0} file(s).`,
        });
      } else {
        setResult({
          success: false,
          message: "No valid records found.",
        });
      }
    } catch (err) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : "Upload failed.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleClear = async () => {
    await onClear();
    setResult(null);
  };

  const isUploaded = dataSource === "csv-upload";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Data Source
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current status */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Current:</span>
          {dataSource === "csv-upload" && (
            <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20">
              FOCUS CSV Upload
            </Badge>
          )}
          {dataSource === "csv" && (
            <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20">
              FOCUS CSV (server)
            </Badge>
          )}
          {dataSource === "dummy" && (
            <Badge variant="secondary">Sample Data</Badge>
          )}
          {dataSource === "loading" && (
            <Badge variant="outline">Loading...</Badge>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {recordCount.toLocaleString()} records
          </span>
        </div>

        {/* File details for uploaded data */}
        {isUploaded && dataFiles.length > 0 && (
          <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
            {dataFiles.map((name) => (
              <div key={name} className="flex items-center gap-2 text-xs">
                <FileText className="h-3 w-3 text-muted-foreground" />
                <span className="font-mono">{name}</span>
              </div>
            ))}
            {uploadedAt && (
              <p className="text-xs text-muted-foreground pt-1">
                Uploaded {new Date(uploadedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.csv.gz,.gz,.json,.parquet"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          <Upload className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            Drag & drop FOCUS CSV file(s) here, or{" "}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-primary underline underline-offset-2 hover:text-primary/80"
              disabled={uploading}
            >
              browse
            </button>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Azure Cost Management &rarr; Exports &rarr; &quot;Cost and Usage (FOCUS)&quot;
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Include the manifest.json for export metadata
          </p>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-sm">Parsing CSV...</span>
              </div>
            </div>
          )}
        </div>

        {/* Result message */}
        {result && (
          <div
            className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
              result.success
                ? "border-green-500/30 bg-green-500/5 text-green-600 dark:text-green-400"
                : "border-destructive/30 bg-destructive/5 text-destructive"
            }`}
          >
            {result.success ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            <span className="whitespace-pre-line">{result.message}</span>
          </div>
        )}

        {/* Clear button */}
        {isUploaded && (
          <Button variant="outline" size="sm" onClick={handleClear} className="gap-2">
            <Trash2 className="h-3.5 w-3.5" />
            Clear uploaded data
          </Button>
        )}

        <p className="text-xs text-muted-foreground">
          Data is parsed in your browser and stored locally. Nothing is sent to a server.
        </p>
      </CardContent>
    </Card>
  );
}
