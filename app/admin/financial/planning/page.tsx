/**
 * Business Planning Documents
 * 
 * Protected page for accessing business planning documents.
 * Requires Financial Admin access.
 * Documents are stored in internal/private/business-planning/ (encrypted with git-crypt).
 */

import { redirect } from "next/navigation";
import { checkAdminAccess, AdminRole, hasAdminRole } from "@/lib/auth/admin-auth";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, FileText, DollarSign, Users, TrendingUp } from "lucide-react";
import { getAccessibleDocuments } from "@/lib/admin/business-planning-access";

export default async function BusinessPlanningPage() {
  // Check admin access
  const adminCheck = await checkAdminAccess();

  if (!adminCheck.isAdmin) {
    redirect(adminCheck.redirect || "/signin");
  }

  // Check financial admin access
  if (!adminCheck.user) {
    redirect("/admin?error=access_denied");
  }

  const hasFinancialAccess = await hasAdminRole(
    adminCheck.user.id,
    AdminRole.FINANCIAL_ADMIN
  );

  if (!hasFinancialAccess) {
    return (
      <AdminLayout>
        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Financial Admin access is required to view business planning documents.
            Please contact a system administrator.
          </AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  const documents = getAccessibleDocuments(adminCheck.user.role);

  const documentsByCategory = {
    financial: documents.filter((d) => d.category === "financial"),
    investor: documents.filter((d) => d.category === "investor"),
    yc: documents.filter((d) => d.category === "yc"),
    strategy: documents.filter((d) => d.category === "strategy"),
  };

  return (
    <AdminLayout requireFinancialAccess={true}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Business Planning Documents
          </h1>
          <p className="text-muted-foreground mt-2">
            Access to encrypted business planning and financial documents
          </p>
        </div>

        {/* Security Notice */}
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertTitle>Protected Documents</AlertTitle>
          <AlertDescription>
            All documents in this section are encrypted with git-crypt and stored in
            internal/private/ directories. Access is restricted to Financial Admins only.
            Documents are decrypted on-demand when accessed.
          </AlertDescription>
        </Alert>

        {/* Financial Documents */}
        {documentsByCategory.financial.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              Financial Documents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentsByCategory.financial.map((doc) => (
                <Card key={doc.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {doc.name}
                      <Badge variant="outline">Encrypted</Badge>
                    </CardTitle>
                    <CardDescription>{doc.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-2">
                      Location: {doc.location}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Access via API: /api/admin/financial/planning/{doc.id}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Investor Documents */}
        {documentsByCategory.investor.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Users className="h-6 w-6" />
              Investor Relations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentsByCategory.investor.map((doc) => (
                <Card key={doc.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {doc.name}
                      <Badge variant="outline">Encrypted</Badge>
                    </CardTitle>
                    <CardDescription>{doc.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-2">
                      Location: {doc.location}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Access via API: /api/admin/financial/investor/{doc.id}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* YC Materials */}
        {documentsByCategory.yc.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              YC Application Materials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentsByCategory.yc.map((doc) => (
                <Card key={doc.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {doc.name}
                      <Badge variant="outline">Encrypted</Badge>
                    </CardTitle>
                    <CardDescription>{doc.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-2">
                      Location: {doc.location}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Access via API: /api/admin/financial/yc/{doc.id}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Strategy Documents */}
        {documentsByCategory.strategy.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Strategy Documents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentsByCategory.strategy.map((doc) => (
                <Card key={doc.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {doc.name}
                      <Badge variant="outline">Encrypted</Badge>
                    </CardTitle>
                    <CardDescription>{doc.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-2">
                      Location: {doc.location}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Access via API: /api/admin/financial/planning/{doc.id}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Data Location Info */}
        <Card>
          <CardHeader>
            <CardTitle>Data Storage & Access</CardTitle>
            <CardDescription>How documents are stored and accessed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Storage:</strong> Documents are stored in encrypted directories:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>internal/private/business-planning/</li>
                <li>internal/private/investor-relations/</li>
                <li>internal/private/yc-materials/</li>
              </ul>
              <p className="mt-4">
                <strong>Encryption:</strong> git-crypt
              </p>
              <p>
                <strong>Access:</strong> Financial Admin or Super Admin role required
              </p>
              <p>
                <strong>API:</strong> /api/admin/financial/planning/*, /api/admin/financial/investor/*, /api/admin/financial/yc/*
              </p>
              <p className="mt-4 text-muted-foreground">
                <strong>Note:</strong> Access modules (lib/admin/*) are visible in the repo
                for IP protection, but actual document data is encrypted.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
