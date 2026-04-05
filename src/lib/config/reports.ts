import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  Server,
  Layers,
  Globe,
  TrendingUp,
  GitBranch,
  Package,
  DollarSign,
  ShoppingCart,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Receipt,
  Tag,
  Percent,
  Gauge,
  Zap,
  Shield,
  Activity,
  HardDrive,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

export interface ReportTab {
  name: string;
  href: string;
  icon: LucideIcon;
}

export interface ReportDefinition {
  id: string;
  name: string;
  shortName: string;
  description: string;
  basePath: string;
  icon: LucideIcon;
  tabs: ReportTab[];
  /** If true, report is fully functional. If false, shown as "coming soon". */
  ready: boolean;
}

export const REPORTS: ReportDefinition[] = [
  {
    id: "cost-summary",
    name: "Cost Summary",
    shortName: "Cost",
    description: "Amortized cost overview and top contributors",
    basePath: "/reports/cost-summary",
    icon: LayoutDashboard,
    ready: true,
    tabs: [
      { name: "Summary", href: "/reports/cost-summary", icon: LayoutDashboard },
      { name: "Subscriptions", href: "/reports/cost-summary/subscriptions", icon: Building2 },
      { name: "Resource Groups", href: "/reports/cost-summary/resource-groups", icon: FolderKanban },
      { name: "Resources", href: "/reports/cost-summary/resources", icon: Server },
      { name: "Services", href: "/reports/cost-summary/services", icon: Layers },
      { name: "Regions", href: "/reports/cost-summary/regions", icon: Globe },
      { name: "Running Total", href: "/reports/cost-summary/running-total", icon: TrendingUp },
      { name: "Charge Breakdown", href: "/reports/cost-summary/charge-breakdown", icon: GitBranch },
      { name: "Inventory", href: "/reports/cost-summary/inventory", icon: Package },
      { name: "Prices", href: "/reports/cost-summary/prices", icon: DollarSign },
      { name: "Purchases", href: "/reports/cost-summary/purchases", icon: ShoppingCart },
      { name: "Usage Analysis", href: "/reports/cost-summary/usage-analysis", icon: BarChart3 },
      { name: "Tag Compliance", href: "/reports/cost-summary/tag-compliance", icon: Tag },
      { name: "Anomalies", href: "/reports/cost-summary/anomalies", icon: AlertTriangle },
      { name: "Forecasting", href: "/reports/cost-summary/forecasting", icon: TrendingUp },
      { name: "Data Quality", href: "/reports/cost-summary/data-quality", icon: ShieldCheck },
    ],
  },
  {
    id: "invoicing",
    name: "Invoicing & Chargeback",
    shortName: "Invoicing",
    description: "Billed cost trends and invoice reconciliation",
    basePath: "/reports/invoicing",
    icon: Receipt,
    ready: true,
    tabs: [
      { name: "Summary", href: "/reports/invoicing", icon: LayoutDashboard },
      { name: "Services", href: "/reports/invoicing/services", icon: Layers },
      { name: "Chargeback", href: "/reports/invoicing/chargeback", icon: Building2 },
      { name: "Invoice Recon", href: "/reports/invoicing/invoice-recon", icon: FileText },
      { name: "Purchases", href: "/reports/invoicing/purchases", icon: ShoppingCart },
      { name: "Prices", href: "/reports/invoicing/prices", icon: DollarSign },
      { name: "Tags", href: "/reports/invoicing/tags", icon: Tag },
    ],
  },
  {
    id: "rate-optimization",
    name: "Rate Optimization",
    shortName: "Rates",
    description: "Commitment discount savings and recommendations",
    basePath: "/reports/rate-optimization",
    icon: Percent,
    ready: true,
    tabs: [
      { name: "Summary", href: "/reports/rate-optimization", icon: LayoutDashboard },
      { name: "Total Savings", href: "/reports/rate-optimization/total-savings", icon: TrendingUp },
      { name: "Commitment Savings", href: "/reports/rate-optimization/commitment-savings", icon: DollarSign },
      { name: "Utilization", href: "/reports/rate-optimization/utilization", icon: Gauge },
      { name: "Resources", href: "/reports/rate-optimization/resources", icon: Server },
      { name: "Chargeback", href: "/reports/rate-optimization/chargeback", icon: Building2 },
      { name: "Recommendations", href: "/reports/rate-optimization/recommendations", icon: Lightbulb },
      { name: "Purchases", href: "/reports/rate-optimization/purchases", icon: ShoppingCart },
      { name: "Hybrid Benefit", href: "/reports/rate-optimization/hybrid-benefit", icon: Zap },
      { name: "Prices", href: "/reports/rate-optimization/prices", icon: DollarSign },
    ],
  },
  {
    id: "governance",
    name: "Policy & Governance",
    shortName: "Governance",
    description: "Compliance, security, and resource governance",
    basePath: "/reports/governance",
    icon: Shield,
    ready: false,
    tabs: [
      { name: "Summary", href: "/reports/governance", icon: LayoutDashboard },
      { name: "Policy Compliance", href: "/reports/governance/policy-compliance", icon: ShieldCheck },
      { name: "Virtual Machines", href: "/reports/governance/virtual-machines", icon: Server },
      { name: "Managed Disks", href: "/reports/governance/managed-disks", icon: HardDrive },
      { name: "SQL Databases", href: "/reports/governance/sql-databases", icon: Activity },
      { name: "Network Security", href: "/reports/governance/network-security", icon: Shield },
    ],
  },
  {
    id: "workload-optimization",
    name: "Workload Optimization",
    shortName: "Workloads",
    description: "Resource utilization and efficiency opportunities",
    basePath: "/reports/workload-optimization",
    icon: Zap,
    ready: false,
    tabs: [
      { name: "Recommendations", href: "/reports/workload-optimization", icon: Lightbulb },
      { name: "Unattached Disks", href: "/reports/workload-optimization/unattached-disks", icon: HardDrive },
    ],
  },
];

/**
 * Find the report definition that matches a given pathname.
 */
export function getReportForPath(pathname: string): ReportDefinition | undefined {
  return REPORTS.find((r) => pathname.startsWith(r.basePath));
}
