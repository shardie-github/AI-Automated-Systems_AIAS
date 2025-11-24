/**
 * OpenAPI/Swagger Documentation Endpoint
 * Generates OpenAPI 3.0 specification for the API
 */

import { NextResponse } from 'next/server';
import { createGETHandler } from '@/lib/api/route-handler';

import openApiSpec from "@/../docs/openapi-complete.yaml?raw";

const openApiSpecParsed = JSON.parse(openApiSpec);

const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'AIAS Platform API',
    version: '1.0.0',
    description: 'Enterprise-grade AI consultancy platform API',
    contact: {
      name: 'AIAS Platform Support',
      email: 'support@aias-platform.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://api.aias-platform.com',
      description: 'Production server',
    },
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  tags: [
    { name: 'Health', description: 'Health check endpoints' },
    { name: 'Authentication', description: 'Authentication endpoints' },
    { name: 'Workflows', description: 'Workflow management' },
    { name: 'AI Agents', description: 'AI agent operations' },
    { name: 'Telemetry', description: 'Telemetry and analytics' },
    { name: 'Circuit Breaker', description: 'Circuit breaker metrics' },
  ],
  paths: {
    '/api/healthz': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Returns the health status of the system',
        operationId: 'healthCheck',
        responses: {
          '200': {
            description: 'System is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean' },
                    timestamp: { type: 'string', format: 'date-time' },
                    db: {
                      type: 'object',
                      properties: {
                        ok: { type: 'boolean' },
                        latency_ms: { type: 'number' },
                      },
                    },
                    auth: {
                      type: 'object',
                      properties: {
                        ok: { type: 'boolean' },
                        latency_ms: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
          '503': {
            description: 'System is unhealthy',
          },
        },
      },
    },
    '/api/telemetry/ingest': {
      post: {
        tags: ['Telemetry'],
        summary: 'Ingest telemetry data',
        description: 'Submit telemetry events for analytics',
        operationId: 'ingestTelemetry',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  event: { type: 'string' },
                  properties: { type: 'object' },
                  timestamp: { type: 'string', format: 'date-time' },
                },
                required: ['event'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Telemetry ingested successfully',
          },
          '400': {
            description: 'Invalid request',
          },
        },
      },
    },
    '/api/circuit-breaker/metrics': {
      get: {
        tags: ['Circuit Breaker'],
        summary: 'Get circuit breaker metrics',
        description: 'Returns current state of all circuit breakers',
        operationId: 'getCircuitBreakerMetrics',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Circuit breaker metrics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    circuitBreakers: {
                      type: 'object',
                      additionalProperties: {
                        type: 'object',
                        properties: {
                          state: {
                            type: 'string',
                            enum: ['closed', 'open', 'half-open'],
                          },
                          failures: { type: 'number' },
                          successes: { type: 'number' },
                          totalRequests: { type: 'number' },
                          totalFailures: { type: 'number' },
                          totalSuccesses: { type: 'number' },
                        },
                      },
                    },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          code: { type: 'string' },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

export const GET = createGETHandler(
  async () => {
    const spec = loadOpenAPISpec();
    return NextResponse.json(spec, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
  {
    cache: {
      enabled: true,
      ttl: 3600, // Cache for 1 hour
    },
  }
);
