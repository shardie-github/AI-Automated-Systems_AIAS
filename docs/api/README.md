# API Documentation

This document provides comprehensive API documentation for the AIAS Platform.

## 🔗 Base URL

- **Development**: `http://localhost:3000/api`
- **Staging**: `https://staging.aias-platform.com/api`
- **Production**: `https://api.aias-platform.com`

## 🔐 Authentication

All API requests require authentication using JWT tokens.

### Headers

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

### Getting a Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user"
  }
}
```

## 📚 API Endpoints

### Authentication

#### POST /api/auth/login
Authenticate user and get JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user"
  }
}
```

#### POST /api/auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "your-password",
  "name": "User Name"
}
```

#### POST /api/auth/logout
Logout user and invalidate token.

#### POST /api/auth/refresh
Refresh JWT token.

### AI Agents

#### GET /api/agents
Get all AI agents for the current tenant.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term
- `status` (string): Filter by status

**Response:**
```json
{
  "agents": [
    {
      "id": "agent-id",
      "name": "Customer Service Agent",
      "description": "AI agent for customer support",
      "model": "gpt-4",
      "status": "active",
      "created_at": "2024-01-20T10:00:00Z",
      "updated_at": "2024-01-20T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

#### POST /api/agents
Create a new AI agent.

**Request:**
```json
{
  "name": "Customer Service Agent",
  "description": "AI agent for customer support",
  "model": "gpt-4",
  "config": {
    "temperature": 0.7,
    "max_tokens": 1000,
    "system_prompt": "You are a helpful customer service agent."
  }
}
```

#### GET /api/agents/:id
Get a specific AI agent.

#### PUT /api/agents/:id
Update an AI agent.

#### DELETE /api/agents/:id
Delete an AI agent.

#### POST /api/agents/:id/chat
Chat with an AI agent.

**Request:**
```json
{
  "message": "Hello, I need help with my order",
  "context": {
    "user_id": "user-id",
    "session_id": "session-id"
  }
}
```

**Response:**
```json
{
  "response": "Hello! I'd be happy to help you with your order. Could you please provide your order number?",
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 25,
    "total_tokens": 75
  }
}
```

### Workflows

#### GET /api/workflows
Get all workflows for the current tenant.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status

**Response:**
```json
{
  "workflows": [
    {
      "id": "workflow-id",
      "name": "Lead Qualification",
      "description": "Automated lead qualification workflow",
      "status": "active",
      "nodes": [...],
      "connections": [...],
      "created_at": "2024-01-20T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

#### POST /api/workflows
Create a new workflow.

**Request:**
```json
{
  "name": "Lead Qualification",
  "description": "Automated lead qualification workflow",
  "nodes": [
    {
      "id": "node-1",
      "type": "trigger",
      "position": { "x": 100, "y": 100 },
      "config": {
        "event": "lead_created"
      }
    }
  ],
  "connections": []
}
```

#### GET /api/workflows/:id
Get a specific workflow.

#### PUT /api/workflows/:id
Update a workflow.

#### DELETE /api/workflows/:id
Delete a workflow.

#### POST /api/workflows/:id/execute
Execute a workflow.

**Request:**
```json
{
  "input": {
    "lead_id": "lead-123",
    "lead_data": {
      "email": "lead@example.com",
      "company": "Example Corp"
    }
  }
}
```

### Marketplace

#### GET /api/marketplace/templates
Get available workflow templates.

**Query Parameters:**
- `category` (string): Filter by category
- `price_range` (string): Filter by price range
- `search` (string): Search term

#### GET /api/marketplace/templates/:id
Get a specific template.

#### POST /api/marketplace/templates/:id/purchase
Purchase a template.

#### GET /api/marketplace/apps
Get available one-time apps.

#### POST /api/marketplace/apps/:id/purchase
Purchase an app.

### Billing

#### GET /api/billing/subscription
Get current subscription details.

**Response:**
```json
{
  "plan": {
    "id": "professional",
    "name": "Professional Plan",
    "price_monthly": 99,
    "features": ["25 workflows", "10,000 executions"]
  },
  "status": "active",
  "next_billing": "2024-02-20T10:00:00Z",
  "usage": {
    "workflows": 15,
    "executions": 5000,
    "storage": 2.5
  }
}
```

#### POST /api/billing/subscription
Update subscription plan.

#### GET /api/billing/invoices
Get billing invoices.

#### GET /api/billing/usage
Get current usage statistics.

### Analytics

#### GET /api/analytics/overview
Get platform overview analytics.

**Query Parameters:**
- `period` (string): Time period (7d, 30d, 90d, 1y)
- `metric` (string): Specific metric to retrieve

**Response:**
```json
{
  "revenue": {
    "current": 5000,
    "previous": 4500,
    "growth": 11.1
  },
  "users": {
    "total": 150,
    "active": 120,
    "new": 25
  },
  "workflows": {
    "total": 45,
    "executions": 1200,
    "success_rate": 95.5
  }
}
```

#### GET /api/analytics/agents
Get AI agent analytics.

#### GET /api/analytics/workflows
Get workflow analytics.

## 🔄 Webhooks

### Stripe Webhooks

#### POST /api/webhooks/stripe
Handle Stripe webhook events.

**Headers:**
```http
Stripe-Signature: t=timestamp,v1=signature
```

**Events:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### Custom Webhooks

#### POST /api/webhooks/custom
Handle custom webhook events.

## 📊 Rate Limiting

API requests are rate limited per tenant:

- **Free Plan**: 100 requests/hour
- **Professional Plan**: 1,000 requests/hour
- **Enterprise Plan**: 10,000 requests/hour

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## 🚨 Error Handling

All API errors follow a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### Error Codes

- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_ERROR` - Authentication required
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded
- `INTERNAL_ERROR` - Server error

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## 📝 SDKs

### JavaScript/TypeScript

```bash
npm install @aias-platform/sdk
```

```typescript
import { AIASClient } from '@aias-platform/sdk';

const client = new AIASClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.aias-platform.com'
});

// Create an AI agent
const agent = await client.agents.create({
  name: 'Customer Service Agent',
  model: 'gpt-4',
  config: {
    temperature: 0.7,
    system_prompt: 'You are a helpful assistant.'
  }
});

// Chat with the agent
const response = await client.agents.chat(agent.id, {
  message: 'Hello!'
});
```

### Python

```bash
pip install aias-platform
```

```python
from aias_platform import AIASClient

client = AIASClient(
    api_key='your-api-key',
    base_url='https://api.aias-platform.com'
)

# Create an AI agent
agent = client.agents.create(
    name='Customer Service Agent',
    model='gpt-4',
    config={
        'temperature': 0.7,
        'system_prompt': 'You are a helpful assistant.'
    }
)

# Chat with the agent
response = client.agents.chat(agent.id, {
    'message': 'Hello!'
})
```

## 🔧 Testing

### Postman Collection

Download our Postman collection for easy API testing:
[AIAS Platform API Collection](https://www.postman.com/aias-platform/workspace/aias-platform-api)

### API Testing

```bash
# Test authentication
curl -X POST https://api.aias-platform.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Test agent creation
curl -X POST https://api.aias-platform.com/api/agents \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Agent","model":"gpt-4"}'
```

## 📞 Support

- **Documentation**: [docs.aias-platform.com](https://docs.aias-platform.com)
- **API Status**: [status.aias-platform.com](https://status.aias-platform.com)
- **Support Email**: api-support@aias-platform.com
- **GitHub Issues**: [github.com/your-org/aias-platform/issues](https://github.com/your-org/aias-platform/issues)

---

For more detailed information, visit our [complete API documentation](https://docs.aias-platform.com/api).