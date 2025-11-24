"use client";
import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  fill?: boolean;
  quality?: number;
}

/**
 * Optimized Image Component
 * 
 * Features:
 * - Automatic lazy loading (unless priority is set)
 * - Responsive image sizing
 * - WebP/AVIF format support via Next.js Image
 * - Loading placeholder
 * - Error fallback
 * - Accessibility support
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = "",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  fill = false,
  quality = 85,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`}
        role="img"
        aria-label={alt}
        style={{ width, height }}
      >
        <span className="text-sm">Image unavailable</span>
      </div>
    );
  }

  const imageProps = fill
    ? {
        fill: true,
        sizes,
      }
    : {
        width: width || 800,
        height: height || 600,
      };

  return (
    <div className={`relative overflow-hidden ${className}`} style={fill ? undefined : { width, height }}>
      {isLoading && (
        <div
          className="absolute inset-0 bg-muted animate-pulse"
          aria-hidden="true"
        />
      )}
      <Image
        src={src}
        alt={alt}
        {...imageProps}
        priority={priority}
        quality={quality}
        className={`transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        loading={priority ? undefined : "lazy"}
      />
    </div>
  );
}
