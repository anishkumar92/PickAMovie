import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root',
})
export class MovieService implements OnInit {
  isLoading: boolean = true;
  private baseUrl = 'https://moviedb-server.vercel.app/tmdb-proxy';
  private apiUrl = 'https://api.themoviedb.org/3';
  
  // Content filter settings
  private includeAdult = false;
  private includeAdultSubject = new BehaviorSubject<boolean>(false);
  includeAdult$ = this.includeAdultSubject.asObservable();
  
  // Sorting and filtering options
  private sortBy = 'popularity.desc';
  private filterOptions: any = {
    year: null,
    voteAverage: null,
    withCast: null,
    withCrew: null,
    withCompanies: null,
    withKeywords: null,
    withWatchProviders: null,
  };

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService
  ) {}
  
  ngOnInit() { const storedValue = localStorage.getItem('includeAdult');
    if (storedValue !== null) {
      this.includeAdult = storedValue === 'true';
      this.includeAdultSubject.next(this.includeAdult);
    }
  }

  // Adult content methods
  toggleAdultContent(include: boolean): void {
    this.includeAdult = include;
    this.includeAdultSubject.next(include);
    localStorage.setItem('includeAdult', include.toString());
  }

  getAdultContentSetting(): boolean {
    return this.includeAdult;
  }
  
  // Sorting methods
  setSortBy(sortOption: string): void {
    this.sortBy = sortOption;
  }
  
  getSortBy(): string {
    return this.sortBy;
  }
  
  // Filter methods
  setFilterOption(filterName: string, value: any): void {
    this.filterOptions[filterName] = value;
  }
  
  getFilterOption(filterName: string): any {
    return this.filterOptions[filterName];
  }
  
  clearFilters(): void {
    this.filterOptions = {
      year: null,
      voteAverage: null,
      withCast: null,
      withCrew: null,
      withCompanies: null,
      withKeywords: null,
      withWatchProviders: null,
    };
  }

  // Genre methods
  getGenres(showMovies: boolean): Observable<any> {
    const url = `${this.baseUrl}`;
    const params = new HttpParams().set(
      'url',
      `${this.apiUrl}/genre/${showMovies ? 'movie' : 'tv'}/list?language=en-US`
    );
    return this.http.get(url, { params });
  }
  
 

  // Get specific movie/TV show details
// Update getFlickDetails method in src/app/movie.service.ts

// The method signature should remain the same:
getFlickDetails(showMovies: boolean, id: number): Observable<any> {
  const url = `${this.baseUrl}`;
  
  // Construct the appropriate URL path based on content type
  const contentType = showMovies ? 'movie' : 'tv';
  
  const params = new HttpParams().set(
    'url',
    `${this.apiUrl}/${contentType}/${id}?include_adult=${this.includeAdult.toString()}&language=en-US`
  );
  
  return this.http.get(url, { params }).pipe(
    // Add a flag to indicate if this is a movie or not to help with handling later
    map(response => {
      return {
        ...response,
        _isMovie: showMovies // Add a private flag to track the content type
      };
    })
  );
}

  // Get random movie/TV show
  getRandomFlick(showMovies: boolean, pageno = 1): Observable<any> {
    const url = `${this.baseUrl}`;
    const params = new HttpParams().set(
      'url',
      `${this.apiUrl}/${
        showMovies ? 'movie' : 'tv'
      }/popular?page=${pageno.toString()}&include_adult=${this.includeAdult.toString()}&language=en-US`
    );
    return this.http.get(url, { params });
  }

  // Search for movies/TV shows
  searchFlicks(query: string, showMovies: boolean, page: number = 1): Observable<any> {
    const url = `${this.baseUrl}`;
    const params = new HttpParams()
      .set('url', `${this.apiUrl}/search/${showMovies ? 'movie' : 'tv'}`)
      .set('query', query)
      .set('include_adult', this.includeAdult.toString())
      .set('language', 'en-US')
      .set('page', page.toString());

    return this.http.get(url, { params });
  }
  
  // Get trending movies/TV shows
  getTrending(showMovies: boolean, timeWindow: 'day' | 'week' = 'week'): Observable<any> {
    const url = `${this.baseUrl}`;
    const params = new HttpParams().set(
      'url',
      `${this.apiUrl}/trending/${showMovies ? 'movie' : 'tv'}/${timeWindow}?include_adult=${this.includeAdult.toString()}&language=en-US`
    );
    
    return this.http.get(url, { params });
  }
  
  // Get now playing movies (or on the air TV shows)
  getNowPlaying(showMovies: boolean, page: number = 1): Observable<any> {
    const url = `${this.baseUrl}`;
    const endpoint = showMovies ? 'movie/now_playing' : 'tv/on_the_air';
    
    const params = new HttpParams().set(
      'url',
      `${this.apiUrl}/${endpoint}?include_adult=${this.includeAdult.toString()}&page=${page}&language=en-US`
    );
    
    return this.http.get(url, { params });
  }
  
  // Get upcoming movies
  getUpcoming(page: number = 1): Observable<any> {
    const url = `${this.baseUrl}`;
    const params = new HttpParams().set(
      'url',
      `${this.apiUrl}/movie/upcoming?include_adult=${this.includeAdult.toString()}&page=${page}&language=en-US`
    );
    
    return this.http.get(url, { params });
  }
  
  // Get top rated movies/TV shows
  getTopRated(showMovies: boolean, page: number = 1): Observable<any> {
    const url = `${this.baseUrl}`;
    const params = new HttpParams().set(
      'url',
      `${this.apiUrl}/${showMovies ? 'movie' : 'tv'}/top_rated?include_adult=${this.includeAdult.toString()}&page=${page}&language=en-US`
    );
    
    return this.http.get(url, { params });
  }
  
  // Get similar movies/TV shows
  getSimilar(id: number, showMovies: boolean, page: number = 1): Observable<any> {
    const url = `${this.baseUrl}`;
    const params = new HttpParams().set(
      'url',
      `${this.apiUrl}/${showMovies ? 'movie' : 'tv'}/${id}/similar?include_adult=${this.includeAdult.toString()}&page=${page}&language=en-US`
    );
    
    return this.http.get(url, { params });
  }
  
  // Get recommendations based on a movie/TV show
  getRecommendations(id: number, showMovies: boolean, page: number = 1): Observable<any> {
    const url = `${this.baseUrl}`;
    const params = new HttpParams().set(
      'url',
      `${this.apiUrl}/${showMovies ? 'movie' : 'tv'}/${id}/recommendations?include_adult=${this.includeAdult.toString()}&page=${page}&language=en-US`
    );
    
    return this.http.get(url, { params });
  }
  


  // Send email (existing method)
  sendEmail(formData: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    
    const url = `https://moviedb-server.vercel.app/send-email`;
    return this.http.post(url, formData, httpOptions);
  }

  // Update to src/app/movie.service.ts to enhance the filtering capabilities

// Add or update these methods in the MovieService class:

// Method to get movies or TV shows with filtering
getFilteredFlicks(showMovies: boolean, genreId: number | null = null, page: number = 1): Observable<any> {
  const url = `${this.baseUrl}`;
  const contentType = showMovies ? 'movie' : 'tv';
  
  // Start with basic parameters
  let params = new HttpParams()
    .set('url', `${this.apiUrl}/discover/${contentType}`)
    .set('include_adult', this.includeAdult.toString())
    .set('page', page.toString())
    .set('sort_by', this.sortBy)
    .set('language', 'en-US');
  
  // Add genre if specified
  if (genreId) {
    params = params.set('with_genres', genreId.toString());
  }
  
  // Add all other filter parameters
  
  // Year filter (release_date for movies, first_air_date for TV shows)
  const yearFilter = this.filterOptions.year;
  if (yearFilter) {
    const dateField = showMovies ? 'primary_release_date' : 'first_air_date';
    if (yearFilter.primaryReleaseDateGte) {
      params = params.set(`${dateField}.gte`, yearFilter.primaryReleaseDateGte);
    }
    if (yearFilter.primaryReleaseDateLte) {
      params = params.set(`${dateField}.lte`, yearFilter.primaryReleaseDateLte);
    }
  }
  
  // Vote average filter
  const voteFilter = this.filterOptions.voteAverage;
  if (voteFilter) {
    if (voteFilter.voteAverageGte) {
      params = params.set('vote_average.gte', voteFilter.voteAverageGte.toString());
    }
    if (voteFilter.voteAverageLte) {
      params = params.set('vote_average.lte', voteFilter.voteAverageLte.toString());
    }
  }
  
  // Vote count filter
  const voteCountFilter = this.filterOptions.voteCount;
  if (voteCountFilter && voteCountFilter.voteCountGte) {
    params = params.set('vote_count.gte', voteCountFilter.voteCountGte.toString());
  }
  
  // Runtime filter (movies only)
  if (showMovies) {
    const runtimeFilter = this.filterOptions.runtime;
    if (runtimeFilter) {
      if (runtimeFilter.runtimeGte) {
        params = params.set('with_runtime.gte', runtimeFilter.runtimeGte.toString());
      }
      if (runtimeFilter.runtimeLte) {
        params = params.set('with_runtime.lte', runtimeFilter.runtimeLte.toString());
      }
    }
  }
  
  // Watch providers (streaming services)
  const providersFilter = this.filterOptions.withWatchProviders;
  if (providersFilter) {
    params = params.set('with_watch_providers', providersFilter);
    // By default, we'll use US region, but this could be configurable
    params = params.set('watch_region', 'US');
  }
  
  // Original language
  const languageFilter = this.filterOptions.language;
  if (languageFilter) {
    params = params.set('with_original_language', languageFilter);
  }
  
  // Make the API call with all parameters
  return this.http.get(url, { params });
}

// Helper method to get available watch providers
getWatchProviders(region: string = 'US'): Observable<any> {
  const url = `${this.baseUrl}`;
  const params = new HttpParams()
    .set('url', `${this.apiUrl}/watch/providers/movie?watch_region=${region}&language=en-US`);
  
  return this.http.get(url, { params });
}

// Helper method to get available languages
getLanguages(): Observable<any> {
  const url = `${this.baseUrl}`;
  const params = new HttpParams()
    .set('url', `${this.apiUrl}/configuration/languages`);
  
  return this.http.get(url, { params });
}

// Replace the existing getFlickForGenre method with this enhanced version
getFlickForGenre(showMovies: boolean, genreId: number, page: number, pageSize: number): Observable<any> {
  // Call the new filtered method instead
  return this.getFilteredFlicks(showMovies, genreId, page);
}
}