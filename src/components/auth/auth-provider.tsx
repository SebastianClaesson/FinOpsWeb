"use client";

import { type ReactNode } from "react";
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { msalConfig, isAuthConfigured } from "@/lib/config/auth";

let msalInstance: PublicClientApplication | null = null;

function getMsalInstance(): PublicClientApplication | null {
  if (!isAuthConfigured) return null;
  if (msalInstance) return msalInstance;

  msalInstance = new PublicClientApplication(msalConfig);

  // Set active account on login success
  msalInstance.addEventCallback((event) => {
    if (
      event.eventType === EventType.LOGIN_SUCCESS &&
      event.payload &&
      "account" in event.payload &&
      event.payload.account
    ) {
      msalInstance!.setActiveAccount(event.payload.account);
    }
  });

  return msalInstance;
}

/**
 * Wraps children in MsalProvider if auth is configured.
 * If NEXT_PUBLIC_AZURE_CLIENT_ID and NEXT_PUBLIC_AZURE_TENANT_ID are not set,
 * renders children without auth (anonymous mode for local dev / CSV-only usage).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const instance = getMsalInstance();

  if (!instance) {
    // Auth not configured — run in anonymous mode
    return <>{children}</>;
  }

  return <MsalProvider instance={instance}>{children}</MsalProvider>;
}
