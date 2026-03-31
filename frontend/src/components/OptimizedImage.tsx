'use client';

import Image from 'next/image';
import { memo, useState, useCallback } from 'react';

interface OptimizedImageProps {
  src: string | undefined | null;
  alt: string;
  fallback?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * Optimized image component using next/image with:
 * - Automatic WebP/AVIF conversion
 * - Lazy loading by default
 * - Blur placeholder on load
 * - Graceful fallback for broken images
 */
export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  fallback = '🏠',
  fill = false,
  width,
  height,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const handleError = useCallback(() => setError(true), []);

  if (!src || error) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 text-gray-400 ${className}`}>
        <span className="text-4xl">{fallback}</span>
      </div>
    );
  }

  // External URLs go through next/image optimization
  if (fill) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover"
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          onError={handleError}
          unoptimized={src.startsWith('data:')}
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 400}
      height={height || 300}
      sizes={sizes}
      className={`object-cover ${className}`}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      onError={handleError}
      unoptimized={src.startsWith('data:')}
    />
  );
});
