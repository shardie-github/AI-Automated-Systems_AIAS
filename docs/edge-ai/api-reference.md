# Edge AI Accelerator Studio - API Reference

## Authentication

All endpoints require authentication. Include the auth token in one of these ways:

- **Header**: `Authorization: Bearer <token>`
- **Cookie**: `sb-access-token=<token>`

Optional tenant isolation:
- **Header**: `x-tenant-id: <tenant-id>`
- **Query**: `?tenant_id=<tenant-id>`

## Models API

### List Models

```http
GET /api/edge/models
```

**Response:**
```json
{
  "models": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "ResNet-50",
      "description": "Image classification model",
      "original_format": "onnx",
      "original_size_bytes": 1024000,
      "status": "ready",
      "upload_progress": 100,
      "created_at": "2025-01-31T00:00:00Z",
      "updated_at": "2025-01-31T00:00:00Z"
    }
  ]
}
```

### Create Model

```http
POST /api/edge/models
Content-Type: application/json

{
  "name": "My Model",
  "description": "Optional description",
  "original_format": "onnx",
  "input_shape": {
    "batch": 1,
    "height": 224,
    "width": 224,
    "channels": 3
  },
  "output_shape": {
    "classes": 1000
  }
}
```

**Response:** `201 Created`
```json
{
  "model": {
    "id": "uuid",
    "name": "My Model",
    "status": "uploaded",
    "upload_progress": 0,
    ...
  }
}
```

### Get Model

```http
GET /api/edge/models/{id}
```

### Update Model

```http
PATCH /api/edge/models/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "status": "ready",
  "upload_progress": 100,
  "original_file_path": "path/to/model.onnx",
  "original_size_bytes": 1024000
}
```

### Delete Model

```http
DELETE /api/edge/models/{id}
```

**Response:** `200 OK`
```json
{
  "success": true
}
```

## Device Profiles API

### List Device Profiles

```http
GET /api/edge/device-profiles
```

Returns user's custom profiles plus system templates.

**Response:**
```json
{
  "profiles": [
    {
      "id": "uuid",
      "name": "NVIDIA Jetson Nano",
      "device_type": "jetson",
      "is_template": true,
      "cpu_cores": 4,
      "cpu_architecture": "arm64",
      "gpu_model": "Maxwell",
      "total_memory_mb": 4096,
      ...
    }
  ]
}
```

### Create Device Profile

```http
POST /api/edge/device-profiles
Content-Type: application/json

{
  "name": "My Custom Device",
  "device_type": "custom",
  "cpu_cores": 8,
  "cpu_architecture": "x86_64",
  "gpu_model": "NVIDIA RTX 3060",
  "total_memory_mb": 16384,
  "os_type": "linux",
  "runtime": "onnx_runtime"
}
```

## Optimization Jobs API

### List Optimization Jobs

```http
GET /api/edge/optimization-jobs
```

**Response:**
```json
{
  "jobs": [
    {
      "id": "uuid",
      "name": "ResNet-50 Optimization",
      "model_id": "uuid",
      "device_profile_id": "uuid",
      "target_format": "tflite",
      "quantization_type": "int8",
      "optimization_level": "balanced",
      "status": "completed",
      "progress": 100,
      "compression_ratio": 3.5,
      "edge_ai_models": {
        "id": "uuid",
        "name": "ResNet-50",
        "original_format": "onnx"
      },
      "edge_ai_device_profiles": {
        "id": "uuid",
        "name": "Jetson Nano",
        "device_type": "jetson"
      },
      ...
    }
  ]
}
```

### Create Optimization Job

```http
POST /api/edge/optimization-jobs
Content-Type: application/json

{
  "name": "Optimize ResNet-50",
  "description": "Optimize for Jetson Nano",
  "model_id": "uuid",
  "device_profile_id": "uuid",
  "target_format": "tflite",
  "quantization_type": "int8",
  "optimization_level": "balanced"
}
```

**Response:** `201 Created`
```json
{
  "job": {
    "id": "uuid",
    "status": "pending",
    "progress": 0,
    "queued_at": "2025-01-31T00:00:00Z",
    ...
  }
}
```

## Benchmarks API

### List Benchmark Runs

```http
GET /api/edge/benchmarks
```

**Response:**
```json
{
  "benchmarks": [
    {
      "id": "uuid",
      "name": "ResNet-50 Benchmark",
      "model_id": "uuid",
      "optimization_job_id": "uuid",
      "device_profile_id": "uuid",
      "status": "completed",
      "latency_ms": {
        "mean": 12.3,
        "median": 11.8,
        "p95": 15.2,
        "p99": 18.5
      },
      "throughput_ops_per_sec": 81.3,
      "memory_usage_mb": {
        "peak": 245,
        "average": 198
      },
      ...
    }
  ]
}
```

### Create Benchmark Run

```http
POST /api/edge/benchmarks
Content-Type: application/json

{
  "name": "Benchmark ResNet-50",
  "model_id": "uuid",
  "optimization_job_id": "uuid",
  "device_profile_id": "uuid",
  "batch_size": 1,
  "num_iterations": 100,
  "warmup_iterations": 10
}
```

## Artifacts API

### List Artifacts

```http
GET /api/edge/artifacts?artifact_type=sdk_scaffold&model_id=uuid
```

**Query Parameters:**
- `artifact_type` - Filter by type (optional)
- `model_id` - Filter by model (optional)
- `optimization_job_id` - Filter by job (optional)

**Response:**
```json
{
  "artifacts": [
    {
      "id": "uuid",
      "name": "TypeScript SDK",
      "artifact_type": "sdk_scaffold",
      "target_platform": "web",
      "target_language": "typescript",
      "file_size_bytes": 512000,
      "download_count": 5,
      ...
    }
  ]
}
```

### Download Artifact

```http
GET /api/edge/artifacts/{id}/download
```

**Response:** `200 OK`
```json
{
  "artifact": {
    "id": "uuid",
    "name": "TypeScript SDK",
    "file_path": "path/to/artifact.zip",
    "file_size_bytes": 512000,
    "mime_type": "application/zip"
    // In production: "download_url": "https://signed-url..."
  }
}
```

## Error Responses

All endpoints return standard error responses:

```json
{
  "error": "Error message",
  "details": {} // Optional, for validation errors
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Rate limiting may be applied. Check response headers:
- `X-RateLimit-Limit` - Request limit
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Reset time

## Webhooks (To Be Implemented)

Webhook notifications will be sent for:
- Optimization job completion
- Benchmark run completion
- Artifact generation completion

Configure webhooks via user settings or tenant settings.
