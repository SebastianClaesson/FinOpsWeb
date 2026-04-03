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
import { Badge } from "@/components/ui/badge";
import { REPORTS, getReportForPath } from "@/lib/config/reports";

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const activeReport = getReportForPath(pathname);

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
            <SheetTitle className="text-sm">Reports</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-0.5 p-3">
            {REPORTS.map((report) => (
              <div key={report.id}>
                <Link
                  href={report.tabs[0].href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                    activeReport?.id === report.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <report.icon className="h-4 w-4 shrink-0" />
                  {report.name}
                  {!report.ready && (
                    <Badge variant="outline" className="ml-auto text-[9px] px-1 py-0 opacity-60">Soon</Badge>
                  )}
                </Link>
                {activeReport?.id === report.id && (
                  <div className="ml-4 flex flex-col gap-0.5 border-l pl-2 mt-1 mb-2">
                    {report.tabs.map((tab) => {
                      const isActive = pathname === tab.href;
                      return (
                        <Link
                          key={tab.href}
                          href={tab.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <tab.icon className="h-3 w-3 shrink-0" />
                          {tab.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
