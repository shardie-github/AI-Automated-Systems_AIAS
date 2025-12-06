/**
 * Admin Layout Component
 * 
 * Wraps admin pages with authentication check and admin UI.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Shield, AlertTriangle } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  requireFinancialAccess?: boolean;
}

export function AdminLayout({ children, requireFinancialAccess = false }: AdminLayoutProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const response = await fetch("/api/auth/admin/check", {
        credentials: "include",
      });

      if (!response.ok) {
        setIsAuthorized(false);
        setIsLoading(false);
        router.push("/signin?redirect=" + encodeURIComponent(window.location.pathname));
        return;
      }

      const data = await response.json();
      
      if (!data.isAdmin) {
        setIsAuthorized(false);
        setIsLoading(false);
        router.push("/signin?error=admin_access_required");
        return;
      }

      // Check financial access if required
      if (requireFinancialAccess && !data.hasFinancialAccess) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      setUser({ email: data.email, role: data.role });
      setIsAuthorized(true);
    } catch (error) {
      console.error("Error checking admin access:", error);
      setIsAuthorized(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Verifying admin access...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            {requireFinancialAccess
              ? "Financial admin access is required to view this page."
              : "Admin access is required to view this page."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="border-b bg-muted/40">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold">Admin Dashboard</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">{user?.email}</span>
              <Badge variant="outline">{user?.role}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="container py-6">{children}</div>
    </div>
  );
}

// Import Badge
import { Badge } from "@/components/ui/badge";
