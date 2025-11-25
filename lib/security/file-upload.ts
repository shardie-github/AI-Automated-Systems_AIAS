/**
 * Secure File Upload Handler
 * 
 * Implements comprehensive file upload security:
 * - File type validation (MIME type + extension)
 * - File size limits
 * - Filename sanitization
 * - Virus scanning (placeholder for future implementation)
 * - Secure storage location
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { logger } from '@/lib/logging/structured-logger';

export interface FileUploadConfig {
  maxSizeBytes: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  requireAuth: boolean;
  storageBucket: string;
  pathPrefix?: string;
}

export interface FileUploadResult {
  success: boolean;
  fileUrl?: string;
  filePath?: string;
  error?: string;
  fileId?: string;
}

// Default configuration
const DEFAULT_CONFIG: FileUploadConfig = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/json',
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt', '.csv', '.json'],
  requireAuth: true,
  storageBucket: env.storage.uploadBucket || 'public',
};

// MIME type to extension mapping
const MIME_TO_EXT: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
  'application/json': ['.json'],
};

/**
 * Sanitize filename to prevent directory traversal and other attacks
 */
export function sanitizeFilename(filename: string): string {
  // Remove path components
  const basename = filename.split('/').pop() || filename;
  
  // Remove null bytes
  const cleaned = basename.replace(/\0/g, '');
  
  // Remove special characters except dots, dashes, underscores
  const sanitized = cleaned.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Limit length
  const maxLength = 255;
  const truncated = sanitized.length > maxLength 
    ? sanitized.substring(0, maxLength)
    : sanitized;
  
  // Ensure it doesn't start/end with dot or dash
  return truncated.replace(/^[.-]+|[.-]+$/g, '') || 'file';
}

/**
 * Validate file type by MIME type and extension
 */
export function validateFileType(
  mimeType: string,
  filename: string,
  config: FileUploadConfig
): { valid: boolean; error?: string } {
  // Check MIME type
  if (!config.allowedMimeTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${config.allowedMimeTypes.join(', ')}`,
    };
  }
  
  // Check extension
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  if (!config.allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File extension not allowed. Allowed extensions: ${config.allowedExtensions.join(', ')}`,
    };
  }
  
  // Verify MIME type matches extension
  const expectedExtensions = MIME_TO_EXT[mimeType] || [];
  if (expectedExtensions.length > 0 && !expectedExtensions.includes(extension)) {
    return {
      valid: false,
      error: 'File MIME type does not match file extension',
    };
  }
  
  return { valid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(
  sizeBytes: number,
  config: FileUploadConfig
): { valid: boolean; error?: string } {
  if (sizeBytes > config.maxSizeBytes) {
    const maxSizeMB = (config.maxSizeBytes / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
    };
  }
  
  if (sizeBytes === 0) {
    return {
      valid: false,
      error: 'File is empty',
    };
  }
  
  return { valid: true };
}

/**
 * Scan file for malicious content (placeholder for future implementation)
 */
export async function scanFileForMalware(
  buffer: Buffer,
  filename: string
): Promise<{ safe: boolean; error?: string }> {
  // TODO: Integrate with virus scanning service (ClamAV, VirusTotal API, etc.)
  // For now, perform basic checks
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
    /eval\(/i,
  ];
  
  const content = buffer.toString('utf-8', 0, Math.min(buffer.length, 1024));
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(content)) {
      logger.warn('Suspicious content detected in file', {
        filename,
        pattern: pattern.toString(),
      });
      return {
        safe: false,
        error: 'File contains potentially malicious content',
      };
    }
  }
  
  return { safe: true };
}

/**
 * Upload file securely to Supabase Storage
 */
export async function uploadFileSecure(
  file: File | Buffer,
  filename: string,
  userId: string,
  config: Partial<FileUploadConfig> = {}
): Promise<FileUploadResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  try {
    // Get file metadata
    const isFile = file instanceof File;
    const size = isFile ? file.size : file.length;
    const mimeType = isFile ? file.type : 'application/octet-stream';
    const originalFilename = isFile ? file.name : filename;
    
    // Validate file size
    const sizeValidation = validateFileSize(size, finalConfig);
    if (!sizeValidation.valid) {
      return {
        success: false,
        error: sizeValidation.error,
      };
    }
    
    // Validate file type
    const typeValidation = validateFileType(mimeType, originalFilename, finalConfig);
    if (!typeValidation.valid) {
      return {
        success: false,
        error: typeValidation.error,
      };
    }
    
    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(originalFilename);
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = sanitizedFilename.substring(sanitizedFilename.lastIndexOf('.'));
    const uniqueFilename = `${timestamp}-${randomId}${fileExtension}`;
    
    // Build storage path
    const pathPrefix = finalConfig.pathPrefix || 'uploads';
    const storagePath = `${pathPrefix}/${userId}/${uniqueFilename}`;
    
    // Convert File to Buffer if needed
    let fileBuffer: Buffer;
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else {
      fileBuffer = file;
    }
    
    // Scan for malware
    const scanResult = await scanFileForMalware(fileBuffer, sanitizedFilename);
    if (!scanResult.safe) {
      return {
        success: false,
        error: scanResult.error || 'File failed security scan',
      };
    }
    
    // Upload to Supabase Storage
    const supabase = createClient(
      env.supabase.url,
      env.supabase.serviceRoleKey
    );
    
    const { data, error } = await supabase.storage
      .from(finalConfig.storageBucket)
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: false,
        cacheControl: '3600',
      });
    
    if (error) {
      logger.error('File upload failed', error, {
        filename: sanitizedFilename,
        storagePath,
        userId,
      });
      return {
        success: false,
        error: `Upload failed: ${error.message}`,
      };
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(finalConfig.storageBucket)
      .getPublicUrl(storagePath);
    
    logger.info('File uploaded successfully', {
      filename: sanitizedFilename,
      storagePath,
      userId,
      size,
      mimeType,
    });
    
    return {
      success: true,
      fileUrl: urlData.publicUrl,
      filePath: storagePath,
      fileId: data.id || uniqueFilename,
    };
  } catch (error) {
    logger.error('File upload error', error instanceof Error ? error : new Error(String(error)), {
      filename,
      userId,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFileSecure(
  filePath: string,
  bucket: string = env.storage.uploadBucket || 'public'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient(
      env.supabase.url,
      env.supabase.serviceRoleKey
    );
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
    
    if (error) {
      logger.error('File deletion failed', error, {
        filePath,
        bucket,
      });
      return {
        success: false,
        error: error.message,
      };
    }
    
    return { success: true };
  } catch (error) {
    logger.error('File deletion error', error instanceof Error ? error : new Error(String(error)), {
      filePath,
      bucket,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
