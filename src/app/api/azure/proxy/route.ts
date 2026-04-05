/**
 * API proxy for Azure Management API calls.
 *
 * Supports two modes:
 * 1. User token passthrough — client passes Bearer token, proxy forwards it
 * 2. Service principal — proxy acquires token server-side using client credentials
 *    (for Lighthouse-delegated access or unattended scenarios)
 *
 * Query params:
 *   path     — Azure Management API path (e.g., /subscriptions?api-version=2022-12-01)
 *   tenantId — Target tenant ID for token acquisition
 *
 * The client secret (AZURE_CLIENT_SECRET) never leaves the server.
 */

import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const AZURE_BASE = "https://management.azure.com";

/**
 * Acquire a service principal token for a target tenant using client credentials.
 */
async function acquireServiceToken(tenantId: string): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Service principal credentials not configured (AZURE_CLIENT_SECRET missing)");
  }

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: "https://management.azure.com/.default",
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Token acquisition failed for tenant ${tenantId}: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path");
  const tenantId = request.nextUrl.searchParams.get("tenantId");

  if (!path) {
    return Response.json({ error: "Missing 'path' parameter" }, { status: 400 });
  }

  // Determine access token source
  let accessToken: string;

  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    // User token passthrough
    accessToken = authHeader.slice(7);
  } else if (tenantId) {
    // Service principal flow
    try {
      accessToken = await acquireServiceToken(tenantId);
    } catch (err) {
      return Response.json(
        { error: err instanceof Error ? err.message : "Token acquisition failed" },
        { status: 401 }
      );
    }
  } else {
    return Response.json(
      { error: "No authorization provided. Pass a Bearer token or tenantId for service principal flow." },
      { status: 401 }
    );
  }

  // Forward request to Azure Management API
  const url = `${AZURE_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const azureRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const body = await azureRes.text();

    return new Response(body, {
      status: azureRes.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Azure API request failed" },
      { status: 502 }
    );
  }
}
