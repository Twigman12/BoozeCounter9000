/**
 * Performance optimization hooks for blazing-fast UI
 */

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { useIntersectionObserver } from './useIntersectionObserver';

// Virtual scrolling hook for large lists
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 3
) {
  const scrollTop = useRef(0);
  
  const virtualItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop.current / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop.current + containerHeight) / itemHeight) + overscan
    );
    
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      offsetTop: (startIndex + index) * itemHeight,
    }));
  }, [items, itemHeight, containerHeight, overscan, scrollTop.current]);
  
  const totalHeight = items.length * itemHeight;
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    scrollTop.current = e.currentTarget.scrollTop;
  }, []);
  
  return {
    virtualItems,
    totalHeight,
    handleScroll,
  };
}

// Debounce hook for input optimization
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// Throttle hook for scroll/resize events
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());
  const timeout = useRef<NodeJS.Timeout>();
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = now;
    } else {
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        callback(...args);
        lastRun.current = Date.now();
      }, delay - (now - lastRun.current));
    }
  }, [callback, delay]) as T;
}

// Memoized selectors for complex calculations
export function useMemoizedSelector<T, R>(
  data: T,
  selector: (data: T) => R,
  deps: any[] = []
): R {
  return useMemo(() => selector(data), [data, ...deps]);
}

// Lazy image loading hook
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const { isIntersecting } = useIntersectionObserver(imgRef, {
    threshold: 0.1,
    rootMargin: '50px',
  });
  
  useEffect(() => {
    if (isIntersecting && src) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setImageSrc(src);
        setIsLoading(false);
      };
    }
  }, [isIntersecting, src]);
  
  return { imageSrc, isLoading, imgRef };
}

// Request animation frame hook for smooth animations
export function useAnimationFrame(callback: (deltaTime: number) => void) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  
  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [callback]);
  
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate]);
}

// Prefetch data hook
export function usePrefetch<T>(
  fetchFn: () => Promise<T>,
  trigger: boolean
) {
  const cache = useRef<T>();
  const [isPrefetching, setIsPrefetching] = useState(false);
  
  useEffect(() => {
    if (trigger && !cache.current && !isPrefetching) {
      setIsPrefetching(true);
      fetchFn().then(data => {
        cache.current = data;
        setIsPrefetching(false);
      });
    }
  }, [trigger, fetchFn, isPrefetching]);
  
  return { data: cache.current, isPrefetching };
}

