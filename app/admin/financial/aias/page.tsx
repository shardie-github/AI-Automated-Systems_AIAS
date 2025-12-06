/**
 * AIAS Financial Reports
 * 
 * Protected page for AIAS-specific financial data.
 * Requires Financial Admin access.
 * Data is stored in internal/private/financial/aias/ (encrypted with git-crypt).
 */

import { redirect } from "next/navigation";
import { checkAdminAccess, AdminRole, hasAdminRole } from "@/lib/auth/admin-auth";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Lock, FileText } from "lucide-react";

export default async function AIASFinancialPage() {
  // Check admin access
  const adminCheck = await checkAdminAccess();

  if (!adminCheck.isAdmin) {
    redirect(adminCheck.redirect || "/signin");
  }

  // Check financial admin access
  if (!adminCheck.user) {
    redirect("/admin?error=access_denied");
  }

  const hasFinancialAccess = await hasAdminRole(adminCheck.user.id, AdminRole.FINANCIAL_ADMIN);

  if (!hasFinancialAccess) {
    return (
      <AdminLayout>
        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Financial Admin access is required to view AIAS financial data.
            Please contact a system administrator.
          </AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout requireFinancialAccess={true}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            AIAS Financial Reports
          </h1>
          <p className="text-muted-foreground mt-2">
            Confidential financial data for AI Automated Systems
          </p>
        </div>

        {/* Security Notice */}
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertTitle>Protected Data</AlertTitle>
          <AlertDescription>
            This page contains sensitive financial information. All data is encrypted
            with git-crypt and stored in internal/private/financial/aias/.
            Access is restricted to Financial Admins only.
          </AlertDescription>
        </Alert>

        {/* Financial Reports */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Monthly Reports
              </CardTitle>
              <CardDescription>
                Access monthly financial reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Monthly financial reports are stored in the protected directory.
                Use the API to fetch reports: /api/admin/financial/aias/reports
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Annual Reports
              </CardTitle>
              <CardDescription>
                Access annual financial summaries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Annual reports and summaries are available through the protected API.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Location Info */}
        <Card>
          <CardHeader>
            <CardTitle>Data Storage</CardTitle>
            <CardDescription>Where financial data is stored</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Location:</strong> internal/private/financial/aias/
              </p>
              <p>
                <strong>Encryption:</strong> git-crypt
              </p>
              <p>
                <strong>Access:</strong> Financial Admin role required
              </p>
              <p>
                <strong>API:</strong> /api/admin/financial/aias/*
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
