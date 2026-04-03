"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
} from "lucide-react";

const reportTabs = [
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
  { name: "Data Quality", href: "/reports/cost-summary/data-quality", icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border/50 bg-sidebar/50 backdrop-blur-sm lg:block">
      <nav className="flex flex-col gap-0.5 p-3 pt-4">
        <p className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
          Cost Summary
        </p>
        {reportTabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <tab.icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-150",
                  !isActive && "group-hover:scale-110"
                )}
              />
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
