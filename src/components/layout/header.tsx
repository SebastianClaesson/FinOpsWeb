import { branding } from "@/lib/config/branding";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthButton } from "@/components/auth/auth-button";
import { TenantSelector } from "@/components/auth/tenant-selector";
import { Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Image
              src={branding.logoPath}
              alt={`${branding.companyName} logo`}
              width={20}
              height={20}
              className="dark:brightness-125"
            />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-tight">
              {branding.companyName}
            </span>
            <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
              {branding.tagline}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <TenantSelector />
          <AuthButton />
          <Link
            href="/settings"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
