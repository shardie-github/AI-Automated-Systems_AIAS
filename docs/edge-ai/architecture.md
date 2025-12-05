# Edge AI Accelerator Studio - Architecture

## System Overview

The Edge AI Accelerator Studio is built as a native module within the AIAS platform, following the same architectural patterns and conventions.

## Components

### Backend

1. **Database Layer** (`supabase/migrations/20250131000003_edge_ai_accelerator_studio.sql`)
   - PostgreSQL tables with RLS policies
   - Enums for type safety
   - Indexes for performance
   - Triggers for `updated_at` timestamps

2. **API Layer** (`app/api/edge/*`)
   - RESTful endpoints following Next.js App Router conventions
   - Authentication via Supabase Auth
   - Validation using Zod schemas
   - Error handling via centralized handler
   - Telemetry tracking for analytics

3. **Type System** (`lib/edge-ai/types.ts`)
   - TypeScript types for all entities
   - Request/Response types for API
   - Shared types across frontend and backend

4. **Utilities** (`lib/edge-ai/utils.ts`)
   - Validation functions
   - Format conversion helpers
   - Device compatibility checks
   - Display name formatters

### Frontend

1. **Pages** (`app/edge-ai/*`)
   - Server components using Next.js App Router
   - Consistent with existing AIAS page patterns
   - SEO-optimized metadata
   - Responsive design with Tailwind CSS

2. **Components** (to be created as needed)
   - Reusable UI components from `components/ui/`
   - Edge AI-specific components can be added to `components/edge-ai/`

## Data Flow

### Model Upload Flow

```
User → Frontend Upload → API Create Model → Database
                              ↓
                         Storage Upload
                              ↓
                         Update Model Path
```

### Optimization Flow

```
User → Create Job → API → Database (status: pending)
                          ↓
                    Job Queue → Worker
                          ↓
                    Process Optimization
                          ↓
                    Update Job (status: completed)
                          ↓
                    Create Artifacts
                          ↓
                    Webhook Notification
```

### Benchmark Flow

```
User → Create Benchmark → API → Database (status: pending)
                                  ↓
                            Job Queue → Worker
                                  ↓
                            Run Benchmark
                                  ↓
                            Update Results
                                  ↓
                            Webhook Notification
```

## Integration Points

### With Existing AIAS Systems

1. **Authentication**: Uses Supabase Auth (same as rest of platform)
2. **Multi-tenancy**: Supports `tenant_id` for organization-level isolation
3. **Telemetry**: Uses existing `track()` function for analytics
4. **Error Handling**: Uses centralized `handleApiError()` function
5. **Logging**: Uses structured logger from `lib/logging/`

### External Services (To Be Integrated)

1. **Storage Provider**: For model files and artifacts
   - Options: Supabase Storage, AWS S3, Google Cloud Storage
   - Need: Signed URL generation, file expiration

2. **Job Queue**: For background processing
   - Options: Bull/BullMQ, AWS SQS, Google Cloud Tasks
   - Need: Job scheduling, retry logic, progress tracking

3. **Model Optimization Engine**: For actual optimization
   - Options: ONNX Runtime, TensorFlow Lite Converter, Custom
   - Need: Format conversion, quantization, compression

## Security Model

### Row Level Security (RLS)

All tables have RLS policies ensuring:
- Users can only access their own data
- Device profile templates are readable by all
- System templates have `user_id = NULL` and `is_template = true`

### API Security

- All endpoints require authentication
- User ID is extracted from auth token
- Tenant isolation via `tenant_id` header/query param
- Input validation via Zod schemas
- File upload size limits (2GB max)

## Performance Optimizations

1. **Database Indexes**: On frequently queried columns (user_id, status, created_at)
2. **Pagination**: For large result sets (to be implemented)
3. **Caching**: For device profile templates (to be implemented)
4. **Background Processing**: All heavy operations in job queue
5. **Streaming Uploads**: For large model files (to be implemented)

## Scalability Considerations

1. **Horizontal Scaling**: Stateless API endpoints can scale horizontally
2. **Job Queue**: Can scale workers independently
3. **Storage**: Use object storage that scales automatically
4. **Database**: Use connection pooling, read replicas for queries

## Monitoring & Observability

1. **Telemetry**: All key actions tracked via `track()` function
2. **Logging**: Structured logging for debugging
3. **Error Tracking**: Centralized error handling and reporting
4. **Metrics**: Job success/failure rates, processing times (to be implemented)

## Testing Strategy

1. **Unit Tests**: For utility functions and type validations
2. **Integration Tests**: For API endpoints
3. **E2E Tests**: For complete user flows
4. **Load Tests**: For job queue and storage operations

## Deployment

1. **Migrations**: Run database migrations before deployment
2. **Environment Variables**: Configure storage and job queue connections
3. **Feature Flags**: Enable Edge AI features per environment
4. **Monitoring**: Set up alerts for job failures and errors
