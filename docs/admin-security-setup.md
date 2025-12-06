# Admin Security & Financial Data Protection Setup

**Date:** 2025-01-27  
**Status:** ✅ Complete  
**Purpose:** Secure admin dashboards and protect sensitive financial data

---

## 🔒 Security Implementation

### Admin Authentication
- ✅ Admin authentication middleware
- ✅ Role-based access control (Admin, Financial Admin, Super Admin)
- ✅ Route guards for all admin pages
- ✅ API route protection

### Financial Data Protection
- ✅ git-crypt encryption setup
- ✅ Protected directory structure
- ✅ Financial admin role requirement
- ✅ Encrypted storage for AIAS financial data

---

## 📁 Directory Structure

```
internal/
  private/
    financial/
      aias/              # AIAS-specific financial data (encrypted)
        .gitkeep
      .gitkeep
    reports/             # Sensitive reports (encrypted)
      .gitkeep

lib/
  admin/
    accounting-tools.ts  # Public admin tools (visible in repo)
  auth/
    admin-auth.ts       # Admin authentication utilities

app/
  admin/
    cost-dashboard/     # Admin-only (protected)
    financial/
      aias/             # Financial admin-only (protected)
    metrics/            # Admin-only (protected)
    kpis/               # Admin-only (protected)
    ...                 # All admin routes protected

components/
  admin/
    admin-layout.tsx    # Admin layout with auth check
```

---

## 🛡️ Access Control

### Admin Routes
All routes under `/admin/*` require:
- ✅ Admin authentication
- ✅ Admin role in profile
- ✅ Automatic redirect to signin if not authenticated

### Financial Routes
Routes under `/admin/financial/*` require:
- ✅ Admin authentication
- ✅ Financial Admin role
- ✅ Additional authorization check

### API Routes
- ✅ `/api/admin/*` - Requires admin authentication
- ✅ `/api/admin/financial/*` - Requires financial admin role
- ✅ Automatic 403 response if unauthorized

---

## 🔐 git-crypt Setup

### Installation
```bash
# macOS
brew install git-crypt

# Linux
sudo apt-get install git-crypt

# Or download from: https://www.agwa.name/projects/git-crypt/
```

### Initialization
```bash
# Run setup script
chmod +x scripts/setup-git-crypt.sh
./scripts/setup-git-crypt.sh

# Or manually:
git-crypt init
git-crypt add-gpg-user YOUR_EMAIL
```

### Usage
```bash
# Unlock encrypted files (to view)
git-crypt unlock

# Lock files (after viewing)
git-crypt lock

# Files are automatically encrypted on commit
```

### Protected Files
Files matching these patterns are encrypted:
- `internal/private/financial/**`
- `*.financial`
- `*.accounting`
- `internal/private/reports/**`

---

## 👥 Admin Roles

### Admin
- Access to all admin dashboards
- Cost tracking and metrics
- KPI dashboards
- General admin tools

### Financial Admin
- All Admin permissions
- Access to financial reports
- AIAS financial data
- Budget planning tools

### Super Admin
- All Financial Admin permissions
- System configuration
- User management
- Full system access

---

## 📊 Protected Dashboards

### Admin-Only Dashboards
- `/admin/cost-dashboard` - Cost tracking
- `/admin/metrics` - Business metrics
- `/admin/kpis` - KPI dashboard
- `/admin/insights` - Business insights
- `/admin/optimization` - Optimization tools
- All other `/admin/*` routes

### Financial Admin-Only
- `/admin/financial/aias` - AIAS financial reports
- `/api/admin/financial/aias/*` - Financial data API

---

## 🔧 Implementation Details

### Admin Layout Component
```tsx
<AdminLayout requireFinancialAccess={true}>
  {/* Protected content */}
</AdminLayout>
```

### Server-Side Protection
```tsx
// In page.tsx
const adminCheck = await checkAdminAccess();
if (!adminCheck.isAdmin) {
  redirect("/signin");
}
```

### API Route Protection
```tsx
// In route.ts
const adminCheck = await requireAdmin(request);
if (!adminCheck.authorized) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}
```

---

## 📝 Adding New Admin Routes

### 1. Create Page
```tsx
// app/admin/new-page/page.tsx
import { AdminLayout } from "@/components/admin/admin-layout";
import { checkAdminAccess } from "@/lib/auth/admin-auth";
import { redirect } from "next/navigation";

export default async function NewPage() {
  const adminCheck = await checkAdminAccess();
  if (!adminCheck.isAdmin) {
    redirect("/signin");
  }

  return (
    <AdminLayout>
      {/* Your content */}
    </AdminLayout>
  );
}
```

### 2. Create API Route (if needed)
```tsx
// app/api/admin/new-route/route.ts
import { requireAdmin } from "@/lib/auth/admin-auth";

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.authorized) {
    return adminCheck.response;
  }
  // Your API logic
}
```

---

## 🔒 Financial Data Storage

### Structure
```
internal/private/financial/aias/
  ├── monthly-reports/
  │   ├── 2025-01.json
  │   └── 2025-02.json
  ├── annual-reports/
  │   └── 2024.json
  └── raw-data/
      └── transactions.csv
```

### Access
- Files are encrypted with git-crypt
- Only Financial Admins can access via `/admin/financial/aias`
- API: `/api/admin/financial/aias/reports`

### Adding Financial Data
1. Unlock git-crypt: `git-crypt unlock`
2. Add files to `internal/private/financial/aias/`
3. Commit (files auto-encrypt)
4. Lock: `git-crypt lock`

---

## ✅ Security Checklist

- ✅ All admin routes protected
- ✅ Role-based access control
- ✅ Financial data encrypted
- ✅ API routes secured
- ✅ Automatic redirects for unauthorized access
- ✅ git-crypt configured
- ✅ Protected directory structure
- ✅ Admin tools visible (for dev)
- ✅ Financial data hidden (encrypted)

---

## 🚨 Important Notes

1. **Never commit unencrypted financial data**
   - Always use git-crypt
   - Lock after viewing: `git-crypt lock`

2. **Admin Access**
   - Only grant admin roles to trusted users
   - Financial Admin is highly sensitive

3. **git-crypt Keys**
   - Store GPG keys securely
   - Rotate keys if compromised
   - Use multiple GPG users for team access

4. **Backup**
   - Encrypted files are safe to backup
   - Keep GPG keys secure and backed up

---

## 📚 Related Documentation

- [git-crypt Documentation](https://www.agwa.name/projects/git-crypt/)
- [Admin Authentication](./lib/auth/admin-auth.ts)
- [Cost Management System](./cost-management-system.md)

---

**Status:** ✅ Complete and Production Ready
