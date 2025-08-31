import { BASE_URL, API_OPTIONS } from '../config/api';
import type { Movie, TVShow, MovieDetails, TVShowDetails, Video, APIResponse, Genre, Cast } from '../types/movie';

// Optimized cache management
class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes
  private readonly LONG_TTL = 2 * 60 * 60 * 1000; // 2 hours

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    
    // Clean old entries periodically
    if (this.cache.size > 100) {
      this.cleanup();
    }
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

// Optimized TMDB Service
class OptimizedTMDBService {
  private cache = new CacheManager();
  private requestQueue = new Map<string, Promise<any>>();

  private async fetchWithCache<T>(endpoint: string, cacheKey?: string, ttl?: number): Promise<T> {
    const key = cacheKey || endpoint;
    
    // Check cache first
    const cached = this.cache.get(key);
    if (cached) {
      return cached;
    }

    // Check if request is already in progress
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key);
    }

    // Make new request
    const requestPromise = this.fetchData<T>(endpoint);
    this.requestQueue.set(key, requestPromise);

    try {
      const data = await requestPromise;
      this.cache.set(key, data, ttl);
      return data;
    } finally {
      this.requestQueue.delete(key);
    }
  }

  private async fetchData<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, API_OPTIONS);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Enhanced video fetching with better caching
  private async getVideosWithFallback(endpoint: string, cacheKey: string): Promise<{ results: Video[] }> {
    try {
      // Check cache first
      const cached = this.cache.get(`videos_${cacheKey}`);
      if (cached) return cached;

      // Try Spanish first
      const spanishVideos = await this.fetchData<{ results: Video[] }>(`${endpoint}?language=es-ES`);
      
      // If no Spanish videos, try English
      if (!spanishVideos.results || spanishVideos.results.length === 0) {
        const englishVideos = await this.fetchData<{ results: Video[] }>(`${endpoint}?language=en-US`);
        this.cache.set(`videos_${cacheKey}`, englishVideos, 60 * 60 * 1000); // 1 hour cache
        return englishVideos;
      }
      
      // Filter for quality trailers
      const spanishTrailers = spanishVideos.results.filter(
        video => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
      );
      
      if (spanishTrailers.length === 0) {
        const englishVideos = await this.fetchData<{ results: Video[] }>(`${endpoint}?language=en-US`);
        const englishTrailers = englishVideos.results.filter(
          video => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
        );
        
        const combinedResult = {
          results: [...spanishVideos.results, ...englishTrailers]
        };
        
        this.cache.set(`videos_${cacheKey}`, combinedResult, 60 * 60 * 1000);
        return combinedResult;
      }
      
      this.cache.set(`videos_${cacheKey}`, spanishVideos, 60 * 60 * 1000);
      return spanishVideos;
    } catch (error) {
      console.error('Error fetching videos:', error);
      return { results: [] };
    }
  }

  // Optimized movie methods
  async getPopularMovies(page: number = 1): Promise<APIResponse<Movie>> {
    return this.fetchWithCache(`/movie/popular?language=es-ES&page=${page}`, `popular_movies_${page}`);
  }

  async getTopRatedMovies(page: number = 1): Promise<APIResponse<Movie>> {
    return this.fetchWithCache(`/movie/top_rated?language=es-ES&page=${page}`, `top_rated_movies_${page}`);
  }

  async getUpcomingMovies(page: number = 1): Promise<APIResponse<Movie>> {
    return this.fetchWithCache(`/movie/upcoming?language=es-ES&page=${page}`, `upcoming_movies_${page}`);
  }

  async searchMovies(query: string, page: number = 1): Promise<APIResponse<Movie>> {
    const encodedQuery = encodeURIComponent(query);
    const cacheKey = `search_movies_${encodedQuery}_${page}`;
    return this.fetchWithCache(`/search/movie?query=${encodedQuery}&language=es-ES&page=${page}`, cacheKey, 10 * 60 * 1000); // 10 min cache for searches
  }

  async getMovieDetails(id: number): Promise<MovieDetails> {
    return this.fetchWithCache(`/movie/${id}?language=es-ES`, `movie_details_${id}`, 2 * 60 * 60 * 1000); // 2 hour cache
  }

  async getMovieVideos(id: number): Promise<{ results: Video[] }> {
    return this.getVideosWithFallback(`/movie/${id}/videos`, `movie_${id}`);
  }

  async getMovieCredits(id: number): Promise<Cast> {
    return this.fetchWithCache(`/movie/${id}/credits?language=es-ES`, `movie_credits_${id}`, 2 * 60 * 60 * 1000);
  }

  // Optimized TV show methods
  async getPopularTVShows(page: number = 1): Promise<APIResponse<TVShow>> {
    return this.fetchWithCache(`/tv/popular?language=es-ES&page=${page}`, `popular_tv_${page}`);
  }

  async getTopRatedTVShows(page: number = 1): Promise<APIResponse<TVShow>> {
    return this.fetchWithCache(`/tv/top_rated?language=es-ES&page=${page}`, `top_rated_tv_${page}`);
  }

  async searchTVShows(query: string, page: number = 1): Promise<APIResponse<TVShow>> {
    const encodedQuery = encodeURIComponent(query);
    const cacheKey = `search_tv_${encodedQuery}_${page}`;
    return this.fetchWithCache(`/search/tv?query=${encodedQuery}&language=es-ES&page=${page}`, cacheKey, 10 * 60 * 1000);
  }

  async getTVShowDetails(id: number): Promise<TVShowDetails> {
    return this.fetchWithCache(`/tv/${id}?language=es-ES`, `tv_details_${id}`, 2 * 60 * 60 * 1000);
  }

  async getTVShowVideos(id: number): Promise<{ results: Video[] }> {
    return this.getVideosWithFallback(`/tv/${id}/videos`, `tv_${id}`);
  }

  async getTVShowCredits(id: number): Promise<Cast> {
    return this.fetchWithCache(`/tv/${id}/credits?language=es-ES`, `tv_credits_${id}`, 2 * 60 * 60 * 1000);
  }

  // Enhanced anime methods with better discovery
  async getPopularAnime(page: number = 1): Promise<APIResponse<TVShow>> {
    const cacheKey = `popular_anime_${page}`;
    return this.fetchWithCache(
      `/discover/tv?with_origin_country=JP&with_genres=16&language=es-ES&page=${page}&sort_by=popularity.desc&include_adult=false`,
      cacheKey
    );
  }

  async getTopRatedAnime(page: number = 1): Promise<APIResponse<TVShow>> {
    const cacheKey = `top_rated_anime_${page}`;
    return this.fetchWithCache(
      `/discover/tv?with_origin_country=JP&with_genres=16&language=es-ES&page=${page}&sort_by=vote_average.desc&vote_count.gte=100&include_adult=false`,
      cacheKey
    );
  }

  async searchAnime(query: string, page: number = 1): Promise<APIResponse<TVShow>> {
    const encodedQuery = encodeURIComponent(query);
    const cacheKey = `search_anime_${encodedQuery}_${page}`;
    return this.fetchWithCache(
      `/search/tv?query=${encodedQuery}&language=es-ES&page=${page}`,
      cacheKey,
      10 * 60 * 1000
    );
  }

  // Optimized anime discovery with multiple sources
  async getAnimeFromMultipleSources(page: number = 1): Promise<APIResponse<TVShow>> {
    const cacheKey = `anime_multi_${page}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const [japaneseAnime, animationGenre, koreanAnimation] = await Promise.all([
        this.getPopularAnime(page),
        this.fetchData<APIResponse<TVShow>>(`/discover/tv?with_genres=16&language=es-ES&page=${page}&sort_by=popularity.desc&include_adult=false`),
        this.fetchData<APIResponse<TVShow>>(`/discover/tv?with_origin_country=KR&with_genres=16&language=es-ES&page=${page}&sort_by=popularity.desc&include_adult=false`)
      ]);

      // Combine and remove duplicates efficiently
      const combinedResults = [
        ...japaneseAnime.results,
        ...animationGenre.results.filter(item => 
          !japaneseAnime.results.some(jp => jp.id === item.id)
        ),
        ...koreanAnimation.results.filter(item => 
          !japaneseAnime.results.some(jp => jp.id === item.id) &&
          !animationGenre.results.some(an => an.id === item.id)
        )
      ];

      const result = {
        ...japaneseAnime,
        results: this.removeDuplicates(combinedResults)
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching anime from multiple sources:', error);
      return this.getPopularAnime(page);
    }
  }

  // Optimized search methods
  async searchMulti(query: string, page: number = 1): Promise<APIResponse<Movie | TVShow>> {
    const encodedQuery = encodeURIComponent(query);
    const cacheKey = `search_multi_${encodedQuery}_${page}`;
    return this.fetchWithCache(
      `/search/multi?query=${encodedQuery}&language=es-ES&page=${page}`,
      cacheKey,
      10 * 60 * 1000
    );
  }

  // Enhanced trending methods with better caching
  async getTrendingAll(timeWindow: 'day' | 'week' = 'day', page: number = 1): Promise<APIResponse<Movie | TVShow>> {
    const cacheKey = `trending_all_${timeWindow}_${page}`;
    const ttl = timeWindow === 'day' ? 30 * 60 * 1000 : 2 * 60 * 60 * 1000; // 30 min for day, 2 hours for week
    return this.fetchWithCache(`/trending/all/${timeWindow}?language=es-ES&page=${page}`, cacheKey, ttl);
  }

  async getTrendingMovies(timeWindow: 'day' | 'week' = 'day', page: number = 1): Promise<APIResponse<Movie>> {
    const cacheKey = `trending_movies_${timeWindow}_${page}`;
    const ttl = timeWindow === 'day' ? 30 * 60 * 1000 : 2 * 60 * 60 * 1000;
    return this.fetchWithCache(`/trending/movie/${timeWindow}?language=es-ES&page=${page}`, cacheKey, ttl);
  }

  async getTrendingTV(timeWindow: 'day' | 'week' = 'day', page: number = 1): Promise<APIResponse<TVShow>> {
    const cacheKey = `trending_tv_${timeWindow}_${page}`;
    const ttl = timeWindow === 'day' ? 30 * 60 * 1000 : 2 * 60 * 60 * 1000;
    return this.fetchWithCache(`/trending/tv/${timeWindow}?language=es-ES&page=${page}`, cacheKey, ttl);
  }

  // Enhanced discovery methods
  async getDiscoverMovies(params: {
    genre?: number;
    year?: number;
    sortBy?: string;
    page?: number;
  } = {}): Promise<APIResponse<Movie>> {
    const { genre, year, sortBy = 'popularity.desc', page = 1 } = params;
    let endpoint = `/discover/movie?language=es-ES&page=${page}&sort_by=${sortBy}&include_adult=false`;
    
    if (genre) endpoint += `&with_genres=${genre}`;
    if (year) endpoint += `&year=${year}`;
    
    const cacheKey = `discover_movies_${JSON.stringify(params)}`;
    return this.fetchWithCache(endpoint, cacheKey);
  }

  async getDiscoverTVShows(params: {
    genre?: number;
    year?: number;
    sortBy?: string;
    page?: number;
    country?: string;
  } = {}): Promise<APIResponse<TVShow>> {
    const { genre, year, sortBy = 'popularity.desc', page = 1, country } = params;
    let endpoint = `/discover/tv?language=es-ES&page=${page}&sort_by=${sortBy}&include_adult=false`;
    
    if (genre) endpoint += `&with_genres=${genre}`;
    if (year) endpoint += `&first_air_date_year=${year}`;
    if (country) endpoint += `&with_origin_country=${country}`;
    
    const cacheKey = `discover_tv_${JSON.stringify(params)}`;
    return this.fetchWithCache(endpoint, cacheKey);
  }

  // Optimized utility methods
  removeDuplicates<T extends { id: number }>(items: T[]): T[] {
    const seen = new Set<number>();
    return items.filter(item => {
      if (seen.has(item.id)) {
        return false;
      }
      seen.add(item.id);
      return true;
    });
  }

  // Enhanced hero content with better variety
  async getHeroContent(): Promise<(Movie | TVShow)[]> {
    const cacheKey = 'hero_content';
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const [trendingDay, trendingWeek, popularMovies, popularTV] = await Promise.all([
        this.getTrendingAll('day', 1),
        this.getTrendingAll('week', 1),
        this.getPopularMovies(1),
        this.getPopularTVShows(1)
      ]);

      // Intelligent content mixing for better variety
      const combinedItems = [
        ...trendingDay.results.slice(0, 6),
        ...trendingWeek.results.slice(0, 4),
        ...popularMovies.results.slice(0, 3),
        ...popularTV.results.slice(0, 3)
      ];

      // Remove duplicates and ensure quality content
      const uniqueItems = this.removeDuplicates(combinedItems)
        .filter(item => item.vote_average > 6.0) // Filter for quality content
        .slice(0, 10);

      this.cache.set(cacheKey, uniqueItems, 60 * 60 * 1000); // 1 hour cache
      return uniqueItems;
    } catch (error) {
      console.error('Error fetching hero content:', error);
      return [];
    }
  }

  // Optimized batch operations
  async batchFetchVideos(items: { id: number; type: 'movie' | 'tv' }[]): Promise<Map<string, Video[]>> {
    const videoMap = new Map<string, Video[]>();
    const batchSize = 5; // Process in smaller batches for better performance
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (item) => {
        const key = `${item.type}-${item.id}`;
        try {
          const videos = item.type === 'movie' 
            ? await this.getMovieVideos(item.id)
            : await this.getTVShowVideos(item.id);
          
          const trailers = videos.results.filter(
            video => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
          );
          
          return { key, videos: trailers };
        } catch (error) {
          console.error(`Error fetching videos for ${key}:`, error);
          return { key, videos: [] };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ key, videos }) => {
        videoMap.set(key, videos);
      });

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return videoMap;
  }

  // Enhanced content synchronization
  async syncAllContent(): Promise<{
    movies: Movie[];
    tvShows: TVShow[];
    anime: TVShow[];
    trending: (Movie | TVShow)[];
  }> {
    const cacheKey = 'all_content_sync';
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const [
        popularMovies,
        topRatedMovies,
        upcomingMovies,
        popularTV,
        topRatedTV,
        popularAnime,
        topRatedAnime,
        trendingDay,
        trendingWeek
      ] = await Promise.all([
        this.getPopularMovies(1),
        this.getTopRatedMovies(1),
        this.getUpcomingMovies(1),
        this.getPopularTVShows(1),
        this.getTopRatedTVShows(1),
        this.getAnimeFromMultipleSources(1),
        this.getTopRatedAnime(1),
        this.getTrendingAll('day', 1),
        this.getTrendingAll('week', 1)
      ]);

      // Intelligent content combination with quality filtering
      const movies = this.removeDuplicates([
        ...popularMovies.results,
        ...topRatedMovies.results,
        ...upcomingMovies.results
      ]).filter(movie => movie.vote_average > 5.0);

      const tvShows = this.removeDuplicates([
        ...popularTV.results,
        ...topRatedTV.results
      ]).filter(show => show.vote_average > 5.0);

      const anime = this.removeDuplicates([
        ...popularAnime.results,
        ...topRatedAnime.results
      ]).filter(show => show.vote_average > 6.0);

      const trending = this.removeDuplicates([
        ...trendingDay.results,
        ...trendingWeek.results
      ]).filter(item => item.vote_average > 6.0);

      const result = { movies, tvShows, anime, trending };
      this.cache.set(cacheKey, result, 30 * 60 * 1000); // 30 min cache
      return result;
    } catch (error) {
      console.error('Error syncing all content:', error);
      return { movies: [], tvShows: [], anime: [], trending: [] };
    }
  }

  // Cache management methods
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache['cache'].size,
      keys: Array.from(this.cache['cache'].keys())
    };
  }
}

export const optimizedTmdbService = new OptimizedTMDBService();