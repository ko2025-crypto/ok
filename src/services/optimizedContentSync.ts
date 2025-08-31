import { optimizedTmdbService } from './optimizedTmdb';
import type { Movie, TVShow } from '../types/movie';

// Optimized content synchronization service
class OptimizedContentSyncService {
  private lastDailyUpdate: Date | null = null;
  private lastWeeklyUpdate: Date | null = null;
  private syncInProgress = false;
  private syncQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;

  constructor() {
    this.initializeOptimizedSync();
  }

  private initializeOptimizedSync() {
    // Reduced frequency for better performance
    setInterval(() => {
      this.checkAndSync();
    }, 2 * 60 * 60 * 1000); // 2 hours instead of 1

    // Initial check with delay to avoid startup congestion
    setTimeout(() => {
      this.checkAndSync();
    }, 5000);
  }

  private async checkAndSync() {
    if (this.syncInProgress) return;

    const now = new Date();
    const shouldDailyUpdate = this.shouldPerformDailyUpdate(now);
    const shouldWeeklyUpdate = this.shouldPerformWeeklyUpdate(now);

    if (shouldDailyUpdate || shouldWeeklyUpdate) {
      await this.performOptimizedSync(shouldWeeklyUpdate);
    }
  }

  private shouldPerformDailyUpdate(now: Date): boolean {
    if (!this.lastDailyUpdate) return true;
    
    const timeDiff = now.getTime() - this.lastDailyUpdate.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    return hoursDiff >= 24;
  }

  private shouldPerformWeeklyUpdate(now: Date): boolean {
    if (!this.lastWeeklyUpdate) return true;
    
    const timeDiff = now.getTime() - this.lastWeeklyUpdate.getTime();
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    
    return daysDiff >= 7;
  }

  private async performOptimizedSync(isWeeklyUpdate: boolean = false) {
    try {
      this.syncInProgress = true;
      console.log(`Performing optimized ${isWeeklyUpdate ? 'weekly' : 'daily'} content sync...`);

      // Queue sync operations for better performance
      this.queueSyncOperation(() => this.syncTrendingContent('day'));
      this.queueSyncOperation(() => this.syncTrendingContent('week'));
      this.queueSyncOperation(() => this.syncPopularContent());
      this.queueSyncOperation(() => this.syncAnimeContent());
      
      if (isWeeklyUpdate) {
        this.queueSyncOperation(() => this.syncVideosForPopularContent());
      }

      await this.processQueue();

      const now = new Date();
      this.lastDailyUpdate = now;
      
      if (isWeeklyUpdate) {
        this.lastWeeklyUpdate = now;
      }

      console.log('Optimized content sync completed successfully');
    } catch (error) {
      console.error('Error during optimized content sync:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private queueSyncOperation(operation: () => Promise<void>) {
    this.syncQueue.push(operation);
    if (!this.isProcessingQueue) {
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.syncQueue.length === 0) return;

    this.isProcessingQueue = true;
    
    while (this.syncQueue.length > 0) {
      const operation = this.syncQueue.shift();
      if (operation) {
        try {
          await operation();
          // Small delay between operations
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error('Error in queued sync operation:', error);
        }
      }
    }
    
    this.isProcessingQueue = false;
  }

  private async syncVideosForPopularContent() {
    try {
      // Get popular content with optimized caching
      const [moviesRes, tvRes, animeRes] = await Promise.all([
        optimizedTmdbService.getPopularMovies(1),
        optimizedTmdbService.getPopularTVShows(1),
        optimizedTmdbService.getAnimeFromMultipleSources(1)
      ]);

      // Prepare items for batch video fetching (reduced count for performance)
      const items = [
        ...moviesRes.results.slice(0, 8).map(movie => ({ id: movie.id, type: 'movie' as const })),
        ...tvRes.results.slice(0, 8).map(tv => ({ id: tv.id, type: 'tv' as const })),
        ...animeRes.results.slice(0, 6).map(anime => ({ id: anime.id, type: 'tv' as const }))
      ];

      // Batch fetch videos with optimized service
      const videoMap = await optimizedTmdbService.batchFetchVideos(items);
      
      // Store video data efficiently
      const videoData: { [key: string]: any[] } = {};
      videoMap.forEach((videos, key) => {
        videoData[key] = videos;
      });

      localStorage.setItem('optimized_content_videos', JSON.stringify({
        videos: videoData,
        lastUpdate: new Date().toISOString(),
        version: '2.0.0'
      }));

      console.log(`Optimized video sync completed for ${items.length} items`);
    } catch (error) {
      console.error('Error syncing videos:', error);
    }
  }

  private async syncTrendingContent(timeWindow: 'day' | 'week') {
    try {
      const response = await optimizedTmdbService.getTrendingAll(timeWindow, 1);
      const uniqueContent = optimizedTmdbService.removeDuplicates(response.results);
      
      // Enhanced storage with metadata
      localStorage.setItem(`optimized_trending_${timeWindow}`, JSON.stringify({
        content: uniqueContent,
        lastUpdate: new Date().toISOString(),
        version: '2.0.0',
        timeWindow
      }));
      
      return uniqueContent;
    } catch (error) {
      console.error(`Error syncing trending ${timeWindow} content:`, error);
      return [];
    }
  }

  private async syncPopularContent() {
    try {
      const [movies, tvShows] = await Promise.all([
        optimizedTmdbService.getPopularMovies(1),
        optimizedTmdbService.getPopularTVShows(1)
      ]);

      // Store with enhanced metadata
      localStorage.setItem('optimized_popular_movies', JSON.stringify({
        content: movies.results,
        lastUpdate: new Date().toISOString(),
        version: '2.0.0'
      }));

      localStorage.setItem('optimized_popular_tv', JSON.stringify({
        content: tvShows.results,
        lastUpdate: new Date().toISOString(),
        version: '2.0.0'
      }));

      return { movies: movies.results, tvShows: tvShows.results };
    } catch (error) {
      console.error('Error syncing popular content:', error);
      return { movies: [], tvShows: [] };
    }
  }

  private async syncAnimeContent() {
    try {
      const anime = await optimizedTmdbService.getAnimeFromMultipleSources(1);
      
      localStorage.setItem('optimized_popular_anime', JSON.stringify({
        content: anime.results,
        lastUpdate: new Date().toISOString(),
        version: '2.0.0'
      }));

      return anime.results;
    } catch (error) {
      console.error('Error syncing anime content:', error);
      return [];
    }
  }

  // Enhanced public methods
  async getTrendingContent(timeWindow: 'day' | 'week'): Promise<(Movie | TVShow)[]> {
    const cached = localStorage.getItem(`optimized_trending_${timeWindow}`);
    
    if (cached) {
      try {
        const { content, lastUpdate, version } = JSON.parse(cached);
        const updateTime = new Date(lastUpdate);
        const now = new Date();
        const hoursDiff = (now.getTime() - updateTime.getTime()) / (1000 * 60 * 60);
        
        // Use cached content if less than 4 hours old and version matches
        if (hoursDiff < 4 && version === '2.0.0') {
          return content;
        }
      } catch (error) {
        console.error('Error parsing cached trending content:', error);
      }
    }

    // Fetch fresh content
    return await this.syncTrendingContent(timeWindow);
  }

  async getPopularContent(): Promise<{ movies: Movie[]; tvShows: TVShow[]; anime: TVShow[] }> {
    const [movies, tvShows, anime] = await Promise.all([
      this.getCachedOrFresh('optimized_popular_movies', () => optimizedTmdbService.getPopularMovies(1)),
      this.getCachedOrFresh('optimized_popular_tv', () => optimizedTmdbService.getPopularTVShows(1)),
      this.getCachedOrFresh('optimized_popular_anime', () => optimizedTmdbService.getAnimeFromMultipleSources(1))
    ]);

    return {
      movies: movies.results || movies,
      tvShows: tvShows.results || tvShows,
      anime: anime.results || anime
    };
  }

  // Enhanced video caching
  getCachedVideos(id: number, type: 'movie' | 'tv'): any[] {
    try {
      const cached = localStorage.getItem('optimized_content_videos');
      if (cached) {
        const { videos, version } = JSON.parse(cached);
        if (version === '2.0.0') {
          const key = `${type}-${id}`;
          return videos[key] || [];
        }
      }
    } catch (error) {
      console.error('Error getting cached videos:', error);
    }
    return [];
  }

  private async getCachedOrFresh(key: string, fetchFn: () => Promise<any>) {
    const cached = localStorage.getItem(key);
    
    if (cached) {
      try {
        const { content, lastUpdate, version } = JSON.parse(cached);
        const updateTime = new Date(lastUpdate);
        const now = new Date();
        const hoursDiff = (now.getTime() - updateTime.getTime()) / (1000 * 60 * 60);
        
        // Extended cache time for better performance
        if (hoursDiff < 8 && version === '2.0.0') {
          return content;
        }
      } catch (error) {
        console.error(`Error parsing cached ${key}:`, error);
      }
    }

    // Fetch fresh content
    const fresh = await fetchFn();
    localStorage.setItem(key, JSON.stringify({
      content: fresh.results || fresh,
      lastUpdate: new Date().toISOString(),
      version: '2.0.0'
    }));

    return fresh.results || fresh;
  }

  // Enhanced force refresh with better performance
  async forceRefresh(): Promise<void> {
    try {
      // Clear optimized caches
      const keysToRemove = [
        'optimized_content_videos',
        'optimized_trending_day',
        'optimized_trending_week',
        'optimized_popular_movies',
        'optimized_popular_tv',
        'optimized_popular_anime'
      ];

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      // Clear service cache
      optimizedTmdbService.clearCache();

      // Reset sync timestamps
      this.lastDailyUpdate = null;
      this.lastWeeklyUpdate = null;
      
      // Perform fresh sync
      await this.performOptimizedSync(true);
    } catch (error) {
      console.error('Error during force refresh:', error);
    }
  }

  // Enhanced status reporting
  getSyncStatus(): { 
    lastDaily: Date | null; 
    lastWeekly: Date | null; 
    inProgress: boolean;
    cacheStats: any;
    version: string;
  } {
    return {
      lastDaily: this.lastDailyUpdate,
      lastWeekly: this.lastWeeklyUpdate,
      inProgress: this.syncInProgress,
      cacheStats: optimizedTmdbService.getCacheStats(),
      version: '2.0.0'
    };
  }

  // Performance monitoring
  getPerformanceMetrics(): {
    queueLength: number;
    isProcessing: boolean;
    lastSyncDuration: number | null;
  } {
    return {
      queueLength: this.syncQueue.length,
      isProcessing: this.isProcessingQueue,
      lastSyncDuration: null // Could be implemented with timing
    };
  }
}

export const optimizedContentSyncService = new OptimizedContentSyncService();