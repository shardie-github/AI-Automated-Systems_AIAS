/**
 * Vercel Blob Storage Utility
 * 
 * Provides a unified interface for file storage using Vercel Blob.
 * Can be used alongside or as an alternative to Supabase Storage.
 * 
 * Setup:
 * 1. Create a Vercel Blob store in your Vercel dashboard
 * 2. Add BLOB_READ_WRITE_TOKEN to environment variables
 * 3. Use this utility for file uploads/downloads
 */

import { put, list, head, del } from '@vercel/blob';
import { logger } from '@/lib/logging/structured-logger';

export interface BlobUploadOptions {
  access?: 'public' | 'private';
  addRandomSuffix?: boolean;
  contentType?: string;
  cacheControlMaxAge?: number;
}

export interface BlobUploadResult {
  url: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
  size: number;
  uploadedAt: Date;
}

/**
 * Upload a file to Vercel Blob storage
 */
export async function uploadToBlob(
  file: File | Blob | Buffer,
  filename: string,
  options: BlobUploadOptions = {}
): Promise<BlobUploadResult> {
  try {
    const blob = await put(filename, file, {
      access: options.access || 'public',
      addRandomSuffix: options.addRandomSuffix ?? true,
      contentType: options.contentType,
      cacheControlMaxAge: options.cacheControlMaxAge,
    });

    logger.info('File uploaded to Vercel Blob', {
      pathname: blob.pathname,
      size: blob.size,
      contentType: blob.contentType,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      contentDisposition: blob.contentDisposition,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
    };
  } catch (error) {
    logger.error('Vercel Blob upload failed', error instanceof Error ? error : new Error(String(error)), {
      filename,
      options,
    });
    throw error;
  }
}

/**
 * Get blob metadata without downloading the file
 */
export async function getBlobMetadata(pathname: string) {
  try {
    const blob = await head(pathname);
    return blob;
  } catch (error) {
    logger.error('Failed to get blob metadata', error instanceof Error ? error : new Error(String(error)), {
      pathname,
    });
    throw error;
  }
}

/**
 * List blobs with optional prefix filter
 */
export async function listBlobs(prefix?: string, limit = 1000) {
  try {
    const { blobs } = await list({ prefix, limit });
    return blobs;
  } catch (error) {
    logger.error('Failed to list blobs', error instanceof Error ? error : new Error(String(error)), {
      prefix,
      limit,
    });
    throw error;
  }
}

/**
 * Delete a blob by pathname
 */
export async function deleteBlob(pathname: string) {
  try {
    await del(pathname);
    logger.info('Blob deleted', { pathname });
  } catch (error) {
    logger.error('Failed to delete blob', error instanceof Error ? error : new Error(String(error)), {
      pathname,
    });
    throw error;
  }
}

/**
 * Delete multiple blobs by pathname
 */
export async function deleteBlobs(pathnames: string[]) {
  try {
    await del(pathnames);
    logger.info('Blobs deleted', { count: pathnames.length });
  } catch (error) {
    logger.error('Failed to delete blobs', error instanceof Error ? error : new Error(String(error)), {
      count: pathnames.length,
    });
    throw error;
  }
}
