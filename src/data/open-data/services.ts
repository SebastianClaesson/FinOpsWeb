/**
 * Service mappings from FinOps Toolkit open data.
 * Source: https://github.com/microsoft/finops-toolkit/blob/main/src/open-data/Services.csv
 *
 * Maps ConsumedService + ResourceType to ServiceName, ServiceCategory, etc.
 * The full dataset (~400 rows) can be fetched from the source above.
 *
 * This file contains the most common Azure services for initial use.
 * TODO: Fetch and embed full dataset from FinOps Toolkit.
 */

import { ServiceMapping } from "./types";

export const services: ServiceMapping[] = [
  { consumedService: "microsoft.compute", resourceType: "microsoft.compute/virtualmachines", serviceName: "Virtual Machines", serviceCategory: "Compute", serviceSubcategory: "Virtual Machines", publisherName: "Microsoft", publisherType: "Cloud Provider", environment: "Cloud", serviceModel: "IaaS" },
  { consumedService: "microsoft.compute", resourceType: "microsoft.compute/disks", serviceName: "Managed Disks", serviceCategory: "Storage", serviceSubcategory: "Disk Storage", publisherName: "Microsoft", publisherType: "Cloud Provider", environment: "Cloud", serviceModel: "IaaS" },
  { consumedService: "microsoft.compute", resourceType: "microsoft.compute/virtualmachinescalesets", serviceName: "Virtual Machine Scale Sets", serviceCategory: "Compute", serviceSubcategory: "Virtual Machines", publisherName: "Microsoft", publisherType: "Cloud Provider", environment: "Cloud", serviceModel: "IaaS" },
  { consumedService: "microsoft.storage", resourceType: "microsoft.storage/storageaccounts", serviceName: "Storage Accounts", serviceCategory: "Storage", serviceSubcategory: "General Storage", publisherName: "Microsoft", publisherType: "Cloud Provider", environment: "Cloud", serviceModel: "IaaS" },
  { consumedService: "microsoft.network", resourceType: "microsoft.network/virtualnetworks", serviceName: "Virtual Network", serviceCategory: "Networking", serviceSubcategory: "Network Infrastructure", publisherName: "Microsoft", publisherType: "Cloud Provider", environment: "Cloud", serviceModel: "IaaS" },
  { consumedService: "microsoft.network", resourceType: "microsoft.network/publicipaddresses", serviceName: "Public IP Addresses", serviceCategory: "Networking", serviceSubcategory: "Network Infrastructure", publisherName: "Microsoft", publisherType: "Cloud Provider", environment: "Cloud", serviceModel: "IaaS" },
  { consumedService: "microsoft.network", resourceType: "microsoft.network/loadbalancers", serviceName: "Load Balancer", serviceCategory: "Networking", serviceSubcategory: "Network Infrastructure", publisherName: "Microsoft", publisherType: "Cloud Provider", environment: "Cloud", serviceModel: "IaaS" },
  { consumedService: "microsoft.network", resourceType: "microsoft.network/applicationgateways", serviceName: "Application Gateway", serviceCategory: "Networking", serviceSubcategory: "Network Infrastructure", publisherName: "Microsoft", publisherType: "Cloud Provider", environment: "Cloud", serviceModel: "PaaS" },
  { consumedService: "microsoft.sql", resourceType: "microsoft.sql/servers/databases", serviceName: "SQL Database", serviceCategory: "Databases", serviceSubcategory: "SQL Databases", publisherName: "Microsoft", publisherType: "Cloud Provider", environment: "Cloud", serviceModel: "PaaS" },
  { consumedService: "microsoft.dbformysql", resourceType: "microsoft.dbformysql/flexibleservers", serviceName: "Azure Database for MySQL", serviceCategory: "Databases", serviceSubcategory: "MySQL Databases", publisherName: "Microsoft", publisherType: "Cloud Provider", environment: "Cloud", serviceModel: "PaaS" },
  { consumedService: "microsoft.dbforpostgresql", resourceType: "microsoft.dbforpostgresql/flexibleservers", serviceName: "Azure Database for PostgreSQL", serviceCategory: "Databases", serviceSubcategory: "PostgreSQL Databases", publisherName: "Microsoft", publisherType: "Cloud Provider", environment: "Cloud", serviceModel: "PaaS" },
  { consumedService: "microsoft.documentdb", resourceType: "microsoft.documentdb/databaseaccounts", serviceName: "Azure Cosmos DB", serviceCategory: "Databases", serviceSubcategory: "NoSQL Databases", publisherName: "Microsoft", publisherType: "Cloud Provider", environment: "Cloud", serviceModel: "PaaS" },
  { consumedService: "microsoft.web", resourceType: "microsoft.web/sites", serviceName: "App Service", serviceCategory: "Compute", serviceSubcategory: "App Services", publisherName: "Microsoft", publisherType: "Cloud Provider", environment: "Cloud", serviceModel: "PaaS" },
  { consumedService: "microsoft.web", resourceType: "microsoft.web/serverfarms", serviceName: "App Service Plans", serviceCategory: "Compute", serviceSubcategory: "App Services", publisherName: "Microsoft", publisherType: "Cloud Provider", environment: "Cloud", serviceModel: "PaaS" },
  { consumedService: "microsoft.containerservice", resourceType: "microsoft.containerservice/managedclusters", serviceName: "Azure Kubernetes Service", serviceCategory: "Compute", serviceSubcategory: "Containers", publisherName: "Microsoft", publisherType: "Cloud Provider", environment: "Cloud", serviceModel: "PaaS" },
  { consumedService: "microsoft.containerregistry", resourceType: "microsoft.containerregistry/registries", serviceName: "Container Registry", serviceCategory: "Compute", serviceSubcategory: "Containers", publisherName: "Microsoft", publisherType: "Cloud Provider", environment: "Cloud", serviceModel: "PaaS" },
  { consumedService: "microsoft.keyvault", resourceType: "microsoft.keyvault/vaults", serviceName: "Key Vault", serviceCategory: "Security", serviceSubcategory: "Key Management", publisherName: "Microsoft", publisherType: "Cloud Provider", environment: "Cloud", serviceModel: "PaaS" },
  { consumedService: "microsoft.operationalinsights", resourceType: "microsoft.operationalinsights/workspaces", serviceName: "Log Analytics", serviceCategory: "Management and Governance", serviceSubcategory: "Monitoring", publisherName: "Microsoft", publisherType: "Cloud Provider", environment: "Cloud", serviceModel: "PaaS" },
  { consumedService: "microsoft.insights", resourceType: "microsoft.insights/components", serviceName: "Application Insights", serviceCategory: "Management and Governance", serviceSubcategory: "Monitoring", publisherName: "Microsoft", publisherType: "Cloud Provider", environment: "Cloud", serviceModel: "PaaS" },
  { consumedService: "microsoft.recoveryservices", resourceType: "microsoft.recoveryservices/vaults", serviceName: "Recovery Services", serviceCategory: "Management and Governance", serviceSubcategory: "Backup", publisherName: "Microsoft", publisherType: "Cloud Provider", environment: "Cloud", serviceModel: "PaaS" },
  { consumedService: "microsoft.network", resourceType: "microsoft.network/azurefirewalls", serviceName: "Azure Firewall", serviceCategory: "Networking", serviceSubcategory: "Network Security", publisherName: "Microsoft", publisherType: "Cloud Provider", environment: "Cloud", serviceModel: "PaaS" },
  { consumedService: "microsoft.network", resourceType: "microsoft.network/bastionhosts", serviceName: "Azure Bastion", serviceCategory: "Networking", serviceSubcategory: "Network Security", publisherName: "Microsoft", publisherType: "Cloud Provider", environment: "Cloud", serviceModel: "PaaS" },
  { consumedService: "microsoft.network", resourceType: "microsoft.network/expressroutecircuits", serviceName: "ExpressRoute", serviceCategory: "Networking", serviceSubcategory: "Hybrid Connectivity", publisherName: "Microsoft", publisherType: "Cloud Provider", environment: "Cloud", serviceModel: "IaaS" },
  { consumedService: "microsoft.network", resourceType: "microsoft.network/vpngateways", serviceName: "VPN Gateway", serviceCategory: "Networking", serviceSubcategory: "Hybrid Connectivity", publisherName: "Microsoft", publisherType: "Cloud Provider", environment: "Cloud", serviceModel: "IaaS" },
  { consumedService: "microsoft.cognitiveservices", resourceType: "microsoft.cognitiveservices/accounts", serviceName: "Azure AI Services", serviceCategory: "AI and Machine Learning", serviceSubcategory: "Cognitive Services", publisherName: "Microsoft", publisherType: "Cloud Provider", environment: "Cloud", serviceModel: "PaaS" },
];

/**
 * Lookup map: lowercase "consumedService/resourceType" -> ServiceMapping.
 */
export const serviceLookup = new Map(
  services.map((s) => [`${s.consumedService}/${s.resourceType}`.toLowerCase(), s])
);

/**
 * Look up service info for a given consumed service and resource type.
 */
export function lookupService(
  consumedService: string,
  resourceType: string
): ServiceMapping | undefined {
  return serviceLookup.get(`${consumedService}/${resourceType}`.toLowerCase());
}
