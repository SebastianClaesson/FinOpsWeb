/**
 * MSAL / Entra ID authentication configuration.
 *
 * Set these values via environment variables:
 *   NEXT_PUBLIC_AZURE_CLIENT_ID   — App registration client ID
 *   NEXT_PUBLIC_AZURE_TENANT_ID   — Home tenant ID
 *   AZURE_CLIENT_SECRET           — Client secret (server-side only, for service principal flows)
 *
 * The app is registered as single-tenant but supports accessing billing data
 * from multiple tenants via Azure Lighthouse or B2B guest accounts.
 */

import { type Configuration, LogLevel } from "@azure/msal-browser";

const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID ?? "";
const tenantId = process.env.NEXT_PUBLIC_AZURE_TENANT_ID ?? "";

/** Whether auth is configured (env vars are set). */
export const isAuthConfigured = Boolean(clientId && tenantId);

/** MSAL browser configuration. */
export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
    postLogoutRedirectUri: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
  },
  cache: {
    cacheLocation: "localStorage",
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning,
      loggerCallback: (level, message) => {
        if (level === LogLevel.Error) console.error("[MSAL]", message);
      },
    },
  },
};

/** Scopes for Azure Management API access. */
export const azureManagementScopes = ["https://management.azure.com/.default"];

/** Scopes for Microsoft Graph (user profile). */
export const graphScopes = ["User.Read"];

/**
 * Build an authority URL for a specific tenant.
 * Used for cross-tenant token acquisition (B2B guest access).
 */
export function tenantAuthority(targetTenantId: string): string {
  return `https://login.microsoftonline.com/${targetTenantId}`;
}
