"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { REPORTS, getReportForPath } from "@/lib/config/reports";
import { Badge } from "@/components/ui/badge";

export function Sidebar() {
  const pathname = usePathname();
  const activeReport = getReportForPath(pathname);

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border/50 bg-sidebar/50 backdrop-blur-sm lg:block">
      <div className="flex h-full flex-col overflow-y-auto">
        {/* Report selector */}
        <nav className="flex flex-col gap-0.5 p-3 pt-4">
          <p className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Reports
          </p>
          {REPORTS.map((report) => {
            const isActive = activeReport?.id === report.id;
            return (
              <Link
                key={report.id}
                href={report.tabs[0].href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <report.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{report.shortName}</span>
                {!report.ready && (
                  <Badge variant="outline" className="ml-auto text-[9px] px-1 py-0 opacity-60">
                    Soon
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Active report tabs */}
        {activeReport && (
          <nav className="flex flex-col gap-0.5 border-t border-border/50 p-3 pt-3">
            <p className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
              {activeReport.shortName}
            </p>
            {activeReport.tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <tab.icon
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 transition-transform duration-150",
                      !isActive && "group-hover:scale-110"
                    )}
                  />
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </aside>
  );
}
