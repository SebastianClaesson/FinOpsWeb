/**
 * Resource type mappings from FinOps Toolkit open data.
 * Source: https://github.com/microsoft/finops-toolkit/blob/main/src/open-data/ResourceTypes.csv
 *
 * Maps Azure resource type identifiers to display names, descriptions, and icons.
 * The full dataset (~2000 rows) can be fetched from the source above.
 *
 * This file contains the most common Azure resource types for initial use.
 * TODO: Fetch and embed full dataset from FinOps Toolkit.
 */

import { ResourceTypeMapping } from "./types";

export const resourceTypes: ResourceTypeMapping[] = [
  { resourceType: "microsoft.compute/virtualmachines", singularDisplayName: "Virtual machine", pluralDisplayName: "Virtual machines", lowerSingularDisplayName: "virtual machine", lowerPluralDisplayName: "virtual machines", isPreview: false, description: "Azure Virtual Machines are on-demand, scalable computing resources.", icon: "", },
  { resourceType: "microsoft.compute/disks", singularDisplayName: "Disk", pluralDisplayName: "Disks", lowerSingularDisplayName: "disk", lowerPluralDisplayName: "disks", isPreview: false, description: "Azure managed disks are block-level storage volumes.", icon: "", },
  { resourceType: "microsoft.compute/virtualmachinescalesets", singularDisplayName: "Virtual machine scale set", pluralDisplayName: "Virtual machine scale sets", lowerSingularDisplayName: "virtual machine scale set", lowerPluralDisplayName: "virtual machine scale sets", isPreview: false, description: "Azure Virtual Machine Scale Sets let you create and manage a group of load balanced VMs.", icon: "", },
  { resourceType: "microsoft.storage/storageaccounts", singularDisplayName: "Storage account", pluralDisplayName: "Storage accounts", lowerSingularDisplayName: "storage account", lowerPluralDisplayName: "storage accounts", isPreview: false, description: "Azure Storage is a cloud storage solution for modern data storage scenarios.", icon: "", },
  { resourceType: "microsoft.network/virtualnetworks", singularDisplayName: "Virtual network", pluralDisplayName: "Virtual networks", lowerSingularDisplayName: "virtual network", lowerPluralDisplayName: "virtual networks", isPreview: false, description: "Azure Virtual Network enables Azure resources to securely communicate with each other.", icon: "", },
  { resourceType: "microsoft.network/networkinterfaces", singularDisplayName: "Network interface", pluralDisplayName: "Network interfaces", lowerSingularDisplayName: "network interface", lowerPluralDisplayName: "network interfaces", isPreview: false, description: "A network interface enables an Azure VM to communicate with internet, Azure, and on-premises resources.", icon: "", },
  { resourceType: "microsoft.network/networksecuritygroups", singularDisplayName: "Network security group", pluralDisplayName: "Network security groups", lowerSingularDisplayName: "network security group", lowerPluralDisplayName: "network security groups", isPreview: false, description: "Filter network traffic to and from Azure resources in an Azure virtual network.", icon: "", },
  { resourceType: "microsoft.network/publicipaddresses", singularDisplayName: "Public IP address", pluralDisplayName: "Public IP addresses", lowerSingularDisplayName: "public IP address", lowerPluralDisplayName: "public IP addresses", isPreview: false, description: "Public IP addresses allow Internet resources to communicate inbound to Azure resources.", icon: "", },
  { resourceType: "microsoft.network/loadbalancers", singularDisplayName: "Load balancer", pluralDisplayName: "Load balancers", lowerSingularDisplayName: "load balancer", lowerPluralDisplayName: "load balancers", isPreview: false, description: "Azure Load Balancer delivers high availability and network performance to your applications.", icon: "", },
  { resourceType: "microsoft.network/applicationgateways", singularDisplayName: "Application gateway", pluralDisplayName: "Application gateways", lowerSingularDisplayName: "application gateway", lowerPluralDisplayName: "application gateways", isPreview: false, description: "Azure Application Gateway is a web traffic load balancer.", icon: "", },
  { resourceType: "microsoft.sql/servers", singularDisplayName: "SQL server", pluralDisplayName: "SQL servers", lowerSingularDisplayName: "SQL server", lowerPluralDisplayName: "SQL servers", isPreview: false, description: "Azure SQL Server is the logical server for Azure SQL Database.", icon: "", },
  { resourceType: "microsoft.sql/servers/databases", singularDisplayName: "SQL database", pluralDisplayName: "SQL databases", lowerSingularDisplayName: "SQL database", lowerPluralDisplayName: "SQL databases", isPreview: false, description: "Azure SQL Database is a fully managed relational database.", icon: "", },
  { resourceType: "microsoft.web/sites", singularDisplayName: "App Service", pluralDisplayName: "App Services", lowerSingularDisplayName: "app service", lowerPluralDisplayName: "app services", isPreview: false, description: "Azure App Service enables you to build and host web apps, mobile backends, and RESTful APIs.", icon: "", },
  { resourceType: "microsoft.web/serverfarms", singularDisplayName: "App Service plan", pluralDisplayName: "App Service plans", lowerSingularDisplayName: "app service plan", lowerPluralDisplayName: "app service plans", isPreview: false, description: "An App Service plan defines a set of compute resources for a web app to run.", icon: "", },
  { resourceType: "microsoft.containerservice/managedclusters", singularDisplayName: "Kubernetes service", pluralDisplayName: "Kubernetes services", lowerSingularDisplayName: "kubernetes service", lowerPluralDisplayName: "kubernetes services", isPreview: false, description: "Azure Kubernetes Service simplifies deploying a managed Kubernetes cluster.", icon: "", },
  { resourceType: "microsoft.containerregistry/registries", singularDisplayName: "Container registry", pluralDisplayName: "Container registries", lowerSingularDisplayName: "container registry", lowerPluralDisplayName: "container registries", isPreview: false, description: "Azure Container Registry allows you to build, store, and manage container images.", icon: "", },
  { resourceType: "microsoft.keyvault/vaults", singularDisplayName: "Key vault", pluralDisplayName: "Key vaults", lowerSingularDisplayName: "key vault", lowerPluralDisplayName: "key vaults", isPreview: false, description: "Azure Key Vault safeguards cryptographic keys and secrets used by cloud applications and services.", icon: "", },
  { resourceType: "microsoft.operationalinsights/workspaces", singularDisplayName: "Log Analytics workspace", pluralDisplayName: "Log Analytics workspaces", lowerSingularDisplayName: "log analytics workspace", lowerPluralDisplayName: "log analytics workspaces", isPreview: false, description: "A Log Analytics workspace is the basic management unit of Azure Monitor Logs.", icon: "", },
  { resourceType: "microsoft.insights/components", singularDisplayName: "Application Insights", pluralDisplayName: "Application Insights", lowerSingularDisplayName: "application insights", lowerPluralDisplayName: "application insights", isPreview: false, description: "Application Insights is an extensible Application Performance Management service.", icon: "", },
  { resourceType: "microsoft.recoveryservices/vaults", singularDisplayName: "Recovery Services vault", pluralDisplayName: "Recovery Services vaults", lowerSingularDisplayName: "recovery services vault", lowerPluralDisplayName: "recovery services vaults", isPreview: false, description: "Azure Recovery Services vault stores backup data and recovery points.", icon: "", },
  { resourceType: "microsoft.documentdb/databaseaccounts", singularDisplayName: "Azure Cosmos DB account", pluralDisplayName: "Azure Cosmos DB accounts", lowerSingularDisplayName: "azure cosmos db account", lowerPluralDisplayName: "azure cosmos db accounts", isPreview: false, description: "Azure Cosmos DB is a fully managed NoSQL and relational database.", icon: "", },
  { resourceType: "microsoft.network/azurefirewalls", singularDisplayName: "Firewall", pluralDisplayName: "Firewalls", lowerSingularDisplayName: "firewall", lowerPluralDisplayName: "firewalls", isPreview: false, description: "Azure Firewall is a managed, cloud-based network security service.", icon: "", },
  { resourceType: "microsoft.network/bastionhosts", singularDisplayName: "Bastion", pluralDisplayName: "Bastions", lowerSingularDisplayName: "bastion", lowerPluralDisplayName: "bastions", isPreview: false, description: "Azure Bastion provides secure and seamless RDP/SSH connectivity to virtual machines.", icon: "", },
  { resourceType: "microsoft.network/expressroutecircuits", singularDisplayName: "ExpressRoute circuit", pluralDisplayName: "ExpressRoute circuits", lowerSingularDisplayName: "expressroute circuit", lowerPluralDisplayName: "expressroute circuits", isPreview: false, description: "ExpressRoute lets you extend on-premises networks into the Microsoft cloud.", icon: "", },
  { resourceType: "microsoft.cognitiveservices/accounts", singularDisplayName: "Azure AI services", pluralDisplayName: "Azure AI services", lowerSingularDisplayName: "azure ai services", lowerPluralDisplayName: "azure ai services", isPreview: false, description: "Azure AI services provide AI capabilities including vision, speech, language, and decision.", icon: "", },
];

/**
 * Lookup map: lowercase resource type -> ResourceTypeMapping.
 */
export const resourceTypeLookup = new Map(
  resourceTypes.map((r) => [r.resourceType.toLowerCase(), r])
);

/**
 * Look up display name and metadata for a given resource type.
 */
export function lookupResourceType(resourceType: string): ResourceTypeMapping | undefined {
  return resourceTypeLookup.get(resourceType.toLowerCase());
}
