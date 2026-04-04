/**
 * Pricing unit mappings from FinOps Toolkit open data.
 * Source: https://github.com/microsoft/finops-toolkit/blob/main/src/open-data/PricingUnits.csv
 *
 * Maps raw UnitOfMeasure values from billing data to normalized
 * block sizes and distinct unit names.
 */

import { PricingUnitMapping } from "./types";

export const pricingUnits: PricingUnitMapping[] = [
  { unitOfMeasure: "1", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "Units" },
  { unitOfMeasure: "1 /Day", accountTypes: "EA", pricingBlockSize: 1, distinctUnits: "Units/Day" },
  { unitOfMeasure: "1 /Hour", accountTypes: "EA", pricingBlockSize: 1, distinctUnits: "Units/Hour" },
  { unitOfMeasure: "1 /Minute", accountTypes: "EA", pricingBlockSize: 1, distinctUnits: "Units/Minute" },
  { unitOfMeasure: "1 /Month", accountTypes: "EA", pricingBlockSize: 1, distinctUnits: "Units/Month" },
  { unitOfMeasure: "1 /Year", accountTypes: "EA", pricingBlockSize: 1, distinctUnits: "Units/Year" },
  { unitOfMeasure: "1 1 Hour", accountTypes: "EA", pricingBlockSize: 1, distinctUnits: "Hours" },
  { unitOfMeasure: "1 API Calls", accountTypes: "MCA", pricingBlockSize: 1, distinctUnits: "Requests" },
  { unitOfMeasure: "1 Count", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "Count" },
  { unitOfMeasure: "1 Day", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "Days" },
  { unitOfMeasure: "1 GB", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "GB" },
  { unitOfMeasure: "1 GB Hour", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "GB Hours" },
  { unitOfMeasure: "1 GB Second", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "GB Seconds" },
  { unitOfMeasure: "1 GB/Day", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "GB/Day" },
  { unitOfMeasure: "1 GB/Hour", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "GB/Hour" },
  { unitOfMeasure: "1 GB/Month", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "GB/Month" },
  { unitOfMeasure: "1 GiB", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "GiB" },
  { unitOfMeasure: "1 GiB Hour", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "GiB Hours" },
  { unitOfMeasure: "1 GiB Minute", accountTypes: "MCA", pricingBlockSize: 1, distinctUnits: "GiB Minutes" },
  { unitOfMeasure: "1 GiB Second", accountTypes: "MCA", pricingBlockSize: 1, distinctUnits: "GiB Seconds" },
  { unitOfMeasure: "1 GiB/Day", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "GiB/Day" },
  { unitOfMeasure: "1 GiB/Hour", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "GiB/Hour" },
  { unitOfMeasure: "1 GiB/Month", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "GiB/Month" },
  { unitOfMeasure: "1 Hour", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "Hours" },
  { unitOfMeasure: "1 IOPS/Month", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "IOPS/Month" },
  { unitOfMeasure: "1 MB", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "MB" },
  { unitOfMeasure: "1 MB/Day", accountTypes: "MCA", pricingBlockSize: 1, distinctUnits: "MB/Day" },
  { unitOfMeasure: "1 MB/Month", accountTypes: "MCA", pricingBlockSize: 1, distinctUnits: "MB/Month" },
  { unitOfMeasure: "1 Million", accountTypes: "MCA", pricingBlockSize: 1, distinctUnits: "Million" },
  { unitOfMeasure: "1 Minute", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "Minutes" },
  { unitOfMeasure: "1 Month", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "Months" },
  { unitOfMeasure: "1 Rotation", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "Rotation" },
  { unitOfMeasure: "1 Second", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "Seconds" },
  { unitOfMeasure: "1 TB", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "TB" },
  { unitOfMeasure: "1 TB Hour", accountTypes: "EA", pricingBlockSize: 1, distinctUnits: "TB Hours" },
  { unitOfMeasure: "1 TB Second", accountTypes: "EA", pricingBlockSize: 1, distinctUnits: "TB Seconds" },
  { unitOfMeasure: "1 TB/Day", accountTypes: "EA", pricingBlockSize: 1, distinctUnits: "TB/Day" },
  { unitOfMeasure: "1 TB/Hour", accountTypes: "EA", pricingBlockSize: 1, distinctUnits: "TB/Hour" },
  { unitOfMeasure: "1 TB/Month", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "TB/Month" },
  { unitOfMeasure: "1 TiB", accountTypes: "EA", pricingBlockSize: 1, distinctUnits: "TiB" },
  { unitOfMeasure: "1 TiB Hour", accountTypes: "EA", pricingBlockSize: 1, distinctUnits: "TiB Hours" },
  { unitOfMeasure: "1 TiB/Hour", accountTypes: "EA", pricingBlockSize: 1, distinctUnits: "TiB/Hour" },
  { unitOfMeasure: "1 TiB/Month", accountTypes: "EA", pricingBlockSize: 1, distinctUnits: "TiB/Month" },
  { unitOfMeasure: "1 Unit", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "Units" },
  { unitOfMeasure: "1 User", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "Users" },
  { unitOfMeasure: "1/Day", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "Units/Day" },
  { unitOfMeasure: "1/Hour", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "Units/Hour" },
  { unitOfMeasure: "1/Minute", accountTypes: "MCA", pricingBlockSize: 1, distinctUnits: "Units/Minute" },
  { unitOfMeasure: "1/Month", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "Units/Month" },
  { unitOfMeasure: "1/Second", accountTypes: "MCA", pricingBlockSize: 1, distinctUnits: "Units/Second" },
  { unitOfMeasure: "1/Year", accountTypes: "MCA", pricingBlockSize: 1, distinctUnits: "Units/Year" },
  { unitOfMeasure: "10", accountTypes: "MCA, EA", pricingBlockSize: 10, distinctUnits: "Units" },
  { unitOfMeasure: "10 /Hour", accountTypes: "EA", pricingBlockSize: 10, distinctUnits: "Units/Hour" },
  { unitOfMeasure: "10 /Month", accountTypes: "EA", pricingBlockSize: 10, distinctUnits: "Units/Month" },
  { unitOfMeasure: "10 GB", accountTypes: "EA", pricingBlockSize: 10, distinctUnits: "GB" },
  { unitOfMeasure: "10 GB/Month", accountTypes: "EA", pricingBlockSize: 10, distinctUnits: "GB/Month" },
  { unitOfMeasure: "10 GiB", accountTypes: "EA", pricingBlockSize: 10, distinctUnits: "GiB" },
  { unitOfMeasure: "10 GiB/Month", accountTypes: "EA", pricingBlockSize: 10, distinctUnits: "GiB/Month" },
  { unitOfMeasure: "10 Hours", accountTypes: "EA", pricingBlockSize: 10, distinctUnits: "Hours" },
  { unitOfMeasure: "10 Minutes", accountTypes: "EA", pricingBlockSize: 10, distinctUnits: "Minutes" },
  { unitOfMeasure: "10 Seconds", accountTypes: "EA", pricingBlockSize: 10, distinctUnits: "Seconds" },
  { unitOfMeasure: "10 TB", accountTypes: "EA", pricingBlockSize: 10, distinctUnits: "TB" },
  { unitOfMeasure: "10 TB/Month", accountTypes: "EA", pricingBlockSize: 10, distinctUnits: "TB/Month" },
  { unitOfMeasure: "10 TiB", accountTypes: "EA", pricingBlockSize: 10, distinctUnits: "TiB" },
  { unitOfMeasure: "10 TiB/Month", accountTypes: "EA", pricingBlockSize: 10, distinctUnits: "TiB/Month" },
  { unitOfMeasure: "100", accountTypes: "MCA, EA", pricingBlockSize: 100, distinctUnits: "Units" },
  { unitOfMeasure: "100 /Hour", accountTypes: "EA", pricingBlockSize: 100, distinctUnits: "Units/Hour" },
  { unitOfMeasure: "100 /Month", accountTypes: "EA", pricingBlockSize: 100, distinctUnits: "Units/Month" },
  { unitOfMeasure: "100 GB", accountTypes: "EA", pricingBlockSize: 100, distinctUnits: "GB" },
  { unitOfMeasure: "100 GB/Month", accountTypes: "EA", pricingBlockSize: 100, distinctUnits: "GB/Month" },
  { unitOfMeasure: "100 Hours", accountTypes: "MCA, EA", pricingBlockSize: 100, distinctUnits: "Hours" },
  { unitOfMeasure: "100 Seconds", accountTypes: "MCA, EA", pricingBlockSize: 100, distinctUnits: "Seconds" },
  { unitOfMeasure: "100 TB/Month", accountTypes: "EA", pricingBlockSize: 100, distinctUnits: "TB/Month" },
  { unitOfMeasure: "100/Hour", accountTypes: "MCA", pricingBlockSize: 100, distinctUnits: "Units/Hour" },
  { unitOfMeasure: "100/Month", accountTypes: "MCA", pricingBlockSize: 100, distinctUnits: "Units/Month" },
  { unitOfMeasure: "1000", accountTypes: "EA", pricingBlockSize: 1000, distinctUnits: "Units" },
  { unitOfMeasure: "1000 /Hour", accountTypes: "EA", pricingBlockSize: 1000, distinctUnits: "Units/Hour" },
  { unitOfMeasure: "1000 /Month", accountTypes: "EA", pricingBlockSize: 1000, distinctUnits: "Units/Month" },
  { unitOfMeasure: "1000 GB/Month", accountTypes: "EA", pricingBlockSize: 1000, distinctUnits: "GB/Month" },
  { unitOfMeasure: "1000 Hours", accountTypes: "EA", pricingBlockSize: 1000, distinctUnits: "Hours" },
  { unitOfMeasure: "1000 Transactions", accountTypes: "EA", pricingBlockSize: 1000, distinctUnits: "Transactions" },
  { unitOfMeasure: "10000", accountTypes: "EA", pricingBlockSize: 10000, distinctUnits: "Units" },
  { unitOfMeasure: "10000 /Hour", accountTypes: "EA", pricingBlockSize: 10000, distinctUnits: "Units/Hour" },
  { unitOfMeasure: "10000 /Month", accountTypes: "EA", pricingBlockSize: 10000, distinctUnits: "Units/Month" },
  { unitOfMeasure: "10000 Hours", accountTypes: "EA", pricingBlockSize: 10000, distinctUnits: "Hours" },
  { unitOfMeasure: "10000 Transactions", accountTypes: "EA", pricingBlockSize: 10000, distinctUnits: "Transactions" },
  { unitOfMeasure: "100000", accountTypes: "EA", pricingBlockSize: 100000, distinctUnits: "Units" },
  { unitOfMeasure: "100000 /Hour", accountTypes: "EA", pricingBlockSize: 100000, distinctUnits: "Units/Hour" },
  { unitOfMeasure: "100000 /Month", accountTypes: "EA", pricingBlockSize: 100000, distinctUnits: "Units/Month" },
  { unitOfMeasure: "100000 Transactions", accountTypes: "EA", pricingBlockSize: 100000, distinctUnits: "Transactions" },
  { unitOfMeasure: "1000000", accountTypes: "EA", pricingBlockSize: 1000000, distinctUnits: "Units" },
  { unitOfMeasure: "1000000 /Hour", accountTypes: "EA", pricingBlockSize: 1000000, distinctUnits: "Units/Hour" },
  { unitOfMeasure: "1000000 /Month", accountTypes: "EA", pricingBlockSize: 1000000, distinctUnits: "Units/Month" },
  { unitOfMeasure: "1000000 Requests", accountTypes: "EA", pricingBlockSize: 1000000, distinctUnits: "Requests" },
  { unitOfMeasure: "1000000 Transactions", accountTypes: "EA", pricingBlockSize: 1000000, distinctUnits: "Transactions" },
  { unitOfMeasure: "10K", accountTypes: "MCA, EA", pricingBlockSize: 10000, distinctUnits: "Units" },
  { unitOfMeasure: "10K/Month", accountTypes: "MCA, EA", pricingBlockSize: 10000, distinctUnits: "Units/Month" },
  { unitOfMeasure: "10M", accountTypes: "MCA, EA", pricingBlockSize: 10000000, distinctUnits: "Units" },
  { unitOfMeasure: "128 MB", accountTypes: "MCA, EA", pricingBlockSize: 128, distinctUnits: "MB" },
  { unitOfMeasure: "1B", accountTypes: "MCA", pricingBlockSize: 1000000000, distinctUnits: "Units" },
  { unitOfMeasure: "1K", accountTypes: "MCA, EA", pricingBlockSize: 1000, distinctUnits: "Units" },
  { unitOfMeasure: "1K/Hour", accountTypes: "MCA", pricingBlockSize: 1000, distinctUnits: "Units/Hour" },
  { unitOfMeasure: "1K/Month", accountTypes: "MCA", pricingBlockSize: 1000, distinctUnits: "Units/Month" },
  { unitOfMeasure: "1M", accountTypes: "MCA, EA", pricingBlockSize: 1000000, distinctUnits: "Units" },
  { unitOfMeasure: "1M/Month", accountTypes: "MCA", pricingBlockSize: 1000000, distinctUnits: "Units/Month" },
  { unitOfMeasure: "5 GB", accountTypes: "MCA, EA", pricingBlockSize: 5, distinctUnits: "GB" },
  { unitOfMeasure: "CallingMinutes", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "Minutes" },
  { unitOfMeasure: "Days", accountTypes: "MCA", pricingBlockSize: 1, distinctUnits: "Days" },
  { unitOfMeasure: "GB", accountTypes: "MCA", pricingBlockSize: 1, distinctUnits: "GB" },
  { unitOfMeasure: "Hours", accountTypes: "MCA", pricingBlockSize: 1, distinctUnits: "Hours" },
  { unitOfMeasure: "Minute(s)", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "Minutes" },
  { unitOfMeasure: "Per Call", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "Calls" },
  { unitOfMeasure: "Per Request", accountTypes: "MCA", pricingBlockSize: 1, distinctUnits: "Requests" },
  { unitOfMeasure: "Text", accountTypes: "MCA, EA", pricingBlockSize: 1, distinctUnits: "Messages" },
  { unitOfMeasure: "Unit", accountTypes: "MCA", pricingBlockSize: 1, distinctUnits: "Units" },
  { unitOfMeasure: "Units", accountTypes: "MCA", pricingBlockSize: 1, distinctUnits: "Units" },
];

/**
 * Lookup map: UnitOfMeasure string -> { pricingBlockSize, distinctUnits }.
 * Use this to normalize raw pricing units from billing data.
 */
export const pricingUnitLookup = new Map(
  pricingUnits.map((p) => [
    p.unitOfMeasure,
    { pricingBlockSize: p.pricingBlockSize, distinctUnits: p.distinctUnits },
  ])
);

/**
 * Normalize a raw UnitOfMeasure string to a block size and distinct unit.
 */
export function normalizePricingUnit(
  unitOfMeasure: string
): { pricingBlockSize: number; distinctUnits: string } | undefined {
  return pricingUnitLookup.get(unitOfMeasure.trim());
}
