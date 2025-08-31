import { useState, useEffect, useCallback } from 'react';
import { optimizedContentSyncService } from '../services/optimizedContentSync';
import type { Movie, TVShow } from '../types/movie';

// Optimized hook with better performance and caching
export function useOptimizedContentSync() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);

  const refreshContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await optimizedContentSyncService.forceRefresh();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error refreshing content:', error);
      setError('Error al actualizar el contenido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTrendingContent = useCallback(async (timeWindow: 'day' | 'week'): Promise<(Movie | TVShow)[]> => {
    try {
      return await optimizedContentSyncService.getTrendingContent(timeWindow);
    } catch (error) {
      console.error('Error getting trending content:', error);
      return [];
    }
  }, []);

  const getPopularContent = useCallback(async () => {
    try {
      return await optimizedContentSyncService.getPopularContent();
    } catch (error) {
      console.error('Error getting popular content:', error);
      return { movies: [], tvShows: [], anime: [] };
    }
  }, []);

  const getPerformanceMetrics = useCallback(() => {
    return optimizedContentSyncService.getPerformanceMetrics();
  }, []);

  // Initialize status
  useEffect(() => {
    const status = optimizedContentSyncService.getSyncStatus();
    setLastUpdate(status.lastDaily);
    setCacheStats(status.cacheStats);
  }, []);

  // Update cache stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const status = optimizedContentSyncService.getSyncStatus();
      setCacheStats(status.cacheStats);
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    isLoading,
    lastUpdate,
    error,
    cacheStats,
    refreshContent,
    getTrendingContent,
    getPopularContent,
    getPerformanceMetrics
  };
}