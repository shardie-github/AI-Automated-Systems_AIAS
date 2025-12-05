# Edge AI Accelerator Studio

## Overview

The Edge AI Accelerator Studio is a comprehensive platform for optimizing and deploying AI models at the edge. It enables users to:

- Upload and manage AI models in various formats (ONNX, TensorFlow Lite, GGUF, CoreML, TensorRT, OpenVINO, NCNN)
- Optimize models through quantization (INT8, INT4, FP8, FP16) and format conversion
- Profile device capabilities and create custom device profiles
- Benchmark optimized models for latency, throughput, and resource utilization
- Export deployment-ready bundles, SDKs, and templates

## Architecture

### Database Schema

The Edge AI module uses the following tables:

- `edge_ai_models` - Stores uploaded models and metadata
- `edge_ai_device_profiles` - Device capability profiles (user-created and system templates)
- `edge_ai_optimization_jobs` - Model optimization job queue and status
- `edge_ai_benchmark_runs` - Performance benchmark results
- `edge_ai_artifacts` - Downloadable bundles, SDKs, and deployment templates

See `supabase/migrations/20250131000003_edge_ai_accelerator_studio.sql` for the complete schema.

### API Endpoints

All Edge AI endpoints are under `/api/edge/*`:

- `GET /api/edge/models` - List user's models
- `POST /api/edge/models` - Create new model entry
- `GET /api/edge/models/[id]` - Get model details
- `PATCH /api/edge/models/[id]` - Update model
- `DELETE /api/edge/models/[id]` - Delete model

- `GET /api/edge/device-profiles` - List device profiles (user's + templates)
- `POST /api/edge/device-profiles` - Create custom device profile

- `GET /api/edge/optimization-jobs` - List optimization jobs
- `POST /api/edge/optimization-jobs` - Create optimization job

- `GET /api/edge/benchmarks` - List benchmark runs
- `POST /api/edge/benchmarks` - Create benchmark run

- `GET /api/edge/artifacts` - List available artifacts
- `GET /api/edge/artifacts/[id]/download` - Download artifact

### Frontend Pages

- `/edge-ai` - Overview and landing page
- `/edge-ai/accelerator-studio` - Deep-dive product page
- `/edge-ai/models` - Model upload and management
- `/edge-ai/benchmarks` - Benchmark history and results
- `/edge-ai/device-analyzer` - Device profiling UI
- `/edge-ai/sdk-export` - Export area for bundles and SDKs
- `/edge-ai/services` - Edge AI consulting services

## Getting Started

### For Developers

1. **Database Setup**: Run the migration:
   ```bash
   npm run db:migrate
   ```

2. **API Usage**: All endpoints require authentication. Include the auth token in the `Authorization` header or as a cookie.

3. **Model Upload Flow**:
   - Create a model entry via `POST /api/edge/models`
   - Upload the model file to storage (implementation depends on your storage provider)
   - Update the model with file path via `PATCH /api/edge/models/[id]`

4. **Optimization Job Flow**:
   - Create an optimization job via `POST /api/edge/optimization-jobs`
   - The job will be queued for background processing (integrate with your job queue system)
   - Poll job status or use webhooks for completion notifications

### For Users

1. Navigate to `/edge-ai` to explore the platform
2. Upload your first model at `/edge-ai/models`
3. Create or select a device profile at `/edge-ai/device-analyzer`
4. Create an optimization job to optimize your model
5. Run benchmarks to verify performance
6. Download optimized bundles and SDKs from `/edge-ai/sdk-export`

## Type Definitions

All TypeScript types are defined in `lib/edge-ai/types.ts`:

- `EdgeAIModel` - Model metadata and status
- `EdgeAIDeviceProfile` - Device capabilities and configuration
- `EdgeAIOptimizationJob` - Optimization job status and results
- `EdgeAIBenchmarkRun` - Benchmark metrics and results
- `EdgeAIArtifact` - Downloadable artifact metadata

## Utility Functions

Helper functions in `lib/edge-ai/utils.ts`:

- `isValidModelFormat()` - Validate model format strings
- `isValidDeviceType()` - Validate device type strings
- `getFormatDisplayName()` - Human-readable format names
- `getDeviceTypeDisplayName()` - Human-readable device type names
- `getRecommendedQuantization()` - Get recommended quantization for device
- `getRecommendedOptimizationLevel()` - Get recommended optimization level
- `formatFileSize()` - Format bytes to human-readable size
- `formatDuration()` - Format seconds to human-readable duration
- `isFormatCompatibleWithDevice()` - Check format-device compatibility

## Integration Points

### Job Queue Integration

Optimization and benchmark jobs should be processed asynchronously. Integrate with your job queue system (e.g., Bull, BullMQ, AWS SQS) to:

1. Queue jobs when created via API
2. Process optimization/benchmarking in background workers
3. Update job status and results in the database
4. Send webhook notifications on completion

### Storage Integration

Model files and artifacts need to be stored. Integrate with your storage provider (e.g., S3, GCS, Supabase Storage) to:

1. Upload model files and store paths in database
2. Generate signed URLs for artifact downloads
3. Implement file expiration and cleanup policies

### Feature Flags

Edge AI features can be gated by subscription plans. Use the existing feature flag system to:

1. Check user's subscription tier
2. Limit model uploads, optimization jobs, or benchmarks based on plan
3. Enable/disable features per user or tenant

## Security

- All endpoints require authentication
- Row Level Security (RLS) policies ensure users can only access their own data
- Device profile templates are readable by all authenticated users
- File uploads should be validated for size, type, and content

## Performance Considerations

- Model files can be large (up to 2GB). Use streaming uploads for better UX.
- Optimization jobs are CPU-intensive. Use background workers and job queues.
- Benchmark runs may take time. Provide progress updates and async processing.
- Artifact downloads should use signed URLs with expiration for security.

## Future Enhancements

- Real-time job progress updates via WebSockets
- Batch optimization for multiple models
- Model versioning and comparison
- Advanced quantization strategies (QAT, pruning)
- Multi-device benchmarking and comparison
- Integration with popular ML frameworks (PyTorch, TensorFlow)
- Automated accuracy validation
- Model marketplace for pre-optimized models

## Support

For questions or issues:
- Check the documentation in `/docs/edge-ai/`
- Contact support via `/help`
- Schedule a consultation via `/demo`
