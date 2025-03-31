import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
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
  
  // Discover methods with enhanced filtering
  getFlickForGenre(
    showMovies: boolean,
    genreId: any,
    page: number,
    pageSize: number
  ): Observable<any> {
    const url = `${this.baseUrl}`;
    let params = new HttpParams()
      .set('url', `${this.apiUrl}/discover/${showMovies ? 'movie' : 'tv'}`)
      .set('include_adult', this.includeAdult.toString())
      .set('include_video', 'false')
      .set('page', page.toString())
      .set('sort_by', this.sortBy)
      .set('with_genres', genreId)
      .set('page_size', pageSize.toString())
      .set('language', 'en-US');
    
    // Add optional filters if they're set
    if (this.filterOptions.year) {
      params = params.set('primary_release_year', this.filterOptions.year.toString());
    }
    
    if (this.filterOptions.voteAverage) {
      params = params.set('vote_average.gte', this.filterOptions.voteAverage.toString());
    }
    
    if (this.filterOptions.withCast) {
      params = params.set('with_cast', this.filterOptions.withCast);
    }
    
    if (this.filterOptions.withCrew) {
      params = params.set('with_crew', this.filterOptions.withCrew);
    }
    
    if (this.filterOptions.withCompanies) {
      params = params.set('with_companies', this.filterOptions.withCompanies);
    }
    
    if (this.filterOptions.withKeywords) {
      params = params.set('with_keywords', this.filterOptions.withKeywords);
    }
    
    if (this.filterOptions.withWatchProviders) {
      params = params.set('with_watch_providers', this.filterOptions.withWatchProviders);
    }

    return this.http.get(url, { params });
  }

  // Get specific movie/TV show details
  getFlickDetails(showMovies: boolean, id: number): Observable<any> {
    const url = `${this.baseUrl}`;
    const params = new HttpParams().set(
      'url',
      `${this.apiUrl}/${
        showMovies ? 'movie' : 'tv'
      }/${id}?include_adult=${this.includeAdult.toString()}&language=en-US`
    );
    return this.http.get(url, { params });
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
  
  // Get available watch providers (where to watch)
  getWatchProviders(id: number, showMovies: boolean): Observable<any> {
    const url = `${this.baseUrl}`;
    const params = new HttpParams().set(
      'url',
      `${this.apiUrl}/${showMovies ? 'movie' : 'tv'}/${id}/watch/providers?language=en-US`
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
}