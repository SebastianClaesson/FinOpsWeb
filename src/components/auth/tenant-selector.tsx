"use client";

import { useState, useEffect } from "react";
import { getAllTenants, type TenantConfig } from "@/lib/config/tenants";
import { isAuthConfigured } from "@/lib/config/auth";
import { Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ACTIVE_TENANT_KEY = "finops-active-tenant";

/**
 * Tenant selector dropdown for the header.
 * Only shows when auth is configured and multiple tenants exist.
 */
export function TenantSelector() {
  const [tenants, setTenants] = useState<TenantConfig[]>([]);
  const [activeTenantId, setActiveTenantId] = useState<string>("");

  useEffect(() => {
    if (!isAuthConfigured) return;
    const all = getAllTenants();
    setTenants(all);

    // Restore active tenant from localStorage
    const stored = localStorage.getItem(ACTIVE_TENANT_KEY);
    if (stored && all.some((t) => t.id === stored)) {
      setActiveTenantId(stored);
    } else if (all.length > 0) {
      setActiveTenantId(all[0].id);
    }
  }, []);

  if (!isAuthConfigured || tenants.length <= 1) return null;

  const handleChange = (tenantId: string | null) => {
    if (!tenantId) return;
    setActiveTenantId(tenantId);
    localStorage.setItem(ACTIVE_TENANT_KEY, tenantId);
    // Reload data for the new tenant
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-1.5">
      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
      <Select value={activeTenantId} onValueChange={handleChange}>
        <SelectTrigger className="h-8 w-[180px] text-xs">
          <SelectValue placeholder="Select tenant" />
        </SelectTrigger>
        <SelectContent>
          {tenants.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              <div className="flex items-center gap-2">
                <span>{t.name}</span>
                {t.isHome && (
                  <span className="text-[10px] text-muted-foreground">(home)</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Get the currently active tenant ID.
 */
export function getActiveTenantId(): string {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_AZURE_TENANT_ID ?? "";
  }
  const stored = localStorage.getItem(ACTIVE_TENANT_KEY);
  if (stored) return stored;
  const tenants = getAllTenants();
  return tenants[0]?.id ?? "";
}
