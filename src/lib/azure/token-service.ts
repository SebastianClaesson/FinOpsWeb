"use client";

/**
 * Token acquisition service for Azure API calls.
 *
 * Supports two flows:
 * 1. User credentials (interactive) — acquires tokens via MSAL for the target tenant
 * 2. Service principal — delegates to server-side API proxy (client secret stays server-side)
 *
 * For cross-tenant access:
 * - User flow: MSAL acquires token with the target tenant's authority (B2B guest)
 * - Service flow: server-side proxy uses Lighthouse delegation
 */

import { PublicClientApplication } from "@azure/msal-browser";
import { azureManagementScopes, tenantAuthority } from "@/lib/config/auth";

/**
 * Acquire an Azure Management API token for a specific tenant using user credentials.
 * Falls back to interactive login if silent acquisition fails.
 */
export async function acquireTokenForTenant(
  msalInstance: PublicClientApplication,
  targetTenantId: string
): Promise<string> {
  const account = msalInstance.getActiveAccount();
  if (!account) {
    throw new Error("No active account. Please sign in first.");
  }

  try {
    // Try silent token acquisition for the target tenant
    const result = await msalInstance.acquireTokenSilent({
      scopes: azureManagementScopes,
      account,
      authority: tenantAuthority(targetTenantId),
    });
    return result.accessToken;
  } catch {
    // Silent failed — try interactive
    const result = await msalInstance.acquireTokenPopup({
      scopes: azureManagementScopes,
      account,
      authority: tenantAuthority(targetTenantId),
    });
    return result.accessToken;
  }
}

/**
 * Call an Azure Management API endpoint via the server-side proxy.
 * The proxy handles token acquisition for service principal flows.
 */
export async function callAzureApi(
  path: string,
  tenantId: string,
  accessToken?: string
): Promise<unknown> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    // User credential flow — pass token directly
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`/api/azure/proxy?path=${encodeURIComponent(path)}&tenantId=${tenantId}`, {
    headers,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Azure API error ${res.status}: ${body}`);
  }

  return res.json();
}
