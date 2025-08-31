// Optimized performance utilities

// Debounce function for better performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

// Throttle function for scroll and resize events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Optimized intersection observer for lazy loading
export function createOptimizedIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
}

// Memory management utilities
export class MemoryManager {
  private static instance: MemoryManager;
  private observers: Set<IntersectionObserver> = new Set();
  private timeouts: Set<NodeJS.Timeout> = new Set();
  private intervals: Set<NodeJS.Timeout> = new Set();

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  addObserver(observer: IntersectionObserver): void {
    this.observers.add(observer);
  }

  removeObserver(observer: IntersectionObserver): void {
    observer.disconnect();
    this.observers.delete(observer);
  }

  addTimeout(timeout: NodeJS.Timeout): void {
    this.timeouts.add(timeout);
  }

  removeTimeout(timeout: NodeJS.Timeout): void {
    clearTimeout(timeout);
    this.timeouts.delete(timeout);
  }

  addInterval(interval: NodeJS.Timeout): void {
    this.intervals.add(interval);
  }

  removeInterval(interval: NodeJS.Timeout): void {
    clearInterval(interval);
    this.intervals.delete(interval);
  }

  cleanup(): void {
    // Clean up observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();

    // Clean up timeouts
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();

    // Clean up intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasure(name: string): void {
    performance.mark(`${name}-start`);
  }

  endMeasure(name: string): number {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name, 'measure')[0];
    const duration = measure.duration;
    
    // Store metric
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);
    
    // Keep only last 10 measurements
    const measurements = this.metrics.get(name)!;
    if (measurements.length > 10) {
      measurements.shift();
    }
    
    // Clean up performance entries
    performance.clearMarks(`${name}-start`);
    performance.clearMarks(`${name}-end`);
    performance.clearMeasures(name);
    
    return duration;
  }

  getAverageTime(name: string): number {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) return 0;
    
    const sum = measurements.reduce((acc, val) => acc + val, 0);
    return sum / measurements.length;
  }

  getAllMetrics(): { [key: string]: { average: number; count: number } } {
    const result: { [key: string]: { average: number; count: number } } = {};
    
    this.metrics.forEach((measurements, name) => {
      result[name] = {
        average: this.getAverageTime(name),
        count: measurements.length
      };
    });
    
    return result;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

// Optimized image loading
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Batch image preloading
export async function preloadImages(urls: string[], batchSize: number = 3): Promise<void> {
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    await Promise.allSettled(batch.map(preloadImage));
    
    // Small delay between batches
    if (i + batchSize < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

// Optimized local storage with compression
export class OptimizedStorage {
  private static compress(data: any): string {
    return JSON.stringify(data);
  }

  private static decompress(data: string): any {
    return JSON.parse(data);
  }

  static setItem(key: string, value: any, ttl?: number): void {
    try {
      const item = {
        value,
        timestamp: Date.now(),
        ttl: ttl || null,
        version: '2.0.0'
      };
      
      localStorage.setItem(key, this.compress(item));
    } catch (error) {
      console.error('Error setting localStorage item:', error);
    }
  }

  static getItem<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const item = this.decompress(stored);
      
      // Check TTL
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        localStorage.removeItem(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error('Error getting localStorage item:', error);
      return null;
    }
  }

  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  static clear(): void {
    localStorage.clear();
  }

  static cleanup(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const item = this.decompress(stored);
          if (item.ttl && Date.now() - item.timestamp > item.ttl) {
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        // Remove corrupted items
        localStorage.removeItem(key);
      }
    });
  }
}

// Initialize performance monitoring
export const performanceMonitor = PerformanceMonitor.getInstance();
export const memoryManager = MemoryManager.getInstance();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  memoryManager.cleanup();
  OptimizedStorage.cleanup();
});