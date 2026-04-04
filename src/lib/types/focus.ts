/**
 * FOCUS (FinOps Open Cost and Usage Specification) v1.0 / v1.0r2 schema types.
 * See: https://focus.finops.org/
 *
 * This type covers the columns present in Azure "Cost and Usage (FOCUS)" exports.
 * Fields marked as optional (?) may not be present in all export versions.
 */

export interface FocusCostRecord {
  // Cost columns
  BilledCost: number;
  EffectiveCost: number;
  ListCost: number;
  ContractedCost: number;

  // Time
  ChargePeriodStart: string; // ISO date
  ChargePeriodEnd: string;
  BillingPeriodStart: string;
  BillingPeriodEnd: string;

  // Charge classification
  ChargeCategory: "Usage" | "Purchase" | "Tax" | "Credit" | "Adjustment";
  ChargeClass?: string; // v1.0r2: "Correction" or empty
  ChargeSubcategory: string;
  ChargeDescription: string;
  ChargeFrequency: "One-Time" | "Recurring" | "Usage-Based";

  // Pricing
  PricingCategory: "On-Demand" | "Commitment Discount" | "Dynamic" | "Other" | "Standard";
  PricingQuantity: number;
  PricingUnit: string;
  ListUnitPrice: number;
  ContractedUnitPrice: number;

  // Usage
  ConsumedQuantity: number;
  ConsumedUnit: string;

  // Service
  ServiceCategory: string;
  ServiceName: string;
  ProviderName: string;
  PublisherName: string;

  // Resource
  ResourceId: string;
  ResourceName: string;
  ResourceType: string;

  // Region
  RegionId: string;
  RegionName: string;

  // Account hierarchy
  BillingAccountId: string;
  BillingAccountName: string;
  BillingAccountType?: string; // "Billing Profile", "Enterprise Agreement", etc.
  SubAccountId: string;
  SubAccountName: string;
  SubAccountType?: string; // "Subscription"

  // SKU
  SkuId: string;
  SkuPriceId: string;

  // Commitment discounts
  CommitmentDiscountId: string;
  CommitmentDiscountName: string;
  CommitmentDiscountStatus: string;
  CommitmentDiscountType: string;
  CommitmentDiscountCategory?: string; // v1.0r2: "Usage", "Spend"

  // Invoice
  InvoiceIssuerName?: string;

  // Currency
  BillingCurrency: string;

  // Tags (JSON string)
  Tags: string;

  // Microsoft extension columns
  x_ResourceGroupName: string;
  x_PricingSubcategory: string;
  x_SkuMeterCategory: string;
  x_SkuMeterSubcategory: string;
  x_SkuMeterName: string;
  x_CostCenter: string;

  // MCA billing hierarchy extensions
  x_BillingProfileId?: string;
  x_BillingProfileName?: string;
  x_InvoiceSectionId?: string;
  x_InvoiceSectionName?: string;
  x_InvoiceId?: string;

  // Additional Microsoft extensions (present in FOCUS exports)
  x_AccountId?: string;
  x_AccountName?: string;
  x_AccountOwnerId?: string;
  x_BilledCostInUsd?: number;
  x_BilledUnitPrice?: number;
  x_BillingAccountId?: string;
  x_BillingAccountName?: string;
  x_BillingExchangeRate?: number;
  x_BillingExchangeRateDate?: string;
  x_ContractedCostInUsd?: number;
  x_EffectiveCostInUsd?: number;
  x_EffectiveUnitPrice?: number;
  x_ListCostInUsd?: number;
  x_PricingBlockSize?: number;
  x_PricingCurrency?: string;
  x_PricingUnitDescription?: string;
  x_PublisherCategory?: string;
  x_ResourceType?: string;
  x_ServicePeriodEnd?: string;
  x_ServicePeriodStart?: string;
  x_SkuDescription?: string;
  x_SkuRegion?: string;
  x_SkuServiceFamily?: string;
  x_SkuTerm?: number;
  x_SkuTier?: string;
  x_SkuOfferId?: string;
  x_SkuPartNumber?: string;
}

export interface FilterState {
  dateRange: {
    start: string; // ISO date
    end: string;
  };
  subscriptions: string[];
  resourceGroups: string[];
  regions: string[];
  services: string[];
  commitmentTypes: string[];
  currency: string;
}
