"use client";

import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { graphScopes, isAuthConfigured } from "@/lib/config/auth";
import { LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Login/logout button for the header.
 * Shows nothing if auth is not configured (anonymous mode).
 */
export function AuthButton() {
  if (!isAuthConfigured) return null;

  return <AuthButtonInner />;
}

function AuthButtonInner() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const handleLogin = async () => {
    try {
      await instance.loginPopup({ scopes: graphScopes });
    } catch (err) {
      console.error("[Auth] Login failed:", err);
    }
  };

  const handleLogout = () => {
    instance.logoutPopup();
  };

  if (!isAuthenticated) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs"
        onClick={handleLogin}
      >
        <LogIn className="h-3.5 w-3.5" />
        Sign in
      </Button>
    );
  }

  const account = accounts[0];
  const displayName = account?.name || account?.username || "User";

  return (
    <div className="flex items-center gap-2">
      <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
        <User className="h-3.5 w-3.5" />
        <span className="max-w-[150px] truncate">{displayName}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 text-xs"
        onClick={handleLogout}
      >
        <LogOut className="h-3.5 w-3.5" />
        Sign out
      </Button>
    </div>
  );
}
