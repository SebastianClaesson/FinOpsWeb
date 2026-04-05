/**
 * Server-side FOCUS Parquet file parser.
 * Uses hyparquet to read Parquet files and aggregate directly
 * into the pre-aggregation maps — no intermediate record arrays.
 */

import { asyncBufferFromFile, parquetReadObjects } from "hyparquet";
import { FocusCostRecord } from "@/lib/types/focus";
import { AggregationMaps, aggregateRecord } from "./aggregate";

function toNumber(value: unknown): number {
  if (value == null) return 0;
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

function toString(value: unknown): string {
  if (value == null) return "";
  return String(value);
}

function mapRow(raw: Record<string, unknown>): FocusCostRecord {
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

export interface ParquetAggregateResult {
  rowCount: number;
  errors: string[];
  truncated: boolean;
}

/**
 * Parse a Parquet file and aggregate directly into the provided maps.
 * Reads in chunks to avoid loading all rows into memory at once.
 */
export async function parseParquetAndAggregate(
  filePath: string,
  maps: AggregationMaps,
  maxRows?: number
): Promise<ParquetAggregateResult> {
  const limit = maxRows ?? 500_000;
  const errors: string[] = [];
  let rowCount = 0;
  let truncated = false;

  try {
    const file = await asyncBufferFromFile(filePath);

    // Read in batches to limit memory usage
    const batchSize = 10_000;
    let rowStart = 0;

    while (rowCount < limit) {
      const rowEnd = Math.min(rowStart + batchSize, limit);
      const rows = await parquetReadObjects({ file, rowStart, rowEnd });

      if (rows.length === 0) break;

      for (const raw of rows) {
        if (rowCount >= limit) {
          truncated = true;
          break;
        }
        aggregateRecord(mapRow(raw as Record<string, unknown>), maps);
        rowCount++;
      }

      rowStart = rowEnd;
      if (rows.length < batchSize) break; // End of file
    }
  } catch (err) {
    errors.push(err instanceof Error ? err.message : "Failed to parse parquet file");
  }

  return { rowCount, errors, truncated };
}
