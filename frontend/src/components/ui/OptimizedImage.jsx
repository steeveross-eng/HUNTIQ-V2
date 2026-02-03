/**
 * OptimizedImage - Composant d'image optimisé avec lazy loading
 * - Support WebP avec fallback PNG
 * - Lazy loading natif
 * - Placeholder blur
 */

import React, { useState } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  priority = false,
  placeholder = 'blur'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Convertir .png en .webp si disponible
  const webpSrc = src?.replace(/\.png$/i, '.webp');
  const fallbackSrc = src;
  
  const handleLoad = () => setIsLoaded(true);
  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };
  
  return (
    <picture>
      {/* WebP pour navigateurs modernes */}
      {!hasError && <source srcSet={webpSrc} type="image/webp" />}
      
      {/* Fallback PNG */}
      <img
        src={hasError ? fallbackSrc : webpSrc}
        alt={alt}
        className={`${className} ${!isLoaded && placeholder === 'blur' ? 'blur-sm' : ''} transition-all duration-300`}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
      />
    </picture>
  );
};

export default OptimizedImage;
