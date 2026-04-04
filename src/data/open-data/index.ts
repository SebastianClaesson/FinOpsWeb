/**
 * FinOps Toolkit Open Data
 * https://github.com/microsoft/finops-toolkit/tree/main/src/open-data
 */

export type {
  RegionMapping,
  PricingUnitMapping,
  ServiceMapping,
  ResourceTypeMapping,
} from "./types";

export { regionAliases, regions, regionLookup, normalizeRegion } from "./regions";
export { pricingUnits, pricingUnitLookup, normalizePricingUnit } from "./pricing-units";
export { services, serviceLookup, lookupService } from "./services";
export { resourceTypes, resourceTypeLookup, lookupResourceType } from "./resource-types";
