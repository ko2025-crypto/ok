import { BASE_URL, API_OPTIONS } from '../config/api';
import type { Movie, TVShow, MovieDetails, TVShowDetails, Video, APIResponse, Genre, Cast, CastMember } from '../types/movie';

class TMDBService {
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

  // Enhanced video fetching with better filtering
  private async getVideosWithFallback(endpoint: string): Promise<{ results: Video[] }> {
    try {
      // Try Spanish first
      const spanishVideos = await this.fetchData<{ results: Video[] }>(`${endpoint}?language=es-ES`);
      
      // If no Spanish videos, try English
      if (!spanishVideos.results || spanishVideos.results.length === 0) {
        const englishVideos = await this.fetchData<{ results: Video[] }>(`${endpoint}?language=en-US`);
        return englishVideos;
      }
      
      // If Spanish videos exist but no trailers, combine with English
      const spanishTrailers = spanishVideos.results.filter(
        video => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
      );
      
      if (spanishTrailers.length === 0) {
        const englishVideos = await this.fetchData<{ results: Video[] }>(`${endpoint}?language=en-US`);
        const englishTrailers = englishVideos.results.filter(
          video => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
        );
        
        return {
          results: [...spanishVideos.results, ...englishTrailers]
        };
      }
      
      return spanishVideos;
    } catch (error) {
      console.error('Error fetching videos:', error);
      return { results: [] };
    }
  }

  // Movies
  async getPopularMovies(page: number = 1): Promise<APIResponse<Movie>> {
    return this.fetchData(`/movie/popular?language=es-ES&page=${page}`);
  }

  async getTopRatedMovies(page: number = 1): Promise<APIResponse<Movie>> {
    return this.fetchData(`/movie/top_rated?language=es-ES&page=${page}`);
  }

  async getUpcomingMovies(page: number = 1): Promise<APIResponse<Movie>> {
    return this.fetchData(`/movie/upcoming?language=es-ES&page=${page}`);
  }

  async searchMovies(query: string, page: number = 1): Promise<APIResponse<Movie>> {
    const encodedQuery = encodeURIComponent(query);
    return this.fetchData(`/search/movie?query=${encodedQuery}&language=es-ES&page=${page}`);
  }

  async getMovieDetails(id: number): Promise<MovieDetails> {
    return this.fetchData(`/movie/${id}?language=es-ES`);
  }

  async getMovieVideos(id: number): Promise<{ results: Video[] }> {
    return this.getVideosWithFallback(`/movie/${id}/videos`);
  }

  async getMovieCredits(id: number): Promise<Cast> {
    return this.fetchData(`/movie/${id}/credits?language=es-ES`);
  }

  // TV Shows
  async getPopularTVShows(page: number = 1): Promise<APIResponse<TVShow>> {
    return this.fetchData(`/tv/popular?language=es-ES&page=${page}`);
  }

  async getTopRatedTVShows(page: number = 1): Promise<APIResponse<TVShow>> {
    return this.fetchData(`/tv/top_rated?language=es-ES&page=${page}`);
  }

  async searchTVShows(query: string, page: number = 1): Promise<APIResponse<TVShow>> {
    const encodedQuery = encodeURIComponent(query);
    return this.fetchData(`/search/tv?query=${encodedQuery}&language=es-ES&page=${page}`);
  }

  async getTVShowDetails(id: number): Promise<TVShowDetails> {
    return this.fetchData(`/tv/${id}?language=es-ES`);
  }

  async getTVShowVideos(id: number): Promise<{ results: Video[] }> {
    return this.getVideosWithFallback(`/tv/${id}/videos`);
  }

  async getTVShowCredits(id: number): Promise<Cast> {
    return this.fetchData(`/tv/${id}/credits?language=es-ES`);
  }

  // Anime (using discover with Japanese origin)
  async getPopularAnime(page: number = 1): Promise<APIResponse<TVShow>> {
    return this.fetchData(`/discover/tv?with_origin_country=JP&with_genres=16&language=es-ES&page=${page}&sort_by=popularity.desc&include_adult=false`);
  }

  async getTopRatedAnime(page: number = 1): Promise<APIResponse<TVShow>> {
    return this.fetchData(`/discover/tv?with_origin_country=JP&with_genres=16&language=es-ES&page=${page}&sort_by=vote_average.desc&vote_count.gte=100&include_adult=false`);
  }

  async searchAnime(query: string, page: number = 1): Promise<APIResponse<TVShow>> {
    const encodedQuery = encodeURIComponent(query);
    return this.fetchData(`/search/tv?query=${encodedQuery}&language=es-ES&page=${page}&with_genres=16&with_origin_country=JP`);
  }

  // Enhanced anime discovery with multiple sources
  async getAnimeFromMultipleSources(page: number = 1): Promise<APIResponse<TVShow>> {
    try {
      const [japaneseAnime, animationGenre, koreanAnimation] = await Promise.all([
        this.fetchData<APIResponse<TVShow>>(`/discover/tv?with_origin_country=JP&with_genres=16&language=es-ES&page=${page}&sort_by=popularity.desc&include_adult=false`),
        this.fetchData<APIResponse<TVShow>>(`/discover/tv?with_genres=16&language=es-ES&page=${page}&sort_by=popularity.desc&include_adult=false`),
        this.fetchData<APIResponse<TVShow>>(`/discover/tv?with_origin_country=KR&with_genres=16&language=es-ES&page=${page}&sort_by=popularity.desc&include_adult=false`)
      ]);

      // Combine and remove duplicates
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

      return {
        ...japaneseAnime,
        results: this.removeDuplicates(combinedResults)
      };
    } catch (error) {
      console.error('Error fetching anime from multiple sources:', error);
      return this.getPopularAnime(page);
    }
  }

  // Genres
  async getMovieGenres(): Promise<{ genres: Genre[] }> {
    return this.fetchData('/genre/movie/list?language=es-ES');
  }

  async getTVGenres(): Promise<{ genres: Genre[] }> {
    return this.fetchData('/genre/tv/list?language=es-ES');
  }

  // Multi search
  async searchMulti(query: string, page: number = 1): Promise<APIResponse<Movie | TVShow>> {
    const encodedQuery = encodeURIComponent(query);
    return this.fetchData(`/search/multi?query=${encodedQuery}&language=es-ES&page=${page}`);
  }

  // Trending content - synchronized with TMDB
  async getTrendingAll(timeWindow: 'day' | 'week' = 'day', page: number = 1): Promise<APIResponse<Movie | TVShow>> {
    return this.fetchData(`/trending/all/${timeWindow}?language=es-ES&page=${page}`);
  }

  async getTrendingMovies(timeWindow: 'day' | 'week' = 'day', page: number = 1): Promise<APIResponse<Movie>> {
    return this.fetchData(`/trending/movie/${timeWindow}?language=es-ES&page=${page}`);
  }

  async getTrendingTV(timeWindow: 'day' | 'week' = 'day', page: number = 1): Promise<APIResponse<TVShow>> {
    return this.fetchData(`/trending/tv/${timeWindow}?language=es-ES&page=${page}`);
  }

  // Enhanced content discovery methods
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
    
    return this.fetchData(endpoint);
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
    
    return this.fetchData(endpoint);
  }

  // Utility method to remove duplicates from combined results
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

  // Get fresh trending content for hero carousel (no duplicates)
  async getHeroContent(): Promise<(Movie | TVShow)[]> {
    try {
      const [trendingDay, trendingWeek, popularMovies, popularTV] = await Promise.all([
        this.getTrendingAll('day', 1),
        this.getTrendingAll('week', 1),
        this.getPopularMovies(1),
        this.getPopularTVShows(1)
      ]);

      // Combine and prioritize trending content
      const combinedItems = [
        ...trendingDay.results.slice(0, 8),
        ...trendingWeek.results.slice(0, 4),
        ...popularMovies.results.slice(0, 3),
        ...popularTV.results.slice(0, 3)
      ];

      // Remove duplicates and return top items
      return this.removeDuplicates(combinedItems).slice(0, 10);
    } catch (error) {
      console.error('Error fetching hero content:', error);
      return [];
    }
  }

  // Batch fetch videos for multiple items
  async batchFetchVideos(items: { id: number; type: 'movie' | 'tv' }[]): Promise<Map<string, Video[]>> {
    const videoMap = new Map<string, Video[]>();
    
    try {
      const videoPromises = items.map(async (item) => {
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

      const results = await Promise.all(videoPromises);
      results.forEach(({ key, videos }) => {
        videoMap.set(key, videos);
      });
    } catch (error) {
      console.error('Error in batch fetch videos:', error);
    }
    
    return videoMap;
  }

  // Enhanced sync method for better content freshness
  async syncAllContent(): Promise<{
    movies: Movie[];
    tvShows: TVShow[];
    anime: TVShow[];
    trending: (Movie | TVShow)[];
  }> {
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

      // Combine and deduplicate content
      const movies = this.removeDuplicates([
        ...popularMovies.results,
        ...topRatedMovies.results,
        ...upcomingMovies.results
      ]);

      const tvShows = this.removeDuplicates([
        ...popularTV.results,
        ...topRatedTV.results
      ]);

      const anime = this.removeDuplicates([
        ...popularAnime.results,
        ...topRatedAnime.results
      ]);

      const trending = this.removeDuplicates([
        ...trendingDay.results,
        ...trendingWeek.results
      ]);

      return { movies, tvShows, anime, trending };
    } catch (error) {
      console.error('Error syncing all content:', error);
      return { movies: [], tvShows: [], anime: [], trending: [] };
    }
  }
}

export const tmdbService = new TMDBService();