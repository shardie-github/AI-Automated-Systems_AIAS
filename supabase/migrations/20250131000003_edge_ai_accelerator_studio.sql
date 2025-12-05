-- ============================================================================
-- EDGE AI ACCELERATOR STUDIO MIGRATION
-- ============================================================================
-- This migration creates all tables and structures needed for the Edge AI
-- Accelerator Studio module, including models, optimization jobs, benchmarks,
-- device profiles, and downloadable artifacts.
--
-- Generated: 2025-01-31
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE edge_ai_model_format AS ENUM (
  'onnx',
  'tflite',
  'gguf',
  'coreml',
  'tensorrt',
  'openvino',
  'ncnn',
  'other'
);

CREATE TYPE edge_ai_quantization_type AS ENUM (
  'int8',
  'int4',
  'fp8',
  'fp16',
  'fp32',
  'dynamic',
  'none'
);

CREATE TYPE edge_ai_device_type AS ENUM (
  'ai_pc',
  'jetson',
  'android',
  'ios',
  'raspberry_pi',
  'edge_server',
  'mobile_npu',
  'custom'
);

CREATE TYPE edge_ai_job_status AS ENUM (
  'pending',
  'queued',
  'running',
  'completed',
  'failed',
  'cancelled'
);

CREATE TYPE edge_ai_artifact_type AS ENUM (
  'optimized_model',
  'sdk_scaffold',
  'docker_image',
  'apk_module',
  'wasm_bundle',
  'deployment_template',
  'documentation'
);

-- ============================================================================
-- EDGE AI MODELS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.edge_ai_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Model metadata
  name text NOT NULL,
  description text,
  original_filename text,
  original_format edge_ai_model_format NOT NULL,
  original_size_bytes bigint,
  original_file_path text, -- Storage path for original model
  
  -- Model configuration
  input_shape jsonb, -- e.g., {"batch": 1, "height": 224, "width": 224, "channels": 3}
  output_shape jsonb,
  model_metadata jsonb DEFAULT '{}'::jsonb, -- Additional model info (layers, ops, etc.)
  
  -- Status and tracking
  status text DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'analyzing', 'ready', 'archived')),
  upload_progress integer DEFAULT 0 CHECK (upload_progress >= 0 AND upload_progress <= 100),
  
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  
  CONSTRAINT edge_ai_models_name_check CHECK (char_length(name) >= 1 AND char_length(name) <= 255)
);

-- Indexes for edge_ai_models
CREATE INDEX idx_edge_ai_models_user_id ON public.edge_ai_models(user_id);
CREATE INDEX idx_edge_ai_models_tenant_id ON public.edge_ai_models(tenant_id);
CREATE INDEX idx_edge_ai_models_status ON public.edge_ai_models(status);
CREATE INDEX idx_edge_ai_models_created_at ON public.edge_ai_models(created_at DESC);

-- ============================================================================
-- DEVICE PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.edge_ai_device_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Device identification
  name text NOT NULL,
  device_type edge_ai_device_type NOT NULL,
  manufacturer text,
  model text,
  
  -- Hardware capabilities
  cpu_cores integer,
  cpu_architecture text, -- e.g., "arm64", "x86_64"
  gpu_model text,
  gpu_memory_mb integer,
  npu_model text,
  npu_capabilities jsonb DEFAULT '{}'::jsonb,
  total_memory_mb integer,
  storage_type text, -- e.g., "emmc", "nvme", "sd"
  
  -- Software environment
  os_type text, -- e.g., "linux", "android", "ios"
  os_version text,
  runtime text, -- e.g., "tensorflow_lite", "onnx_runtime", "ncnn"
  runtime_version text,
  
  -- Performance characteristics
  max_power_watts decimal(5,2),
  thermal_constraints jsonb DEFAULT '{}'::jsonb,
  
  -- Additional metadata
  device_metadata jsonb DEFAULT '{}'::jsonb,
  is_template boolean DEFAULT false, -- System-provided templates
  is_active boolean DEFAULT true,
  
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  
  CONSTRAINT edge_ai_device_profiles_name_check CHECK (char_length(name) >= 1 AND char_length(name) <= 255)
);

-- Indexes for device profiles
CREATE INDEX idx_edge_ai_device_profiles_user_id ON public.edge_ai_device_profiles(user_id);
CREATE INDEX idx_edge_ai_device_profiles_tenant_id ON public.edge_ai_device_profiles(tenant_id);
CREATE INDEX idx_edge_ai_device_profiles_device_type ON public.edge_ai_device_profiles(device_type);
CREATE INDEX idx_edge_ai_device_profiles_is_template ON public.edge_ai_device_profiles(is_template);

-- ============================================================================
-- OPTIMIZATION JOBS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.edge_ai_optimization_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Job identification
  name text NOT NULL,
  description text,
  
  -- References
  model_id uuid NOT NULL REFERENCES public.edge_ai_models(id) ON DELETE CASCADE,
  device_profile_id uuid NOT NULL REFERENCES public.edge_ai_device_profiles(id) ON DELETE CASCADE,
  
  -- Optimization configuration
  target_format edge_ai_model_format NOT NULL,
  quantization_type edge_ai_quantization_type,
  optimization_level text DEFAULT 'balanced' CHECK (optimization_level IN ('speed', 'balanced', 'size')),
  additional_config jsonb DEFAULT '{}'::jsonb,
  
  -- Job status
  status edge_ai_job_status DEFAULT 'pending',
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  error_message text,
  error_details jsonb,
  
  -- Results
  optimized_model_path text, -- Storage path for optimized model
  optimized_size_bytes bigint,
  compression_ratio decimal(5,2), -- Original size / Optimized size
  
  -- Timing
  queued_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  duration_seconds integer,
  
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  
  CONSTRAINT edge_ai_optimization_jobs_name_check CHECK (char_length(name) >= 1 AND char_length(name) <= 255)
);

-- Indexes for optimization jobs
CREATE INDEX idx_edge_ai_optimization_jobs_user_id ON public.edge_ai_optimization_jobs(user_id);
CREATE INDEX idx_edge_ai_optimization_jobs_tenant_id ON public.edge_ai_optimization_jobs(tenant_id);
CREATE INDEX idx_edge_ai_optimization_jobs_model_id ON public.edge_ai_optimization_jobs(model_id);
CREATE INDEX idx_edge_ai_optimization_jobs_device_profile_id ON public.edge_ai_optimization_jobs(device_profile_id);
CREATE INDEX idx_edge_ai_optimization_jobs_status ON public.edge_ai_optimization_jobs(status);
CREATE INDEX idx_edge_ai_optimization_jobs_created_at ON public.edge_ai_optimization_jobs(created_at DESC);

-- ============================================================================
-- BENCHMARK RUNS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.edge_ai_benchmark_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Benchmark identification
  name text NOT NULL,
  description text,
  
  -- References
  model_id uuid REFERENCES public.edge_ai_models(id) ON DELETE CASCADE,
  optimization_job_id uuid REFERENCES public.edge_ai_optimization_jobs(id) ON DELETE CASCADE,
  device_profile_id uuid NOT NULL REFERENCES public.edge_ai_device_profiles(id) ON DELETE CASCADE,
  
  -- Benchmark configuration
  test_dataset_path text, -- Optional path to test dataset
  batch_size integer DEFAULT 1,
  num_iterations integer DEFAULT 100,
  warmup_iterations integer DEFAULT 10,
  benchmark_config jsonb DEFAULT '{}'::jsonb,
  
  -- Results
  latency_ms jsonb, -- Statistics: {mean, median, p50, p95, p99, min, max}
  throughput_ops_per_sec decimal(10,2),
  memory_usage_mb jsonb, -- {peak, average, baseline}
  cpu_utilization_percent decimal(5,2),
  gpu_utilization_percent decimal(5,2),
  npu_utilization_percent decimal(5,2),
  power_consumption_watts decimal(5,2),
  
  -- Accuracy metrics (if applicable)
  accuracy_metrics jsonb DEFAULT '{}'::jsonb, -- e.g., {"top1": 0.95, "top5": 0.98}
  
  -- Status
  status edge_ai_job_status DEFAULT 'pending',
  error_message text,
  
  -- Timing
  started_at timestamptz,
  completed_at timestamptz,
  duration_seconds integer,
  
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  
  CONSTRAINT edge_ai_benchmark_runs_name_check CHECK (char_length(name) >= 1 AND char_length(name) <= 255),
  CONSTRAINT edge_ai_benchmark_runs_batch_size_check CHECK (batch_size > 0),
  CONSTRAINT edge_ai_benchmark_runs_num_iterations_check CHECK (num_iterations > 0)
);

-- Indexes for benchmark runs
CREATE INDEX idx_edge_ai_benchmark_runs_user_id ON public.edge_ai_benchmark_runs(user_id);
CREATE INDEX idx_edge_ai_benchmark_runs_tenant_id ON public.edge_ai_benchmark_runs(tenant_id);
CREATE INDEX idx_edge_ai_benchmark_runs_model_id ON public.edge_ai_benchmark_runs(model_id);
CREATE INDEX idx_edge_ai_benchmark_runs_optimization_job_id ON public.edge_ai_benchmark_runs(optimization_job_id);
CREATE INDEX idx_edge_ai_benchmark_runs_device_profile_id ON public.edge_ai_benchmark_runs(device_profile_id);
CREATE INDEX idx_edge_ai_benchmark_runs_status ON public.edge_ai_benchmark_runs(status);
CREATE INDEX idx_edge_ai_benchmark_runs_created_at ON public.edge_ai_benchmark_runs(created_at DESC);

-- ============================================================================
-- ARTIFACTS TABLE (Downloadable bundles, SDKs, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.edge_ai_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Artifact identification
  name text NOT NULL,
  description text,
  artifact_type edge_ai_artifact_type NOT NULL,
  
  -- References
  model_id uuid REFERENCES public.edge_ai_models(id) ON DELETE CASCADE,
  optimization_job_id uuid REFERENCES public.edge_ai_optimization_jobs(id) ON DELETE CASCADE,
  device_profile_id uuid REFERENCES public.edge_ai_device_profiles(id) ON DELETE CASCADE,
  
  -- Artifact metadata
  file_path text NOT NULL, -- Storage path
  file_size_bytes bigint,
  mime_type text,
  checksum_sha256 text,
  
  -- Platform/language specific
  target_platform text, -- e.g., "android", "ios", "linux", "web"
  target_language text, -- e.g., "typescript", "python", "java", "swift"
  sdk_version text,
  
  -- Download tracking
  download_count integer DEFAULT 0,
  last_downloaded_at timestamptz,
  
  -- Status
  is_active boolean DEFAULT true,
  expires_at timestamptz, -- Optional expiration for temporary artifacts
  
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  
  CONSTRAINT edge_ai_artifacts_name_check CHECK (char_length(name) >= 1 AND char_length(name) <= 255)
);

-- Indexes for artifacts
CREATE INDEX idx_edge_ai_artifacts_user_id ON public.edge_ai_artifacts(user_id);
CREATE INDEX idx_edge_ai_artifacts_tenant_id ON public.edge_ai_artifacts(tenant_id);
CREATE INDEX idx_edge_ai_artifacts_model_id ON public.edge_ai_artifacts(model_id);
CREATE INDEX idx_edge_ai_artifacts_optimization_job_id ON public.edge_ai_artifacts(optimization_job_id);
CREATE INDEX idx_edge_ai_artifacts_artifact_type ON public.edge_ai_artifacts(artifact_type);
CREATE INDEX idx_edge_ai_artifacts_target_platform ON public.edge_ai_artifacts(target_platform);
CREATE INDEX idx_edge_ai_artifacts_is_active ON public.edge_ai_artifacts(is_active);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_edge_ai_models_updated_at
  BEFORE UPDATE ON public.edge_ai_models
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_edge_ai_device_profiles_updated_at
  BEFORE UPDATE ON public.edge_ai_device_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_edge_ai_optimization_jobs_updated_at
  BEFORE UPDATE ON public.edge_ai_optimization_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_edge_ai_benchmark_runs_updated_at
  BEFORE UPDATE ON public.edge_ai_benchmark_runs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_edge_ai_artifacts_updated_at
  BEFORE UPDATE ON public.edge_ai_artifacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.edge_ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edge_ai_device_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edge_ai_optimization_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edge_ai_benchmark_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edge_ai_artifacts ENABLE ROW LEVEL SECURITY;

-- Policies for edge_ai_models
CREATE POLICY "Users can view their own models"
  ON public.edge_ai_models FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own models"
  ON public.edge_ai_models FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own models"
  ON public.edge_ai_models FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own models"
  ON public.edge_ai_models FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for edge_ai_device_profiles
CREATE POLICY "Users can view their own device profiles and templates"
  ON public.edge_ai_device_profiles FOR SELECT
  USING (auth.uid() = user_id OR is_template = true);

CREATE POLICY "Users can insert their own device profiles"
  ON public.edge_ai_device_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_template = false);

CREATE POLICY "Users can update their own device profiles"
  ON public.edge_ai_device_profiles FOR UPDATE
  USING (auth.uid() = user_id AND is_template = false)
  WITH CHECK (auth.uid() = user_id AND is_template = false);

CREATE POLICY "Users can delete their own device profiles"
  ON public.edge_ai_device_profiles FOR DELETE
  USING (auth.uid() = user_id AND is_template = false);

-- Policies for edge_ai_optimization_jobs
CREATE POLICY "Users can view their own optimization jobs"
  ON public.edge_ai_optimization_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own optimization jobs"
  ON public.edge_ai_optimization_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own optimization jobs"
  ON public.edge_ai_optimization_jobs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own optimization jobs"
  ON public.edge_ai_optimization_jobs FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for edge_ai_benchmark_runs
CREATE POLICY "Users can view their own benchmark runs"
  ON public.edge_ai_benchmark_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own benchmark runs"
  ON public.edge_ai_benchmark_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own benchmark runs"
  ON public.edge_ai_benchmark_runs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own benchmark runs"
  ON public.edge_ai_benchmark_runs FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for edge_ai_artifacts
CREATE POLICY "Users can view their own artifacts"
  ON public.edge_ai_artifacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own artifacts"
  ON public.edge_ai_artifacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own artifacts"
  ON public.edge_ai_artifacts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own artifacts"
  ON public.edge_ai_artifacts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- SEED DATA: Default Device Profile Templates
-- ============================================================================

-- Insert common device profile templates (these are system-wide, not user-specific)
INSERT INTO public.edge_ai_device_profiles (
  id,
  user_id, -- NULL for templates, but we'll use a system user ID pattern
  name,
  device_type,
  manufacturer,
  model,
  cpu_cores,
  cpu_architecture,
  gpu_model,
  npu_model,
  total_memory_mb,
  os_type,
  runtime,
  is_template,
  is_active
) VALUES
  (
    gen_random_uuid(),
    NULL, -- System template
    'NVIDIA Jetson Nano',
    'jetson',
    'NVIDIA',
    'Jetson Nano',
    4,
    'arm64',
    'Maxwell',
    'Tensor Core',
    4096,
    'linux',
    'tensorrt',
    true,
    true
  ),
  (
    gen_random_uuid(),
    NULL,
    'NVIDIA Jetson Xavier NX',
    'jetson',
    'NVIDIA',
    'Jetson Xavier NX',
    6,
    'arm64',
    'Volta',
    'Tensor Core',
    8192,
    'linux',
    'tensorrt',
    true,
    true
  ),
  (
    gen_random_uuid(),
    NULL,
    'Android Phone (Generic)',
    'android',
    'Generic',
    'Android Phone',
    8,
    'arm64',
    'Adreno',
    'Qualcomm Hexagon',
    6144,
    'android',
    'tensorflow_lite',
    true,
    true
  ),
  (
    gen_random_uuid(),
    NULL,
    'AI PC (Intel Core Ultra)',
    'ai_pc',
    'Intel',
    'Core Ultra with NPU',
    16,
    'x86_64',
    'Intel Arc',
    'Intel NPU',
    16384,
    'linux',
    'onnx_runtime',
    true,
    true
  ),
  (
    gen_random_uuid(),
    NULL,
    'Raspberry Pi 4',
    'raspberry_pi',
    'Raspberry Pi Foundation',
    'Raspberry Pi 4',
    4,
    'arm64',
    NULL,
    NULL,
    4096,
    'linux',
    'tensorflow_lite',
    true,
    true
  )
ON CONFLICT DO NOTHING;

-- Note: For templates, we need to adjust RLS policy to allow viewing templates
-- even when user_id is NULL. Let's update the policy:
DROP POLICY IF EXISTS "Users can view their own device profiles and templates" ON public.edge_ai_device_profiles;
CREATE POLICY "Users can view their own device profiles and templates"
  ON public.edge_ai_device_profiles FOR SELECT
  USING (auth.uid() = user_id OR is_template = true OR user_id IS NULL);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.edge_ai_models IS 'Stores uploaded AI models for edge optimization';
COMMENT ON TABLE public.edge_ai_device_profiles IS 'Device capability profiles for target deployment platforms';
COMMENT ON TABLE public.edge_ai_optimization_jobs IS 'Model optimization jobs with quantization and format conversion';
COMMENT ON TABLE public.edge_ai_benchmark_runs IS 'Performance benchmark results for optimized models';
COMMENT ON TABLE public.edge_ai_artifacts IS 'Downloadable artifacts: optimized models, SDKs, deployment bundles';

COMMENT ON COLUMN public.edge_ai_models.input_shape IS 'JSON object describing model input dimensions';
COMMENT ON COLUMN public.edge_ai_models.output_shape IS 'JSON object describing model output dimensions';
COMMENT ON COLUMN public.edge_ai_device_profiles.npu_capabilities IS 'JSON object with NPU-specific capabilities and constraints';
COMMENT ON COLUMN public.edge_ai_optimization_jobs.compression_ratio IS 'Ratio of original size to optimized size (higher = better compression)';
COMMENT ON COLUMN public.edge_ai_benchmark_runs.latency_ms IS 'JSON object with latency statistics: {mean, median, p50, p95, p99, min, max}';
COMMENT ON COLUMN public.edge_ai_artifacts.target_platform IS 'Target deployment platform (android, ios, linux, web, etc.)';
COMMENT ON COLUMN public.edge_ai_artifacts.target_language IS 'Programming language for SDK scaffolds (typescript, python, java, swift, etc.)';
