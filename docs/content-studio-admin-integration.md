# Content Studio Admin Integration

## Overview

Content Studio is now integrated with the admin account system. When an admin account is created for the AIAS website, they automatically receive a Content Studio token that allows them to access the customization panel without needing to manually configure tokens.

## How It Works

### Automatic Token Generation

1. **Admin Role Assignment**: When a user is assigned the `admin` role in the `user_roles` table, a database trigger automatically generates a unique Content Studio token.

2. **Token Storage**: The token is stored in the `profiles` table in the `content_studio_token` column.

3. **Automatic Access**: Admin users can access Content Studio by:
   - Signing in to their admin account
   - Clicking "Sign In as Admin" in the Content Studio login page
   - The system automatically retrieves their token

### Database Schema

The migration `20250201000000_content_studio_tokens.sql` adds:

- `content_studio_token` column to `profiles` table
- `generate_content_studio_token()` function to create secure random tokens
- `auto_generate_content_studio_token()` trigger function
- `get_or_create_content_studio_token()` function for token management
- Database trigger that auto-generates tokens when admin role is assigned

### API Endpoints

#### GET `/api/content/auth`
Returns the Content Studio token for the currently authenticated admin user.

**Authentication**: Requires valid Supabase session with admin role

**Response**:
```json
{
  "success": true,
  "token": "base64-encoded-token-here"
}
```

#### POST `/api/content/auth/verify`
Verifies a Content Studio token and returns user information.

**Request Body**:
```json
{
  "token": "content-studio-token"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "admin@example.com",
    "name": "Admin Name"
  }
}
```

## Usage

### For Admins

1. **Sign In**: Sign in to your admin account on the AIAS website
2. **Access Content Studio**: Navigate to `/admin/content-studio`
3. **Auto-Authentication**: Click "Sign In as Admin" button - your token will be automatically retrieved
4. **Manual Token**: You can also manually enter your token if needed

### For Developers

#### Assigning Admin Role

```typescript
import { assignAdminRole } from "@/lib/actions/admin-actions";

const result = await assignAdminRole(userId);
if (result.success) {
  console.log("Admin role assigned, token:", result.token);
}
```

#### Getting Token for Current User

```typescript
// From client-side (with session)
const response = await fetch("/api/content/auth");
const { token } = await response.json();
```

## Security

- Tokens are unique per admin user
- Tokens are stored securely in the database
- Tokens are only accessible to the admin user themselves (via RLS policies)
- Admin status is verified on every Content Studio API call
- If admin role is removed, token access is revoked

## Backward Compatibility

The system maintains backward compatibility with the legacy `CONTENT_STUDIO_TOKEN` environment variable. If an admin token verification fails, the system falls back to checking the environment variable.

## Migration

To apply the database changes:

```bash
# Run the migration
supabase migration up

# Or if using Prisma
npm run db:migrate
```

## Troubleshooting

### Token Not Generated

If a token isn't generated when admin role is assigned:

1. Check that the database trigger is active:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trigger_auto_generate_content_studio_token';
   ```

2. Manually generate token:
   ```sql
   SELECT get_or_create_content_studio_token('user-uuid-here');
   ```

### Cannot Access Content Studio

1. Verify admin role is assigned:
   ```sql
   SELECT * FROM user_roles WHERE user_id = 'user-uuid' AND role = 'admin';
   ```

2. Check token exists:
   ```sql
   SELECT content_studio_token FROM profiles WHERE id = 'user-uuid';
   ```

3. Verify RLS policies allow access

### Regenerating Token

To regenerate a token for an admin:

```sql
UPDATE profiles
SET content_studio_token = generate_content_studio_token()
WHERE id = 'user-uuid';
```
