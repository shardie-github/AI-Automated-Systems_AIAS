# API Documentation

## Overview

This document provides comprehensive API documentation for the AIAS Platform. All API endpoints follow RESTful conventions and return JSON responses.

## Base URL

- **Production:** `https://aias-platform.com/api`
- **Development:** `http://localhost:3000/api`

## Authentication

Most API endpoints require authentication. Include the authentication token in one of the following ways:

1. **Authorization Header:**
   ```
   Authorization: Bearer <token>
   ```

2. **Cookie:**
   ```
   Cookie: sb-access-token=<token>
   ```

## Multi-Tenant Support

For multi-tenant endpoints, include the tenant ID:

- **Header:** `X-Tenant-ID: <tenant-id>`
- **Query Parameter:** `?tenant_id=<tenant-id>`

## Rate Limiting

API endpoints are rate-limited per user/IP:
- **Auth endpoints:** 5 requests/minute
- **Stripe endpoints:** 20 requests/minute
- **Telemetry endpoints:** 100 requests/minute
- **Default:** 100 requests/minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Unix timestamp when the limit resets

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": {}
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error
- `503`: Service Unavailable

## Endpoints

### Health & Status

#### GET /api/healthz
Comprehensive health check endpoint.

**Response:**
```json
{
  "ok": true,
  "timestamp": "2025-01-30T12:00:00Z",
  "db": {
    "ok": true,
    "latency_ms": 45
  },
  "rest": {
    "ok": true,
    "latency_ms": 32
  },
  "auth": {
    "ok": true,
    "latency_ms": 28
  },
  "rls": {
    "ok": true,
    "note": "RLS policies active"
  },
  "storage": {
    "ok": true,
    "latency_ms": 15,
    "buckets_count": 3
  },
  "total_latency_ms": 120
}
```

#### GET /api/status
System status and health information.

**Response:**
```json
{
  "status": "operational",
  "timestamp": "2025-01-30T12:00:00Z",
  "version": "1.0.0",
  "environment": "production",
  "services": {
    "database": "operational",
    "auth": "operational",
    "storage": "operational",
    "api": "operational"
  },
  "uptime": 86400,
  "memory": {
    "used": 125.5,
    "total": 256.0,
    "unit": "MB"
  }
}
```

### User Settings

#### GET /api/settings
Get user settings.

**Headers:**
- `Authorization: Bearer <token>`
- `X-Tenant-ID: <tenant-id>` (optional)

**Response:**
```json
{
  "settings": {
    "user_id": "uuid",
    "email_notifications_enabled": true,
    "push_notifications_enabled": true,
    "theme": "dark",
    "language": "en",
    "timezone": "America/Toronto"
  }
}
```

#### PUT /api/settings
Update user settings.

**Headers:**
- `Authorization: Bearer <token>`
- `X-Tenant-ID: <tenant-id>` (optional)

**Body:**
```json
{
  "email_notifications_enabled": true,
  "push_notifications_enabled": false,
  "theme": "light",
  "language": "fr",
  "timezone": "America/Toronto"
}
```

**Response:**
```json
{
  "settings": {
    "user_id": "uuid",
    "email_notifications_enabled": true,
    "push_notifications_enabled": false,
    "theme": "light",
    "language": "fr",
    "timezone": "America/Toronto"
  }
}
```

### Workflows (v1)

#### GET /api/v1/workflows
List workflows for the authenticated user.

**Headers:**
- `Authorization: Bearer <token>`
- `X-Tenant-ID: <tenant-id>` (optional)

**Query Parameters:**
- `tenant_id` (optional): Filter by tenant ID

**Response:**
```json
{
  "workflows": [
    {
      "id": "uuid",
      "name": "Daily Report Automation",
      "description": "Generates daily reports",
      "steps": [],
      "enabled": true,
      "created_at": "2025-01-30T12:00:00Z"
    }
  ]
}
```

#### POST /api/v1/workflows
Create a new workflow.

**Headers:**
- `Authorization: Bearer <token>`
- `X-Tenant-ID: <tenant-id>` (optional)

**Body:**
```json
{
  "name": "Daily Report Automation",
  "description": "Generates daily reports",
  "steps": [
    {
      "id": "step-1",
      "type": "trigger",
      "config": {}
    }
  ],
  "enabled": true
}
```

**Response:**
```json
{
  "workflow": {
    "id": "uuid",
    "name": "Daily Report Automation",
    "description": "Generates daily reports",
    "steps": [],
    "enabled": true,
    "created_at": "2025-01-30T12:00:00Z"
  }
}
```

### Agents (v1)

#### GET /api/v1/agents
List agents for the authenticated user.

**Headers:**
- `Authorization: Bearer <token>`
- `X-Tenant-ID: <tenant-id>` (optional)

**Query Parameters:**
- `tenant_id` (optional): Filter by tenant ID

**Response:**
```json
{
  "agents": [
    {
      "id": "uuid",
      "name": "Customer Support Bot",
      "description": "Handles customer inquiries",
      "type": "chatbot",
      "config": {},
      "enabled": true,
      "created_at": "2025-01-30T12:00:00Z"
    }
  ]
}
```

#### POST /api/v1/agents
Create a new agent.

**Headers:**
- `Authorization: Bearer <token>`
- `X-Tenant-ID: <tenant-id>` (optional)

**Body:**
```json
{
  "name": "Customer Support Bot",
  "description": "Handles customer inquiries",
  "type": "chatbot",
  "config": {
    "model": "gpt-4",
    "temperature": 0.7
  },
  "enabled": true
}
```

**Response:**
```json
{
  "agent": {
    "id": "uuid",
    "name": "Customer Support Bot",
    "description": "Handles customer inquiries",
    "type": "chatbot",
    "config": {},
    "enabled": true,
    "created_at": "2025-01-30T12:00:00Z"
  }
}
```

### Feature Flags

#### GET /api/flags/trust
Get trust-related feature flags.

**Response:**
```json
{
  "trust_audit_enabled": true,
  "trust_ledger_enabled": true,
  "trust_scoring_enabled": false,
  "trust_badges_enabled": true,
  "trust_verification_enabled": false,
  "timestamp": "2025-01-30T12:00:00Z"
}
```

### Telemetry

#### POST /api/telemetry/ingest
Ingest telemetry data.

**Headers:**
- `Content-Type: application/json`

**Body:**
```json
{
  "event": "page_view",
  "properties": {
    "path": "/dashboard",
    "user_id": "uuid"
  },
  "timestamp": "2025-01-30T12:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "event_id": "uuid"
}
```

### Analytics

#### POST /api/analytics/track
Track analytics event.

**Headers:**
- `Authorization: Bearer <token>` (optional)
- `Content-Type: application/json`

**Body:**
```json
{
  "event": "conversion",
  "properties": {
    "value": 49.99,
    "currency": "CAD"
  }
}
```

**Response:**
```json
{
  "success": true,
  "event_id": "uuid"
}
```

### Admin

#### GET /api/admin/compliance
Get compliance status (admin only).

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "compliance": {
    "gdpr": true,
    "ccpa": true,
    "pipeda": true,
    "soc2": false
  }
}
```

#### GET /api/admin/reliability
Get reliability dashboard data (admin only).

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "timestamp": "2025-01-30T12:00:00Z",
  "uptime": {
    "current": 99.95,
    "target": 99.9,
    "status": "healthy",
    "trend": "stable"
  },
  "performance": {
    "latency_p95": 250,
    "error_rate": 0.01,
    "throughput": 1000
  }
}
```

### Metrics

#### GET /api/metrics
Get system metrics (admin only).

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "metrics": {
    "requests_per_minute": 150,
    "error_rate": 0.01,
    "average_latency_ms": 200
  }
}
```

## Webhooks

### Stripe Webhook

#### POST /api/stripe/webhook
Stripe webhook endpoint for payment events.

**Headers:**
- `stripe-signature: <signature>`

**Body:** Stripe webhook payload

## SDK Examples

### JavaScript/TypeScript

```typescript
const API_BASE = 'https://aias-platform.com/api';

async function getSettings(token: string) {
  const response = await fetch(`${API_BASE}/settings`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
}

async function createWorkflow(token: string, workflow: any) {
  const response = await fetch(`${API_BASE}/v1/workflows`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(workflow),
  });
  return response.json();
}
```

### cURL

```bash
# Get settings
curl -X GET https://aias-platform.com/api/settings \
  -H "Authorization: Bearer <token>"

# Create workflow
curl -X POST https://aias-platform.com/api/v1/workflows \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Daily Report",
    "enabled": true
  }'
```

## Changelog

### v1.0.0 (2025-01-30)
- Initial API documentation
- Added workflows and agents endpoints
- Added feature flags endpoint
- Added status and health check endpoints
