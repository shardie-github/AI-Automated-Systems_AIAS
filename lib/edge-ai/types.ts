/**
 * Edge AI Accelerator Studio - Type Definitions
 * Core types for models, devices, jobs, benchmarks, and artifacts
 */

export type EdgeAIModelFormat = 
  | 'onnx'
  | 'tflite'
  | 'gguf'
  | 'coreml'
  | 'tensorrt'
  | 'openvino'
  | 'ncnn'
  | 'other';

export type EdgeAIQuantizationType = 
  | 'int8'
  | 'int4'
  | 'fp8'
  | 'fp16'
  | 'fp32'
  | 'dynamic'
  | 'none';

export type EdgeAIDeviceType = 
  | 'ai_pc'
  | 'jetson'
  | 'android'
  | 'ios'
  | 'raspberry_pi'
  | 'edge_server'
  | 'mobile_npu'
  | 'custom';

export type EdgeAIJobStatus = 
  | 'pending'
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type EdgeAIArtifactType = 
  | 'optimized_model'
  | 'sdk_scaffold'
  | 'docker_image'
  | 'apk_module'
  | 'wasm_bundle'
  | 'deployment_template'
  | 'documentation';

export type OptimizationLevel = 'speed' | 'balanced' | 'size';

export interface EdgeAIModel {
  id: string;
  user_id: string;
  tenant_id?: string;
  name: string;
  description?: string;
  original_filename?: string;
  original_format: EdgeAIModelFormat;
  original_size_bytes?: number;
  original_file_path?: string;
  input_shape?: {
    batch?: number;
    height?: number;
    width?: number;
    channels?: number;
    [key: string]: unknown;
  };
  output_shape?: {
    [key: string]: unknown;
  };
  model_metadata?: Record<string, unknown>;
  status: 'uploaded' | 'analyzing' | 'ready' | 'archived';
  upload_progress: number;
  created_at: string;
  updated_at: string;
}

export interface EdgeAIDeviceProfile {
  id: string;
  user_id: string;
  tenant_id?: string;
  name: string;
  device_type: EdgeAIDeviceType;
  manufacturer?: string;
  model?: string;
  cpu_cores?: number;
  cpu_architecture?: string;
  gpu_model?: string;
  gpu_memory_mb?: number;
  npu_model?: string;
  npu_capabilities?: Record<string, unknown>;
  total_memory_mb?: number;
  storage_type?: string;
  os_type?: string;
  os_version?: string;
  runtime?: string;
  runtime_version?: string;
  max_power_watts?: number;
  thermal_constraints?: Record<string, unknown>;
  device_metadata?: Record<string, unknown>;
  is_template: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EdgeAIOptimizationJob {
  id: string;
  user_id: string;
  tenant_id?: string;
  name: string;
  description?: string;
  model_id: string;
  device_profile_id: string;
  target_format: EdgeAIModelFormat;
  quantization_type?: EdgeAIQuantizationType;
  optimization_level: OptimizationLevel;
  additional_config?: Record<string, unknown>;
  status: EdgeAIJobStatus;
  progress: number;
  error_message?: string;
  error_details?: Record<string, unknown>;
  optimized_model_path?: string;
  optimized_size_bytes?: number;
  compression_ratio?: number;
  queued_at?: string;
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number;
  created_at: string;
  updated_at: string;
}

export interface EdgeAIBenchmarkRun {
  id: string;
  user_id: string;
  tenant_id?: string;
  name: string;
  description?: string;
  model_id?: string;
  optimization_job_id?: string;
  device_profile_id: string;
  test_dataset_path?: string;
  batch_size: number;
  num_iterations: number;
  warmup_iterations: number;
  benchmark_config?: Record<string, unknown>;
  latency_ms?: {
    mean?: number;
    median?: number;
    p50?: number;
    p95?: number;
    p99?: number;
    min?: number;
    max?: number;
  };
  throughput_ops_per_sec?: number;
  memory_usage_mb?: {
    peak?: number;
    average?: number;
    baseline?: number;
  };
  cpu_utilization_percent?: number;
  gpu_utilization_percent?: number;
  npu_utilization_percent?: number;
  power_consumption_watts?: number;
  accuracy_metrics?: Record<string, number>;
  status: EdgeAIJobStatus;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number;
  created_at: string;
  updated_at: string;
}

export interface EdgeAIArtifact {
  id: string;
  user_id: string;
  tenant_id?: string;
  name: string;
  description?: string;
  artifact_type: EdgeAIArtifactType;
  model_id?: string;
  optimization_job_id?: string;
  device_profile_id?: string;
  file_path: string;
  file_size_bytes?: number;
  mime_type?: string;
  checksum_sha256?: string;
  target_platform?: string;
  target_language?: string;
  sdk_version?: string;
  download_count: number;
  last_downloaded_at?: string;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

// API Request/Response types
export interface CreateModelRequest {
  name: string;
  description?: string;
  original_format: EdgeAIModelFormat;
  input_shape?: EdgeAIModel['input_shape'];
  output_shape?: EdgeAIModel['output_shape'];
  model_metadata?: Record<string, unknown>;
}

export interface CreateDeviceProfileRequest {
  name: string;
  device_type: EdgeAIDeviceType;
  manufacturer?: string;
  model?: string;
  cpu_cores?: number;
  cpu_architecture?: string;
  gpu_model?: string;
  gpu_memory_mb?: number;
  npu_model?: string;
  npu_capabilities?: Record<string, unknown>;
  total_memory_mb?: number;
  storage_type?: string;
  os_type?: string;
  os_version?: string;
  runtime?: string;
  runtime_version?: string;
  max_power_watts?: number;
  thermal_constraints?: Record<string, unknown>;
  device_metadata?: Record<string, unknown>;
}

export interface CreateOptimizationJobRequest {
  name: string;
  description?: string;
  model_id: string;
  device_profile_id: string;
  target_format: EdgeAIModelFormat;
  quantization_type?: EdgeAIQuantizationType;
  optimization_level?: OptimizationLevel;
  additional_config?: Record<string, unknown>;
}

export interface CreateBenchmarkRunRequest {
  name: string;
  description?: string;
  model_id?: string;
  optimization_job_id?: string;
  device_profile_id: string;
  test_dataset_path?: string;
  batch_size?: number;
  num_iterations?: number;
  warmup_iterations?: number;
  benchmark_config?: Record<string, unknown>;
}
