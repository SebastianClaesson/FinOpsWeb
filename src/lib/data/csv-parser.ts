/**
 * FOCUS CSV parser.
 * Parses Azure Cost Management FOCUS 1.0 CSV exports into FocusCostRecord[].
 *
 * FOCUS exports use standard column names as headers. Numeric fields are parsed
 * to numbers; missing optional fields get sensible defaults.
 */

import Papa from "papaparse";
import { FocusCostRecord } from "@/lib/types/focus";

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

/**
 * Map a single raw CSV row to a FocusCostRecord.
 * Handles both FOCUS 1.0 column names and common variations.
 */
function mapRow(raw: RawRow): FocusCostRecord {
  return {
    // Cost columns
    BilledCost: toNumber(raw.BilledCost),
    EffectiveCost: toNumber(raw.EffectiveCost),
    ListCost: toNumber(raw.ListCost),
    ContractedCost: toNumber(raw.ContractedCost),

    // Time
    ChargePeriodStart: toString(raw.ChargePeriodStart).substring(0, 10), // normalize to YYYY-MM-DD
    ChargePeriodEnd: toString(raw.ChargePeriodEnd).substring(0, 10),
    BillingPeriodStart: toString(raw.BillingPeriodStart).substring(0, 10),
    BillingPeriodEnd: toString(raw.BillingPeriodEnd).substring(0, 10),

    // Charge classification
    ChargeCategory: (toString(raw.ChargeCategory) || "Usage") as FocusCostRecord["ChargeCategory"],
    ChargeSubcategory: toString(raw.ChargeSubcategory),
    ChargeDescription: toString(raw.ChargeDescription),
    ChargeFrequency: (toString(raw.ChargeFrequency) || "Usage-Based") as FocusCostRecord["ChargeFrequency"],

    // Pricing
    PricingCategory: (toString(raw.PricingCategory) || "On-Demand") as FocusCostRecord["PricingCategory"],
    PricingQuantity: toNumber(raw.PricingQuantity),
    PricingUnit: toString(raw.PricingUnit),
    ListUnitPrice: toNumber(raw.ListUnitPrice),
    ContractedUnitPrice: toNumber(raw.ContractedUnitPrice),

    // Usage
    ConsumedQuantity: toNumber(raw.ConsumedQuantity),
    ConsumedUnit: toString(raw.ConsumedUnit),

    // Service
    ServiceCategory: toString(raw.ServiceCategory),
    ServiceName: toString(raw.ServiceName),
    ProviderName: toString(raw.ProviderName || "Microsoft"),
    PublisherName: toString(raw.PublisherName || "Microsoft"),

    // Resource
    ResourceId: toString(raw.ResourceId),
    ResourceName: toString(raw.ResourceName),
    ResourceType: toString(raw.ResourceType),

    // Region
    RegionId: toString(raw.RegionId),
    RegionName: toString(raw.RegionName),

    // Account hierarchy
    BillingAccountId: toString(raw.BillingAccountId),
    BillingAccountName: toString(raw.BillingAccountName),
    SubAccountId: toString(raw.SubAccountId),
    SubAccountName: toString(raw.SubAccountName),

    // SKU
    SkuId: toString(raw.SkuId),
    SkuPriceId: toString(raw.SkuPriceId),

    // Commitment discounts
    CommitmentDiscountId: toString(raw.CommitmentDiscountId),
    CommitmentDiscountName: toString(raw.CommitmentDiscountName),
    CommitmentDiscountStatus: toString(raw.CommitmentDiscountStatus),
    CommitmentDiscountType: toString(raw.CommitmentDiscountType),

    // v1.0r2 additions
    ChargeClass: toString(raw.ChargeClass) || undefined,
    CommitmentDiscountCategory: toString(raw.CommitmentDiscountCategory) || undefined,

    // Account types
    BillingAccountType: toString(raw.BillingAccountType) || undefined,
    SubAccountType: toString(raw.SubAccountType) || undefined,

    // Invoice
    InvoiceIssuerName: toString(raw.InvoiceIssuerName) || undefined,

    // Currency
    BillingCurrency: toString(raw.BillingCurrency || "USD"),

    // Tags
    Tags: toString(raw.Tags || "{}"),

    // Microsoft extension columns (required)
    x_ResourceGroupName: toString(raw.x_ResourceGroupName),
    x_PricingSubcategory: toString(raw.x_PricingSubcategory),
    x_SkuMeterCategory: toString(raw.x_SkuMeterCategory),
    x_SkuMeterSubcategory: toString(raw.x_SkuMeterSubcategory),
    x_SkuMeterName: toString(raw.x_SkuMeterName),
    x_CostCenter: toString(raw.x_CostCenter),

    // MCA billing hierarchy extensions
    x_BillingProfileId: toString(raw.x_BillingProfileId) || undefined,
    x_BillingProfileName: toString(raw.x_BillingProfileName) || undefined,
    x_InvoiceSectionId: toString(raw.x_InvoiceSectionId) || undefined,
    x_InvoiceSectionName: toString(raw.x_InvoiceSectionName) || undefined,
    x_InvoiceId: toString(raw.x_InvoiceId) || undefined,

    // Cost in USD (for multi-currency)
    x_BilledCostInUsd: toNumber(raw.x_BilledCostInUsd) || undefined,
    x_ContractedCostInUsd: toNumber(raw.x_ContractedCostInUsd) || undefined,
    x_EffectiveCostInUsd: toNumber(raw.x_EffectiveCostInUsd) || undefined,
    x_ListCostInUsd: toNumber(raw.x_ListCostInUsd) || undefined,
    x_BillingExchangeRate: toNumber(raw.x_BillingExchangeRate) || undefined,
    x_BillingExchangeRateDate: toString(raw.x_BillingExchangeRateDate) || undefined,

    // Additional extensions
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

export interface ParseResult {
  records: FocusCostRecord[];
  rowCount: number;
  errors: string[];
}

/**
 * Parse a FOCUS CSV string into FocusCostRecord[].
 */
export function parseFocusCsv(csvContent: string): ParseResult {
  const errors: string[] = [];

  const parsed = Papa.parse<RawRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false, // we handle type conversion ourselves
    transformHeader: (header) => header.trim(),
  });

  if (parsed.errors.length > 0) {
    for (const err of parsed.errors) {
      errors.push(`Row ${err.row}: ${err.message}`);
    }
  }

  const records = parsed.data.map(mapRow);

  return {
    records,
    rowCount: records.length,
    errors,
  };
}

/**
 * Validate that a CSV has the minimum required FOCUS columns.
 * Returns missing column names, or empty array if valid.
 */
export function validateFocusHeaders(csvContent: string): string[] {
  const firstLine = csvContent.split("\n")[0];
  if (!firstLine) return ["No headers found"];

  const headers = firstLine.split(",").map((h) => h.trim().replace(/^"|"$/g, ""));

  const required = [
    "BilledCost",
    "EffectiveCost",
    "ChargePeriodStart",
    "ChargeCategory",
    "ServiceCategory",
    "ServiceName",
    "ResourceId",
    "SubAccountName",
    "BillingCurrency",
  ];

  return required.filter((col) => !headers.includes(col));
}
