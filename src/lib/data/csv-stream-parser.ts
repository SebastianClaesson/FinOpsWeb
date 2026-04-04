/**
 * Streaming FOCUS CSV parser for large files (server-side).
 * Uses Node.js streams + PapaParse streaming mode to avoid
 * loading entire files into memory at once.
 */

import fs from "fs";
import Papa from "papaparse";
import { FocusCostRecord } from "@/lib/types/focus";
import { AggregationMaps, aggregateRecord } from "./aggregate";

/** Raw row from CSV (all values are strings). */
type RawRow = Record<string, string>;

function toNumber(value: string | undefined): number {
  if (!value || value === "") return 0;
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

function toString(value: string | undefined): string {
  return value ?? "";
}

function mapRow(raw: RawRow): FocusCostRecord {
  return {
    BilledCost: toNumber(raw.BilledCost),
    EffectiveCost: toNumber(raw.EffectiveCost),
    ListCost: toNumber(raw.ListCost),
    ContractedCost: toNumber(raw.ContractedCost),
    ChargePeriodStart: toString(raw.ChargePeriodStart).substring(0, 10),
    ChargePeriodEnd: toString(raw.ChargePeriodEnd).substring(0, 10),
    BillingPeriodStart: toString(raw.BillingPeriodStart).substring(0, 10),
    BillingPeriodEnd: toString(raw.BillingPeriodEnd).substring(0, 10),
    ChargeCategory: (toString(raw.ChargeCategory) || "Usage") as FocusCostRecord["ChargeCategory"],
    ChargeClass: toString(raw.ChargeClass) || undefined,
    ChargeSubcategory: toString(raw.ChargeSubcategory),
    ChargeDescription: toString(raw.ChargeDescription),
    ChargeFrequency: (toString(raw.ChargeFrequency) || "Usage-Based") as FocusCostRecord["ChargeFrequency"],
    PricingCategory: (toString(raw.PricingCategory) || "On-Demand") as FocusCostRecord["PricingCategory"],
    PricingQuantity: toNumber(raw.PricingQuantity),
    PricingUnit: toString(raw.PricingUnit),
    ListUnitPrice: toNumber(raw.ListUnitPrice),
    ContractedUnitPrice: toNumber(raw.ContractedUnitPrice),
    ConsumedQuantity: toNumber(raw.ConsumedQuantity),
    ConsumedUnit: toString(raw.ConsumedUnit),
    ServiceCategory: toString(raw.ServiceCategory),
    ServiceName: toString(raw.ServiceName),
    ProviderName: toString(raw.ProviderName || "Microsoft"),
    PublisherName: toString(raw.PublisherName || "Microsoft"),
    ResourceId: toString(raw.ResourceId),
    ResourceName: toString(raw.ResourceName),
    ResourceType: toString(raw.ResourceType),
    RegionId: toString(raw.RegionId),
    RegionName: toString(raw.RegionName),
    BillingAccountId: toString(raw.BillingAccountId),
    BillingAccountName: toString(raw.BillingAccountName),
    BillingAccountType: toString(raw.BillingAccountType) || undefined,
    SubAccountId: toString(raw.SubAccountId),
    SubAccountName: toString(raw.SubAccountName),
    SubAccountType: toString(raw.SubAccountType) || undefined,
    SkuId: toString(raw.SkuId),
    SkuPriceId: toString(raw.SkuPriceId),
    CommitmentDiscountId: toString(raw.CommitmentDiscountId),
    CommitmentDiscountName: toString(raw.CommitmentDiscountName),
    CommitmentDiscountStatus: toString(raw.CommitmentDiscountStatus),
    CommitmentDiscountType: toString(raw.CommitmentDiscountType),
    CommitmentDiscountCategory: toString(raw.CommitmentDiscountCategory) || undefined,
    InvoiceIssuerName: toString(raw.InvoiceIssuerName) || undefined,
    BillingCurrency: toString(raw.BillingCurrency || "USD"),
    Tags: toString(raw.Tags || "{}"),
    x_ResourceGroupName: toString(raw.x_ResourceGroupName),
    x_PricingSubcategory: toString(raw.x_PricingSubcategory),
    x_SkuMeterCategory: toString(raw.x_SkuMeterCategory),
    x_SkuMeterSubcategory: toString(raw.x_SkuMeterSubcategory),
    x_SkuMeterName: toString(raw.x_SkuMeterName),
    x_CostCenter: toString(raw.x_CostCenter),
    x_BillingProfileId: toString(raw.x_BillingProfileId) || undefined,
    x_BillingProfileName: toString(raw.x_BillingProfileName) || undefined,
    x_InvoiceSectionId: toString(raw.x_InvoiceSectionId) || undefined,
    x_InvoiceSectionName: toString(raw.x_InvoiceSectionName) || undefined,
    x_InvoiceId: toString(raw.x_InvoiceId) || undefined,
    x_BilledCostInUsd: toNumber(raw.x_BilledCostInUsd) || undefined,
    x_ContractedCostInUsd: toNumber(raw.x_ContractedCostInUsd) || undefined,
    x_EffectiveCostInUsd: toNumber(raw.x_EffectiveCostInUsd) || undefined,
    x_ListCostInUsd: toNumber(raw.x_ListCostInUsd) || undefined,
    x_BillingExchangeRate: toNumber(raw.x_BillingExchangeRate) || undefined,
    x_BillingExchangeRateDate: toString(raw.x_BillingExchangeRateDate) || undefined,
    x_AccountId: toString(raw.x_AccountId) || undefined,
    x_AccountName: toString(raw.x_AccountName) || undefined,
    x_AccountOwnerId: toString(raw.x_AccountOwnerId) || undefined,
    x_BilledUnitPrice: toNumber(raw.x_BilledUnitPrice) || undefined,
    x_EffectiveUnitPrice: toNumber(raw.x_EffectiveUnitPrice) || undefined,
    x_BillingAccountId: toString(raw.x_BillingAccountId) || undefined,
    x_BillingAccountName: toString(raw.x_BillingAccountName) || undefined,
    x_PricingBlockSize: toNumber(raw.x_PricingBlockSize) || undefined,
    x_PricingCurrency: toString(raw.x_PricingCurrency) || undefined,
    x_PricingUnitDescription: toString(raw.x_PricingUnitDescription) || undefined,
    x_PublisherCategory: toString(raw.x_PublisherCategory) || undefined,
    x_ResourceType: toString(raw.x_ResourceType) || undefined,
    x_ServicePeriodEnd: toString(raw.x_ServicePeriodEnd) || undefined,
    x_ServicePeriodStart: toString(raw.x_ServicePeriodStart) || undefined,
    x_SkuDescription: toString(raw.x_SkuDescription) || undefined,
    x_SkuRegion: toString(raw.x_SkuRegion) || undefined,
    x_SkuServiceFamily: toString(raw.x_SkuServiceFamily) || undefined,
    x_SkuTerm: toNumber(raw.x_SkuTerm) || undefined,
    x_SkuTier: toString(raw.x_SkuTier) || undefined,
    x_SkuOfferId: toString(raw.x_SkuOfferId) || undefined,
    x_SkuPartNumber: toString(raw.x_SkuPartNumber) || undefined,
  };
}

export interface StreamParseResult {
  records: FocusCostRecord[];
  rowCount: number;
  errors: string[];
  truncated: boolean;
}

export interface StreamAggregateResult {
  rowCount: number;
  errors: string[];
  truncated: boolean;
}

/** Default maximum rows to load per file. Override via FOCUS_MAX_ROWS env var. */
function getMaxRows(): number {
  const env = process.env.FOCUS_MAX_ROWS;
  if (env) {
    const n = Number(env);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  return 500_000; // 500K rows default — keeps memory under ~1 GB total
}

/**
 * Parse a large CSV file using streaming (server-side only).
 * Reads the file as a Node.js stream to avoid loading it all into memory.
 * Stops after maxRows to prevent OOM on very large exports.
 */
export function parseFileStream(
  filePath: string,
  maxRows?: number
): Promise<StreamParseResult> {
  const limit = maxRows ?? getMaxRows();

  return new Promise((resolve, reject) => {
    const records: FocusCostRecord[] = [];
    const errors: string[] = [];
    let truncated = false;

    const fileStream = fs.createReadStream(filePath, {
      encoding: "utf-8",
      highWaterMark: 256 * 1024, // 256 KB chunks — reduces GC pressure vs default 64 KB
    });

    // Strip BOM from first chunk
    let firstChunk = true;

    Papa.parse(fileStream, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (header: string) => {
        // Strip BOM from first header
        if (firstChunk) {
          firstChunk = false;
          return header.replace(/^\uFEFF/, "").trim();
        }
        return header.trim();
      },
      step: (result: Papa.ParseStepResult<RawRow>, parser: Papa.Parser) => {
        if (result.errors.length > 0) {
          for (const err of result.errors) {
            if (errors.length < 10) {
              errors.push(`Row ${err.row}: ${err.message}`);
            }
          }
          return;
        }

        if (records.length >= limit) {
          truncated = true;
          parser.abort();
          return;
        }

        records.push(mapRow(result.data));
      },
      complete: () => {
        resolve({ records, rowCount: records.length, errors, truncated });
      },
      error: (err: Error) => {
        reject(err);
      },
    });
  });
}

/**
 * Parse a large CSV file and aggregate directly into the provided maps.
 * Never builds an array of raw records — memory stays proportional to
 * the number of unique dimension combinations, not the number of rows.
 */
export function parseAndAggregate(
  filePath: string,
  maps: AggregationMaps,
  maxRows?: number
): Promise<StreamAggregateResult> {
  const limit = maxRows ?? getMaxRows();

  return new Promise((resolve, reject) => {
    const errors: string[] = [];
    let rowCount = 0;
    let truncated = false;

    const fileStream = fs.createReadStream(filePath, {
      encoding: "utf-8",
      highWaterMark: 256 * 1024,
    });

    let firstChunk = true;

    Papa.parse(fileStream, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (header: string) => {
        if (firstChunk) {
          firstChunk = false;
          return header.replace(/^\uFEFF/, "").trim();
        }
        return header.trim();
      },
      step: (result: Papa.ParseStepResult<RawRow>, parser: Papa.Parser) => {
        if (result.errors.length > 0) {
          for (const err of result.errors) {
            if (errors.length < 10) {
              errors.push(`Row ${err.row}: ${err.message}`);
            }
          }
          return;
        }

        if (rowCount >= limit) {
          truncated = true;
          parser.abort();
          return;
        }

        // Map and aggregate in one step — no intermediate array
        aggregateRecord(mapRow(result.data), maps);
        rowCount++;
      },
      complete: () => {
        resolve({ rowCount, errors, truncated });
      },
      error: (err: Error) => {
        reject(err);
      },
    });
  });
}
