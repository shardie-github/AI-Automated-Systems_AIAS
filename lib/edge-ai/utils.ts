/**
 * Edge AI Accelerator Studio - Utility Functions
 * Helper functions for device detection, format validation, and common operations
 */

import type {
  EdgeAIModelFormat,
  EdgeAIDeviceType,
  EdgeAIQuantizationType,
  OptimizationLevel,
} from './types';

/**
 * Validate model format string
 */
export function isValidModelFormat(format: string): format is EdgeAIModelFormat {
  const validFormats: EdgeAIModelFormat[] = [
    'onnx',
    'tflite',
    'gguf',
    'coreml',
    'tensorrt',
    'openvino',
    'ncnn',
    'other',
  ];
  return validFormats.includes(format as EdgeAIModelFormat);
}

/**
 * Validate device type string
 */
export function isValidDeviceType(type: string): type is EdgeAIDeviceType {
  const validTypes: EdgeAIDeviceType[] = [
    'ai_pc',
    'jetson',
    'android',
    'ios',
    'raspberry_pi',
    'edge_server',
    'mobile_npu',
    'custom',
  ];
  return validTypes.includes(type as EdgeAIDeviceType);
}

/**
 * Get human-readable format name
 */
export function getFormatDisplayName(format: EdgeAIModelFormat): string {
  const names: Record<EdgeAIModelFormat, string> = {
    onnx: 'ONNX',
    tflite: 'TensorFlow Lite',
    gguf: 'GGUF (GGML)',
    coreml: 'Core ML',
    tensorrt: 'TensorRT',
    openvino: 'OpenVINO',
    ncnn: 'NCNN',
    other: 'Other',
  };
  return names[format] || format;
}

/**
 * Get human-readable device type name
 */
export function getDeviceTypeDisplayName(type: EdgeAIDeviceType): string {
  const names: Record<EdgeAIDeviceType, string> = {
    ai_pc: 'AI PC',
    jetson: 'NVIDIA Jetson',
    android: 'Android',
    ios: 'iOS',
    raspberry_pi: 'Raspberry Pi',
    edge_server: 'Edge Server',
    mobile_npu: 'Mobile NPU',
    custom: 'Custom Device',
  };
  return names[type] || type;
}

/**
 * Get recommended quantization for device type
 */
export function getRecommendedQuantization(
  deviceType: EdgeAIDeviceType
): EdgeAIQuantizationType {
  const recommendations: Record<EdgeAIDeviceType, EdgeAIQuantizationType> = {
    ai_pc: 'int8',
    jetson: 'int8',
    android: 'int8',
    ios: 'int8',
    raspberry_pi: 'int8',
    edge_server: 'fp16',
    mobile_npu: 'int8',
    custom: 'int8',
  };
  return recommendations[deviceType] || 'int8';
}

/**
 * Get recommended optimization level for device type
 */
export function getRecommendedOptimizationLevel(
  deviceType: EdgeAIDeviceType
): OptimizationLevel {
  const recommendations: Record<EdgeAIDeviceType, OptimizationLevel> = {
    ai_pc: 'balanced',
    jetson: 'speed',
    android: 'balanced',
    ios: 'balanced',
    raspberry_pi: 'size',
    edge_server: 'speed',
    mobile_npu: 'balanced',
    custom: 'balanced',
  };
  return recommendations[deviceType] || 'balanced';
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
}

/**
 * Calculate compression ratio percentage
 */
export function calculateCompressionRatio(
  originalSize: number,
  optimizedSize: number
): number {
  if (originalSize === 0) return 0;
  return (1 - optimizedSize / originalSize) * 100;
}

/**
 * Get status badge color/variant
 */
export function getStatusColor(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed':
      return 'default';
    case 'running':
    case 'queued':
      return 'secondary';
    case 'failed':
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
}

/**
 * Check if device profile is compatible with model format
 */
export function isFormatCompatibleWithDevice(
  format: EdgeAIModelFormat,
  deviceType: EdgeAIDeviceType,
  runtime?: string
): boolean {
  // Basic compatibility matrix
  const compatibility: Record<EdgeAIModelFormat, EdgeAIDeviceType[]> = {
    onnx: ['ai_pc', 'jetson', 'android', 'ios', 'edge_server'],
    tflite: ['android', 'ios', 'raspberry_pi', 'mobile_npu'],
    gguf: ['ai_pc', 'edge_server'],
    coreml: ['ios', 'ai_pc'],
    tensorrt: ['jetson', 'ai_pc', 'edge_server'],
    openvino: ['ai_pc', 'edge_server'],
    ncnn: ['android', 'ios', 'mobile_npu'],
    other: ['ai_pc', 'jetson', 'android', 'ios', 'raspberry_pi', 'edge_server', 'mobile_npu', 'custom'],
  };

  return compatibility[format]?.includes(deviceType) ?? true;
}

/**
 * Get supported formats for device type
 */
export function getSupportedFormatsForDevice(
  deviceType: EdgeAIDeviceType
): EdgeAIModelFormat[] {
  const supported: Record<EdgeAIDeviceType, EdgeAIModelFormat[]> = {
    ai_pc: ['onnx', 'tensorrt', 'openvino', 'gguf', 'coreml'],
    jetson: ['onnx', 'tensorrt'],
    android: ['tflite', 'onnx', 'ncnn'],
    ios: ['coreml', 'tflite', 'onnx'],
    raspberry_pi: ['tflite', 'onnx'],
    edge_server: ['onnx', 'tensorrt', 'openvino', 'gguf'],
    mobile_npu: ['tflite', 'ncnn'],
    custom: ['onnx', 'tflite', 'gguf', 'other'],
  };
  return supported[deviceType] || ['onnx', 'tflite'];
}

/**
 * Validate file extension matches format
 */
export function validateFileExtension(
  filename: string,
  format: EdgeAIModelFormat
): boolean {
  const extensions: Record<EdgeAIModelFormat, string[]> = {
    onnx: ['.onnx'],
    tflite: ['.tflite'],
    gguf: ['.gguf'],
    coreml: ['.mlmodel', '.mlpackage'],
    tensorrt: ['.trt', '.engine'],
    openvino: ['.xml', '.bin'],
    ncnn: ['.param', '.bin'],
    other: [],
  };

  const validExtensions = extensions[format] || [];
  if (validExtensions.length === 0) return true; // 'other' format accepts any extension

  const fileExt = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return validExtensions.some((ext) => fileExt === ext);
}
