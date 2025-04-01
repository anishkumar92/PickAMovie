import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { MovieService } from '../movie.service';
import { FilterModel } from '../filter/filter.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-random-movie',
  templateUrl: './random-movie.component.html',
  styleUrls: ['./random-movie.component.scss'],
})
export class RandomMovieComponent implements OnInit, OnDestroy {
  movieID = 0;
  movie: any = null;
  apiData: any[] = [];
  isFetching: boolean = false;
  showMovies: boolean = true;
  showFullText: boolean = false;
  activeFilters: FilterModel | null = null;
  maxAttempts: number = 10;
  currentAttempt: number = 0;
  private routerSubscription: Subscription | null = null;
  
  constructor(
    private movieService: MovieService,
    private router: Router
  ) {}

  ngOnInit() {
    // Reset state when navigating to this component
    this.resetState();
    
    // Subscribe to router events to reset state when navigating away and back
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        // If we're navigating to a different route and then back to this one
        if (!event.url.includes('random')) {
          // Clear the last viewed movie from localStorage
          localStorage.removeItem('lastRandomMovie');
        }
      }
    });
    
    // Check for saved preferences
    this.loadSavedPreferences();
  }
  
  ngOnDestroy() {
    // Clean up subscription when component is destroyed
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  resetState() {
    this.movie = null;
    this.apiData = [];
    this.movieID = 0;
    this.currentAttempt = 0;
    this.savePreferences();
  }

  getImageUrl(filePath: string | null): string {
    if (filePath) {
      const baseUrl = 'https://image.tmdb.org/t/p/';
      const imageSize = 'w500';
      return `${baseUrl}${imageSize}${filePath}`;
    } else {
      return 'assets/no-image-available.png';
    }
  }

  getTitle(): string {
    if (!this.movie) return '';
    
    return this.showMovies
      ? this.movie.title || 'Unknown Title'
      : this.movie.name || 'Unknown Title';
  }

  getReleaseYear(): string {
    if (!this.movie) return '';
    
    if (this.showMovies) {
      return this.movie.release_date 
        ? this.movie.release_date.substring(0, 4) 
        : 'N/A';
    } else {
      return this.movie.first_air_date 
        ? this.movie.first_air_date.substring(0, 4) 
        : 'N/A';
    }
  }

  toggleText() {
    this.showFullText = !this.showFullText;
  }

  searchMovie(title: string): void {
    const query = encodeURIComponent(title);
    const url = `https://www.google.com/search?q=${query}`;
    window.open(url, '_blank');
  }

  onFilterChanged(filters: FilterModel): void {
    this.activeFilters = filters;
    this.savePreferences();
    // Reset the current movie when filters change
    this.movie = null;
  }

  getRandomMovie() {
    this.isFetching = true;
    this.movie = null;
    this.currentAttempt = 0;
    
    this.fetchRandomMovie();
  }

  private fetchRandomMovie() {
    // If we've tried too many times, stop to prevent infinite loops
    if (this.currentAttempt >= this.maxAttempts) {
      this.isFetching = false;
      alert('Could not find a movie matching your filters. Please try with fewer filters.');
      return;
    }
    
    this.currentAttempt++;
    
    // Get a random page between 1 and 500 (API limitation)
    const maxPages = 500;
    const randomPage = Math.floor(Math.random() * maxPages) + 1;
    
    let requestMethod;
    
    // Use different methods based on active filters
    if (this.activeFilters && 
        (this.activeFilters.yearFrom || 
         this.activeFilters.yearTo || 
         this.activeFilters.voteMin || 
         this.activeFilters.voteCount || 
         this.activeFilters.withProviders.length > 0)) {
      
      // Use discover endpoint with filters
      requestMethod = this.movieService.getFilteredFlicks(
        this.showMovies, 
        0, // No specific genre ID
        randomPage
      );
    } else {
      // Use standard random endpoint
      requestMethod = this.movieService.getRandomFlick(
        this.showMovies, 
        randomPage
      );
    }
    
    requestMethod.subscribe({
      next: (result) => {
        this.apiData = result.results || [];
        
        if (this.apiData.length === 0) {
          // Try again if no results
          this.fetchRandomMovie();
          return;
        }
        
        // Get a random movie from the results
        const randomIndex = Math.floor(Math.random() * this.apiData.length);
        this.movieID = this.apiData[randomIndex].id;
        
        // Get the full details for the selected movie
        this.selectRandomMovie();
      },
      error: (err) => {
        console.error('Error fetching random content:', err);
        this.isFetching = false;
      }
    });
  }

  private selectRandomMovie() {
    if (!this.movieID) {
      this.isFetching = false;
      return;
    }
    
    this.movieService.getFlickDetails(this.showMovies, this.movieID).subscribe({
      next: (result) => {
        // Check if the movie meets our filter criteria
        if (this.moviePassesFilters(result)) {
          this.movie = result;
          this.isFetching = false;
          // Save the movie ID as the last viewed
          this.saveLastViewed();
        } else {
          // If the movie doesn't pass filters, try again
          this.fetchRandomMovie();
        }
      },
      error: (err) => {
        console.error('Error fetching movie details:', err);
        // Try another random movie
        this.fetchRandomMovie();
      }
    });
  }
  
  private moviePassesFilters(movie: any): boolean {
    if (!this.activeFilters) return true;
    
    // Check runtime filter (movies only)
    if (this.showMovies && movie.runtime) {
      if (this.activeFilters.runtimeMin && movie.runtime < this.activeFilters.runtimeMin) {
        return false;
      }
      if (this.activeFilters.runtimeMax && movie.runtime > this.activeFilters.runtimeMax) {
        return false;
      }
    }
    
    // Check year filter
    const year = parseInt(this.showMovies 
      ? (movie.release_date?.substring(0, 4) || '0') 
      : (movie.first_air_date?.substring(0, 4) || '0'), 10);
    
    if (this.activeFilters.yearFrom && year < this.activeFilters.yearFrom) {
      return false;
    }
    
    if (this.activeFilters.yearTo && year > this.activeFilters.yearTo) {
      return false;
    }
    
    // Check rating filter
    if (this.activeFilters.voteMin && movie.vote_average < this.activeFilters.voteMin) {
      return false;
    }
    
    if (this.activeFilters.voteMax && movie.vote_average > this.activeFilters.voteMax) {
      return false;
    }
    
    // Check vote count filter
    if (this.activeFilters.voteCount && movie.vote_count < this.activeFilters.voteCount) {
      return false;
    }
    
    return true;
  }
  
  private savePreferences() {
    localStorage.setItem('randomPreferences', JSON.stringify({
      showMovies: this.showMovies,
      filters: this.activeFilters
    }));
  }
  
  private loadSavedPreferences() {
    const savedPrefs = localStorage.getItem('randomPreferences');
    
    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs);
        this.showMovies = prefs.showMovies !== undefined ? prefs.showMovies : true;
        this.activeFilters = prefs.filters || null;
        
        // Try loading last viewed movie
        this.loadLastViewed();
      } catch (e) {
        console.error('Error loading random preferences:', e);
        localStorage.removeItem('randomPreferences');
      }
    }
  }
  
  private saveLastViewed() {
    if (!this.movie) return;
    
    localStorage.setItem('lastRandomMovie', JSON.stringify({
      id: this.movie.id,
      isMovie: this.showMovies,
      timestamp: new Date().getTime()
    }));
  }
  
  private loadLastViewed() {
    const lastViewedData = localStorage.getItem('lastRandomMovie');
    
    if (lastViewedData) {
      try {
        const data = JSON.parse(lastViewedData);
        const oneHourAgo = new Date().getTime() - (60 * 60 * 1000);
        
        // Only load if it's less than an hour old and matches the current content type
        if (data.timestamp > oneHourAgo && data.isMovie === this.showMovies) {
          this.isFetching = true;
          this.movieService.getFlickDetails(this.showMovies, data.id).subscribe({
            next: (result) => {
              this.movie = result;
              this.isFetching = false;
            },
            error: () => {
              this.isFetching = false;
              localStorage.removeItem('lastRandomMovie');
            }
          });
        }
      } catch (e) {
        console.error('Error loading last viewed random movie:', e);
        localStorage.removeItem('lastRandomMovie');
      }
    }
  }
}