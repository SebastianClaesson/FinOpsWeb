/**
 * Tenant registry for multi-tenant billing access.
 *
 * Tenants can be configured via:
 * 1. NEXT_PUBLIC_AZURE_TENANTS env var (JSON array)
 * 2. Settings page UI (stored in localStorage)
 * 3. The home tenant is always included automatically
 */

export interface TenantConfig {
  id: string;
  name: string;
  /** "user" = B2B guest access, "service" = Lighthouse/service principal */
  accessMethod: "user" | "service";
  /** Whether this is the home (app registration) tenant */
  isHome?: boolean;
}

const STORAGE_KEY = "finops-tenants";

/**
 * Get the home tenant from env vars.
 */
function getHomeTenant(): TenantConfig | null {
  const id = process.env.NEXT_PUBLIC_AZURE_TENANT_ID;
  if (!id) return null;
  return {
    id,
    name: process.env.NEXT_PUBLIC_AZURE_TENANT_NAME || "Home Tenant",
    accessMethod: "user",
    isHome: true,
  };
}

/**
 * Get additional tenants from env var (optional).
 * Format: NEXT_PUBLIC_AZURE_TENANTS='[{"id":"xxx","name":"Tenant B","accessMethod":"user"}]'
 */
function getEnvTenants(): TenantConfig[] {
  const raw = process.env.NEXT_PUBLIC_AZURE_TENANTS;
  if (!raw) return [];
  try {
    return JSON.parse(raw) as TenantConfig[];
  } catch {
    return [];
  }
}

/**
 * Get user-configured tenants from localStorage.
 */
function getStoredTenants(): TenantConfig[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TenantConfig[];
  } catch {
    return [];
  }
}

/**
 * Save user-configured tenants to localStorage.
 */
export function saveStoredTenants(tenants: TenantConfig[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tenants));
}

/**
 * Get all configured tenants (home + env + stored).
 * Home tenant is always first.
 */
export function getAllTenants(): TenantConfig[] {
  const home = getHomeTenant();
  const envTenants = getEnvTenants();
  const storedTenants = getStoredTenants();

  const all: TenantConfig[] = [];
  const seen = new Set<string>();

  if (home) {
    all.push(home);
    seen.add(home.id);
  }

  for (const t of [...envTenants, ...storedTenants]) {
    if (!seen.has(t.id)) {
      all.push(t);
      seen.add(t.id);
    }
  }

  return all;
}
