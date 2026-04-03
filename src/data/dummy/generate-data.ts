/**
 * Deterministic dummy data generator for FOCUS v1.0 cost records.
 * Generates 6 months of realistic Azure consumption data.
 */
import { FocusCostRecord } from "@/lib/types/focus";

// --- Seed data definitions ---

const BILLING_ACCOUNT = {
  id: "ba-contoso-001",
  name: "Contoso MCA",
};

const SUBSCRIPTIONS = [
  { id: "sub-001", name: "Contoso Production", costCenter: "CC-PROD-100" },
  { id: "sub-002", name: "Contoso Development", costCenter: "CC-DEV-200" },
  { id: "sub-003", name: "Contoso Staging", costCenter: "CC-STG-300" },
  { id: "sub-004", name: "Contoso Shared Services", costCenter: "CC-SHR-400" },
];

interface ResourceDef {
  name: string;
  type: string;
  resourceGroup: string;
  subscriptionIdx: number;
  regionId: string;
  regionName: string;
  serviceCategory: string;
  serviceName: string;
  skuMeterCategory: string;
  skuMeterSubcategory: string;
  skuMeterName: string;
  dailyCost: number;
  variance: number; // 0-1, how much daily cost varies
  pricingCategory: "On-Demand" | "Commitment Discount";
  commitmentDiscount?: { id: string; name: string; type: string };
  unit: string;
  unitQuantity: number;
  tags: Record<string, string>;
}

const RESOURCES: ResourceDef[] = [
  // --- Production subscription ---
  {
    name: "vm-web-prod-01",
    type: "microsoft.compute/virtualmachines",
    resourceGroup: "rg-web-prod",
    subscriptionIdx: 0,
    regionId: "eastus",
    regionName: "East US",
    serviceCategory: "Compute",
    serviceName: "Virtual Machines",
    skuMeterCategory: "Virtual Machines",
    skuMeterSubcategory: "Dv4 Series",
    skuMeterName: "D4 v4",
    dailyCost: 95,
    variance: 0.05,
    pricingCategory: "Commitment Discount",
    commitmentDiscount: { id: "ri-001", name: "VM RI - D4v4 East US", type: "Reserved Instance" },
    unit: "Hours",
    unitQuantity: 24,
    tags: { environment: "production", team: "web", application: "frontend" },
  },
  {
    name: "vm-web-prod-02",
    type: "microsoft.compute/virtualmachines",
    resourceGroup: "rg-web-prod",
    subscriptionIdx: 0,
    regionId: "eastus",
    regionName: "East US",
    serviceCategory: "Compute",
    serviceName: "Virtual Machines",
    skuMeterCategory: "Virtual Machines",
    skuMeterSubcategory: "Dv4 Series",
    skuMeterName: "D4 v4",
    dailyCost: 95,
    variance: 0.05,
    pricingCategory: "Commitment Discount",
    commitmentDiscount: { id: "ri-001", name: "VM RI - D4v4 East US", type: "Reserved Instance" },
    unit: "Hours",
    unitQuantity: 24,
    tags: { environment: "production", team: "web", application: "frontend" },
  },
  {
    name: "vm-api-prod-01",
    type: "microsoft.compute/virtualmachines",
    resourceGroup: "rg-web-prod",
    subscriptionIdx: 0,
    regionId: "eastus",
    regionName: "East US",
    serviceCategory: "Compute",
    serviceName: "Virtual Machines",
    skuMeterCategory: "Virtual Machines",
    skuMeterSubcategory: "Ev4 Series",
    skuMeterName: "E8 v4",
    dailyCost: 210,
    variance: 0.08,
    pricingCategory: "On-Demand",
    unit: "Hours",
    unitQuantity: 24,
    tags: { environment: "production", team: "api", application: "backend" },
  },
  {
    name: "sql-main-prod",
    type: "microsoft.sql/servers/databases",
    resourceGroup: "rg-data-prod",
    subscriptionIdx: 0,
    regionId: "eastus",
    regionName: "East US",
    serviceCategory: "Databases",
    serviceName: "SQL Database",
    skuMeterCategory: "SQL Database",
    skuMeterSubcategory: "Single Premium",
    skuMeterName: "P2 DTUs",
    dailyCost: 450,
    variance: 0.03,
    pricingCategory: "On-Demand",
    unit: "DTUs",
    unitQuantity: 250,
    tags: { environment: "production", team: "data", application: "core-db" },
  },
  {
    name: "sql-analytics-prod",
    type: "microsoft.sql/servers/databases",
    resourceGroup: "rg-data-prod",
    subscriptionIdx: 0,
    regionId: "eastus",
    regionName: "East US",
    serviceCategory: "Databases",
    serviceName: "SQL Database",
    skuMeterCategory: "SQL Database",
    skuMeterSubcategory: "Single Standard",
    skuMeterName: "S3 DTUs",
    dailyCost: 150,
    variance: 0.15,
    pricingCategory: "On-Demand",
    unit: "DTUs",
    unitQuantity: 100,
    tags: { environment: "production", team: "data", application: "analytics" },
  },
  {
    name: "stgwebprod",
    type: "microsoft.storage/storageaccounts",
    resourceGroup: "rg-web-prod",
    subscriptionIdx: 0,
    regionId: "eastus",
    regionName: "East US",
    serviceCategory: "Storage",
    serviceName: "Storage Accounts",
    skuMeterCategory: "Storage",
    skuMeterSubcategory: "Blob Storage",
    skuMeterName: "Hot LRS Data Stored",
    dailyCost: 35,
    variance: 0.02,
    pricingCategory: "On-Demand",
    unit: "GB",
    unitQuantity: 1500,
    tags: { environment: "production", team: "web", application: "media" },
  },
  {
    name: "stgdataprod",
    type: "microsoft.storage/storageaccounts",
    resourceGroup: "rg-data-prod",
    subscriptionIdx: 0,
    regionId: "eastus",
    regionName: "East US",
    serviceCategory: "Storage",
    serviceName: "Storage Accounts",
    skuMeterCategory: "Storage",
    skuMeterSubcategory: "Data Lake Storage",
    skuMeterName: "Hot LRS Data Stored",
    dailyCost: 85,
    variance: 0.04,
    pricingCategory: "On-Demand",
    unit: "GB",
    unitQuantity: 5000,
    tags: { environment: "production", team: "data", application: "datalake" },
  },
  {
    name: "aks-main-prod",
    type: "microsoft.containerservice/managedclusters",
    resourceGroup: "rg-web-prod",
    subscriptionIdx: 0,
    regionId: "eastus",
    regionName: "East US",
    serviceCategory: "Containers",
    serviceName: "Azure Kubernetes Service",
    skuMeterCategory: "Azure Kubernetes Service",
    skuMeterSubcategory: "Standard",
    skuMeterName: "Cluster Management",
    dailyCost: 320,
    variance: 0.2,
    pricingCategory: "On-Demand",
    unit: "Hours",
    unitQuantity: 24,
    tags: { environment: "production", team: "platform", application: "microservices" },
  },
  {
    name: "cosmos-analytics-prod",
    type: "microsoft.documentdb/databaseaccounts",
    resourceGroup: "rg-data-prod",
    subscriptionIdx: 0,
    regionId: "eastus",
    regionName: "East US",
    serviceCategory: "Databases",
    serviceName: "Azure Cosmos DB",
    skuMeterCategory: "Azure Cosmos DB",
    skuMeterSubcategory: "Autoscale",
    skuMeterName: "Request Units",
    dailyCost: 180,
    variance: 0.25,
    pricingCategory: "On-Demand",
    unit: "RUs",
    unitQuantity: 10000,
    tags: { environment: "production", team: "data", application: "analytics" },
  },
  {
    name: "vm-ml-prod-01",
    type: "microsoft.compute/virtualmachines",
    resourceGroup: "rg-ml-prod",
    subscriptionIdx: 0,
    regionId: "westeurope",
    regionName: "West Europe",
    serviceCategory: "Compute",
    serviceName: "Virtual Machines",
    skuMeterCategory: "Virtual Machines",
    skuMeterSubcategory: "NCv3 Series",
    skuMeterName: "NC6s v3",
    dailyCost: 280,
    variance: 0.5,
    pricingCategory: "On-Demand",
    unit: "Hours",
    unitQuantity: 16,
    tags: { environment: "production", team: "ml", application: "training" },
  },
  {
    name: "vnet-prod",
    type: "microsoft.network/virtualnetworks",
    resourceGroup: "rg-network-prod",
    subscriptionIdx: 0,
    regionId: "eastus",
    regionName: "East US",
    serviceCategory: "Networking",
    serviceName: "Virtual Network",
    skuMeterCategory: "Virtual Network",
    skuMeterSubcategory: "VNet Peering",
    skuMeterName: "Data Transfer",
    dailyCost: 12,
    variance: 0.3,
    pricingCategory: "On-Demand",
    unit: "GB",
    unitQuantity: 200,
    tags: { environment: "production", team: "network" },
  },
  {
    name: "agw-prod",
    type: "microsoft.network/applicationgateways",
    resourceGroup: "rg-network-prod",
    subscriptionIdx: 0,
    regionId: "eastus",
    regionName: "East US",
    serviceCategory: "Networking",
    serviceName: "Application Gateway",
    skuMeterCategory: "Application Gateway",
    skuMeterSubcategory: "WAF v2",
    skuMeterName: "Fixed Cost",
    dailyCost: 65,
    variance: 0.01,
    pricingCategory: "On-Demand",
    unit: "Hours",
    unitQuantity: 24,
    tags: { environment: "production", team: "network", application: "waf" },
  },
  {
    name: "app-api-prod",
    type: "microsoft.web/sites",
    resourceGroup: "rg-web-prod",
    subscriptionIdx: 0,
    regionId: "westeurope",
    regionName: "West Europe",
    serviceCategory: "Web",
    serviceName: "App Service",
    skuMeterCategory: "App Service",
    skuMeterSubcategory: "Premium v3",
    skuMeterName: "P1v3",
    dailyCost: 75,
    variance: 0.02,
    pricingCategory: "On-Demand",
    unit: "Hours",
    unitQuantity: 24,
    tags: { environment: "production", team: "web", application: "api-eu" },
  },
  {
    name: "kv-prod",
    type: "microsoft.keyvault/vaults",
    resourceGroup: "rg-web-prod",
    subscriptionIdx: 0,
    regionId: "eastus",
    regionName: "East US",
    serviceCategory: "Security",
    serviceName: "Key Vault",
    skuMeterCategory: "Key Vault",
    skuMeterSubcategory: "Standard",
    skuMeterName: "Operations",
    dailyCost: 3,
    variance: 0.4,
    pricingCategory: "On-Demand",
    unit: "Transactions",
    unitQuantity: 50000,
    tags: { environment: "production", team: "security" },
  },

  // --- Development subscription ---
  {
    name: "vm-web-dev-01",
    type: "microsoft.compute/virtualmachines",
    resourceGroup: "rg-web-dev",
    subscriptionIdx: 1,
    regionId: "eastus",
    regionName: "East US",
    serviceCategory: "Compute",
    serviceName: "Virtual Machines",
    skuMeterCategory: "Virtual Machines",
    skuMeterSubcategory: "Bv2 Series",
    skuMeterName: "B4ms",
    dailyCost: 42,
    variance: 0.6,
    pricingCategory: "On-Demand",
    unit: "Hours",
    unitQuantity: 12,
    tags: { environment: "development", team: "web" },
  },
  {
    name: "sql-dev",
    type: "microsoft.sql/servers/databases",
    resourceGroup: "rg-data-dev",
    subscriptionIdx: 1,
    regionId: "eastus",
    regionName: "East US",
    serviceCategory: "Databases",
    serviceName: "SQL Database",
    skuMeterCategory: "SQL Database",
    skuMeterSubcategory: "Single Basic",
    skuMeterName: "Basic DTUs",
    dailyCost: 15,
    variance: 0.1,
    pricingCategory: "On-Demand",
    unit: "DTUs",
    unitQuantity: 5,
    tags: { environment: "development", team: "data" },
  },
  {
    name: "stgwebdev",
    type: "microsoft.storage/storageaccounts",
    resourceGroup: "rg-web-dev",
    subscriptionIdx: 1,
    regionId: "eastus",
    regionName: "East US",
    serviceCategory: "Storage",
    serviceName: "Storage Accounts",
    skuMeterCategory: "Storage",
    skuMeterSubcategory: "Blob Storage",
    skuMeterName: "Hot LRS Data Stored",
    dailyCost: 8,
    variance: 0.1,
    pricingCategory: "On-Demand",
    unit: "GB",
    unitQuantity: 200,
    tags: { environment: "development", team: "web" },
  },
  {
    name: "app-dev",
    type: "microsoft.web/sites",
    resourceGroup: "rg-app-dev",
    subscriptionIdx: 1,
    regionId: "eastus",
    regionName: "East US",
    serviceCategory: "Web",
    serviceName: "App Service",
    skuMeterCategory: "App Service",
    skuMeterSubcategory: "Standard",
    skuMeterName: "S1",
    dailyCost: 25,
    variance: 0.1,
    pricingCategory: "On-Demand",
    unit: "Hours",
    unitQuantity: 24,
    tags: { environment: "development", team: "web" },
  },
  {
    name: "func-dev",
    type: "microsoft.web/sites",
    resourceGroup: "rg-app-dev",
    subscriptionIdx: 1,
    regionId: "eastus",
    regionName: "East US",
    serviceCategory: "Compute",
    serviceName: "Azure Functions",
    skuMeterCategory: "Functions",
    skuMeterSubcategory: "Consumption",
    skuMeterName: "Executions",
    dailyCost: 5,
    variance: 0.8,
    pricingCategory: "On-Demand",
    unit: "Executions",
    unitQuantity: 100000,
    tags: { environment: "development", team: "web" },
  },

  // --- Staging subscription ---
  {
    name: "vm-web-stg-01",
    type: "microsoft.compute/virtualmachines",
    resourceGroup: "rg-web-staging",
    subscriptionIdx: 2,
    regionId: "westeurope",
    regionName: "West Europe",
    serviceCategory: "Compute",
    serviceName: "Virtual Machines",
    skuMeterCategory: "Virtual Machines",
    skuMeterSubcategory: "Dv4 Series",
    skuMeterName: "D2 v4",
    dailyCost: 48,
    variance: 0.1,
    pricingCategory: "On-Demand",
    unit: "Hours",
    unitQuantity: 24,
    tags: { environment: "staging", team: "web" },
  },
  {
    name: "sql-stg",
    type: "microsoft.sql/servers/databases",
    resourceGroup: "rg-data-staging",
    subscriptionIdx: 2,
    regionId: "westeurope",
    regionName: "West Europe",
    serviceCategory: "Databases",
    serviceName: "SQL Database",
    skuMeterCategory: "SQL Database",
    skuMeterSubcategory: "Single Standard",
    skuMeterName: "S1 DTUs",
    dailyCost: 30,
    variance: 0.05,
    pricingCategory: "On-Demand",
    unit: "DTUs",
    unitQuantity: 20,
    tags: { environment: "staging", team: "data" },
  },
  {
    name: "stgwebstg",
    type: "microsoft.storage/storageaccounts",
    resourceGroup: "rg-web-staging",
    subscriptionIdx: 2,
    regionId: "westeurope",
    regionName: "West Europe",
    serviceCategory: "Storage",
    serviceName: "Storage Accounts",
    skuMeterCategory: "Storage",
    skuMeterSubcategory: "Blob Storage",
    skuMeterName: "Hot LRS Data Stored",
    dailyCost: 10,
    variance: 0.05,
    pricingCategory: "On-Demand",
    unit: "GB",
    unitQuantity: 300,
    tags: { environment: "staging", team: "web" },
  },

  // --- Shared Services subscription ---
  {
    name: "monitor-workspace",
    type: "microsoft.operationalinsights/workspaces",
    resourceGroup: "rg-monitoring",
    subscriptionIdx: 3,
    regionId: "eastus",
    regionName: "East US",
    serviceCategory: "Management and Governance",
    serviceName: "Log Analytics",
    skuMeterCategory: "Log Analytics",
    skuMeterSubcategory: "Pay-as-you-go",
    skuMeterName: "Data Ingestion",
    dailyCost: 120,
    variance: 0.15,
    pricingCategory: "Commitment Discount",
    commitmentDiscount: { id: "ct-001", name: "Log Analytics Commitment Tier", type: "Savings Plan" },
    unit: "GB",
    unitQuantity: 50,
    tags: { environment: "shared", team: "platform", application: "monitoring" },
  },
  {
    name: "kv-shared",
    type: "microsoft.keyvault/vaults",
    resourceGroup: "rg-security",
    subscriptionIdx: 3,
    regionId: "eastus",
    regionName: "East US",
    serviceCategory: "Security",
    serviceName: "Key Vault",
    skuMeterCategory: "Key Vault",
    skuMeterSubcategory: "Premium",
    skuMeterName: "HSM Operations",
    dailyCost: 8,
    variance: 0.3,
    pricingCategory: "On-Demand",
    unit: "Transactions",
    unitQuantity: 10000,
    tags: { environment: "shared", team: "security" },
  },
  {
    name: "dns-zone-contoso",
    type: "microsoft.network/dnszones",
    resourceGroup: "rg-dns",
    subscriptionIdx: 3,
    regionId: "global",
    regionName: "Global",
    serviceCategory: "Networking",
    serviceName: "Azure DNS",
    skuMeterCategory: "Azure DNS",
    skuMeterSubcategory: "Public",
    skuMeterName: "Hosted DNS Zones",
    dailyCost: 2,
    variance: 0.01,
    pricingCategory: "On-Demand",
    unit: "Zones",
    unitQuantity: 5,
    tags: { environment: "shared", team: "network" },
  },
  {
    name: "fw-shared",
    type: "microsoft.network/azurefirewalls",
    resourceGroup: "rg-security",
    subscriptionIdx: 3,
    regionId: "eastus",
    regionName: "East US",
    serviceCategory: "Networking",
    serviceName: "Azure Firewall",
    skuMeterCategory: "Azure Firewall",
    skuMeterSubcategory: "Standard",
    skuMeterName: "Deployment",
    dailyCost: 38,
    variance: 0.02,
    pricingCategory: "On-Demand",
    unit: "Hours",
    unitQuantity: 24,
    tags: { environment: "shared", team: "security", application: "firewall" },
  },
  // Additional high-cost Asia resource
  {
    name: "vm-api-asia-01",
    type: "microsoft.compute/virtualmachines",
    resourceGroup: "rg-web-prod",
    subscriptionIdx: 0,
    regionId: "southeastasia",
    regionName: "Southeast Asia",
    serviceCategory: "Compute",
    serviceName: "Virtual Machines",
    skuMeterCategory: "Virtual Machines",
    skuMeterSubcategory: "Dv4 Series",
    skuMeterName: "D4 v4",
    dailyCost: 115,
    variance: 0.1,
    pricingCategory: "On-Demand",
    unit: "Hours",
    unitQuantity: 24,
    tags: { environment: "production", team: "api", application: "backend-asia" },
  },
  {
    name: "redis-prod",
    type: "microsoft.cache/redis",
    resourceGroup: "rg-data-prod",
    subscriptionIdx: 0,
    regionId: "eastus",
    regionName: "East US",
    serviceCategory: "Databases",
    serviceName: "Azure Cache for Redis",
    skuMeterCategory: "Azure Cache for Redis",
    skuMeterSubcategory: "Premium",
    skuMeterName: "P1 Cache Instance",
    dailyCost: 55,
    variance: 0.01,
    pricingCategory: "On-Demand",
    unit: "Hours",
    unitQuantity: 24,
    tags: { environment: "production", team: "data", application: "cache" },
  },
];

/**
 * Deterministic pseudo-random number based on seed.
 * Simple but good enough for dummy data.
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

/**
 * Generate all FOCUS cost records for the date range.
 */
export function generateCostData(): FocusCostRecord[] {
  const records: FocusCostRecord[] = [];
  const startDate = new Date("2024-10-01");
  const endDate = new Date("2025-03-31");

  let day = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    const dateStr = current.toISOString().split("T")[0];
    const monthStart = new Date(current.getFullYear(), current.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];
    const nextDay = new Date(current);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split("T")[0];

    for (let r = 0; r < RESOURCES.length; r++) {
      const res = RESOURCES[r];
      const sub = SUBSCRIPTIONS[res.subscriptionIdx];
      const seed = day * 1000 + r;
      const rand = seededRandom(seed);

      // Calculate cost with variance and a slight upward trend
      const trendMultiplier = 1 + day * 0.0005; // ~0.05% daily increase
      const varianceFactor = 1 + (rand - 0.5) * 2 * res.variance;
      const dailyCost = res.dailyCost * varianceFactor * trendMultiplier;

      // ML VM has weekend pattern (lower on weekends)
      const dayOfWeek = current.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const weekendFactor =
        res.name.includes("ml") && isWeekend ? 0.3 : 1;
      const effectiveDailyCost = dailyCost * weekendFactor;

      // Dev resources are off on weekends
      const devWeekendFactor =
        res.subscriptionIdx === 1 && isWeekend ? 0.15 : 1;
      const finalCost = effectiveDailyCost * devWeekendFactor;

      // List cost is higher than effective for commitment discounts
      const isCommitment = res.pricingCategory === "Commitment Discount";
      const listCost = isCommitment ? finalCost * 1.35 : finalCost * 1.0;
      const contractedCost = isCommitment ? finalCost : finalCost;

      const record: FocusCostRecord = {
        BilledCost: Math.round(finalCost * 100) / 100,
        EffectiveCost: Math.round(finalCost * 100) / 100,
        ListCost: Math.round(listCost * 100) / 100,
        ContractedCost: Math.round(contractedCost * 100) / 100,

        ChargePeriodStart: dateStr,
        ChargePeriodEnd: nextDayStr,
        BillingPeriodStart: monthStart,
        BillingPeriodEnd: monthEnd,

        ChargeCategory: "Usage",
        ChargeSubcategory: isCommitment ? "Used Commitment" : "On-Demand",
        ChargeDescription: `${res.serviceName} - ${res.skuMeterName}`,
        ChargeFrequency: "Usage-Based",

        PricingCategory: res.pricingCategory,
        PricingQuantity: Math.round(res.unitQuantity * varianceFactor),
        PricingUnit: res.unit,
        ListUnitPrice:
          Math.round((listCost / res.unitQuantity) * 10000) / 10000,
        ContractedUnitPrice:
          Math.round((contractedCost / res.unitQuantity) * 10000) / 10000,

        ConsumedQuantity: Math.round(
          res.unitQuantity * varianceFactor * weekendFactor * devWeekendFactor
        ),
        ConsumedUnit: res.unit,

        ServiceCategory: res.serviceCategory,
        ServiceName: res.serviceName,
        ProviderName: "Microsoft",
        PublisherName: "Microsoft",

        ResourceId: `/subscriptions/${sub.id}/resourceGroups/${res.resourceGroup}/providers/${res.type}/${res.name}`,
        ResourceName: res.name,
        ResourceType: res.type,

        RegionId: res.regionId,
        RegionName: res.regionName,

        BillingAccountId: BILLING_ACCOUNT.id,
        BillingAccountName: BILLING_ACCOUNT.name,
        SubAccountId: sub.id,
        SubAccountName: sub.name,

        SkuId: `sku-${res.skuMeterCategory.toLowerCase().replace(/\s/g, "-")}-${res.skuMeterName.toLowerCase().replace(/\s/g, "-")}`,
        SkuPriceId: `price-${res.skuMeterName.toLowerCase().replace(/\s/g, "-")}`,

        CommitmentDiscountId: res.commitmentDiscount?.id ?? "",
        CommitmentDiscountName: res.commitmentDiscount?.name ?? "",
        CommitmentDiscountStatus: res.commitmentDiscount ? "Used" : "",
        CommitmentDiscountType: res.commitmentDiscount?.type ?? "",

        BillingCurrency: "USD",

        Tags: JSON.stringify(res.tags),

        x_ResourceGroupName: res.resourceGroup,
        x_PricingSubcategory: isCommitment ? "Committed" : "",
        x_SkuMeterCategory: res.skuMeterCategory,
        x_SkuMeterSubcategory: res.skuMeterSubcategory,
        x_SkuMeterName: res.skuMeterName,
        x_CostCenter: sub.costCenter,
      };

      records.push(record);
    }

    current.setDate(current.getDate() + 1);
    day++;
  }

  return records;
}
