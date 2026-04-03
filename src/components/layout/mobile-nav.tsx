"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden fixed bottom-4 right-4 z-50">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button size="icon" className="h-12 w-12 rounded-full shadow-lg" />
          }
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-sm">Cost Summary Report</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 p-3">
            {reportTabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <tab.icon className="h-4 w-4 shrink-0" />
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
