/**
 * FinOps Toolkit Open Data types.
 * Source: https://github.com/microsoft/finops-toolkit/tree/main/src/open-data
 */

export interface RegionMapping {
  originalValue: string;
  regionId: string;
  regionName: string;
}

export interface PricingUnitMapping {
  unitOfMeasure: string;
  accountTypes: string;
  pricingBlockSize: number;
  distinctUnits: string;
}

export interface ServiceMapping {
  consumedService: string;
  resourceType: string;
  serviceName: string;
  serviceCategory: string;
  serviceSubcategory: string;
  publisherName: string;
  publisherType: string;
  environment: string;
  serviceModel: string;
}

export interface ResourceTypeMapping {
  resourceType: string;
  singularDisplayName: string;
  pluralDisplayName: string;
  lowerSingularDisplayName: string;
  lowerPluralDisplayName: string;
  isPreview: boolean;
  description: string;
  icon: string;
}
