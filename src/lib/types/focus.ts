/**
 * FOCUS (FinOps Open Cost and Usage Specification) v1.0 schema types.
 * See: https://focus.finops.org/
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
  ChargeSubcategory: string;
  ChargeDescription: string;
  ChargeFrequency: "One-Time" | "Recurring" | "Usage-Based";

  // Pricing
  PricingCategory: "On-Demand" | "Commitment Discount" | "Dynamic" | "Other";
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
  SubAccountId: string;
  SubAccountName: string;

  // SKU
  SkuId: string;
  SkuPriceId: string;

  // Commitment discounts
  CommitmentDiscountId: string;
  CommitmentDiscountName: string;
  CommitmentDiscountStatus: string;
  CommitmentDiscountType: string;

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
