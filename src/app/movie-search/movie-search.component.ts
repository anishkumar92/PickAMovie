// src/app/movie-search/movie-search.component.ts
import { Component, OnInit } from '@angular/core';
import { MovieService } from '../services/movie.service';
import { PaginationConfig } from 'ngx-bootstrap/pagination';
import { FilterModel } from '../filter/filter.component';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-movie-search',
  templateUrl: './movie-search.component.html',
  styleUrls: ['./movie-search.component.scss'],
  providers: [PaginationConfig]
})
export class MovieSearchComponent implements OnInit {
  searchQuery: string = '';
  searchResults: any[] = [];
  showMovies: boolean = true;
  currentPage: number = 1;
  pageSize: number = 20; // TMDB API returns 20 results per page
  totalPages: number = 0;
  searched: boolean = false;
  activeFilters: FilterModel | null = null;

  constructor(
    private movieService: MovieService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Listen for navigation events to reset search when coming from another route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // If user navigates to search page from another route, reset the search
      const previousUrl = event.url;
      if (previousUrl && !previousUrl.includes('/search') && this.router.url.includes('/search')) {
        this.resetSearch();
      }
    });

    // Check if we have query params
    this.route.queryParams.subscribe(params => {
      if (params['query']) {
        this.searchQuery = params['query'];
        this.showMovies = params['type'] !== 'tv';
        this.currentPage = params['page'] ? parseInt(params['page']) : 1;
        this.searched = true;
        
        // Perform the search with params
        this.performSearch();
      } else if (this.router.url === '/search') {
        // If we're on the search page with no query params, reset
        this.resetSearch();
      }
    });
  }

  resetSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.currentPage = 1;
    this.totalPages = 0;
    this.searched = false;
    this.activeFilters = null;
    localStorage.removeItem('lastSearch');
  }

  clearSearchQuery(): void {
    this.searchQuery = '';
    // Also reset the search results
    this.searchResults = [];
    this.searched = false;
    this.currentPage = 1;
    this.totalPages = 0;
    
    // Clear URL parameters
    this.router.navigate(['/search'], { 
      queryParams: {} 
    });
    
    // Clear saved search params
    localStorage.removeItem('lastSearch');
    
    // Focus the input field
    setTimeout(() => {
      const searchInput = document.querySelector('.search-input') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }, 0);
  }

  search(): void {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      return;
    }
    
    this.searched = true;
    this.currentPage = 1;
    this.performSearch();
    
    // Update URL with query params
    this.updateQueryParams();
    
    // Save search params to localStorage for potential future use
    this.saveSearchParams();
  }

  performSearch(): void {
    this.movieService.searchFlicks(this.searchQuery, this.showMovies, this.currentPage)
      .subscribe(data => {
        this.searchResults = data.results;
        this.totalPages = data.total_pages;
        
        // Apply filters if they exist
        if (this.activeFilters) {
          this.applyFilters();
        }
        
        // Scroll to results if on mobile
        if (window.innerWidth < 768) {
          setTimeout(() => {
            const resultsElement = document.querySelector('.search-results-container');
            if (resultsElement) {
              resultsElement.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        }
      });
  }

  pageChanged(event: any): void {
    this.currentPage = event.page;
    this.performSearch();
    
    // Update URL with the new page
    this.updateQueryParams();
    
    this.saveSearchParams();
    
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearResults(): void {
    this.searchResults = [];
    this.searched = false;
    this.currentPage = 1;
    this.totalPages = 0;
    this.activeFilters = null;
    
    // Clear URL parameters
    this.router.navigate(['/search'], { 
      queryParams: {} 
    });
    
    // Clear saved search params
    localStorage.removeItem('lastSearch');
  }
  
  // This method is triggered when toggling between Movies and TV Shows
  onToggleContentType(): void {
    // Clear search results but maintain the query
    this.searchResults = [];
    this.currentPage = 1;
    this.totalPages = 0;
    
    // If we have an active search, perform it again for the new content type
    if (this.searched && this.searchQuery) {
      // Update URL with the new content type
      this.updateQueryParams();
      
      // Perform the search again
      this.performSearch();
      this.saveSearchParams();
    }
  }
  
  onFilterChanged(filters: FilterModel): void {
    this.activeFilters = filters;
    this.applyFilters();
    this.saveSearchParams();
  }
  
  private applyFilters(): void {
    if (!this.activeFilters || !this.searchResults.length) return;
    
    // Create a filtered copy of the search results
    let filteredResults = [...this.searchResults];
    
    // Filter by year
    if (this.activeFilters.yearFrom || this.activeFilters.yearTo) {
      filteredResults = filteredResults.filter(item => {
        const year = parseInt(this.showMovies ? 
          (item.release_date?.substring(0, 4) || '0') : 
          (item.first_air_date?.substring(0, 4) || '0'), 10);
        
        if (this.activeFilters?.yearFrom && this.activeFilters?.yearTo) {
          return year >= this.activeFilters.yearFrom && year <= this.activeFilters.yearTo;
        } else if (this.activeFilters?.yearFrom) {
          return year >= this.activeFilters.yearFrom;
        } else if (this.activeFilters?.yearTo) {
          return year <= this.activeFilters.yearTo;
        }
        
        return true;
      });
    }
    
    // Filter by rating
    if (this.activeFilters.voteMin || this.activeFilters.voteMax) {
      filteredResults = filteredResults.filter(item => {
        const rating = item.vote_average || 0;
        
        if (this.activeFilters?.voteMin && this.activeFilters?.voteMax) {
          return rating >= this.activeFilters.voteMin && rating <= this.activeFilters.voteMax;
        } else if (this.activeFilters?.voteMin) {
          return rating >= this.activeFilters.voteMin;
        } else if (this.activeFilters?.voteMax) {
          return rating <= this.activeFilters.voteMax;
        }
        
        return true;
      });
    }
    
    // Filter by vote count
    if (this.activeFilters.voteCount > 0) {
      filteredResults = filteredResults.filter(item => 
        (item.vote_count || 0) >= this.activeFilters!.voteCount
      );
    }
    
    // Apply sort
    if (this.activeFilters.sortBy) {
      const [sortProp, sortDir] = this.activeFilters.sortBy.split('.');
      
      filteredResults.sort((a, b) => {
        let valA, valB;
        
        // Handle special properties
        if (sortProp === 'release_date') {
          valA = this.showMovies ? a.release_date : a.first_air_date;
          valB = this.showMovies ? b.release_date : b.first_air_date;
        } else if (sortProp === 'original_title') {
          valA = this.showMovies ? a.original_title : a.original_name;
          valB = this.showMovies ? b.original_title : b.original_name;
        } else {
          valA = a[sortProp];
          valB = b[sortProp];
        }
        
        // Default to empty string if null/undefined
        valA = valA || '';
        valB = valB || '';
        
        // Sort direction
        return sortDir === 'asc' 
          ? (valA < valB ? -1 : valA > valB ? 1 : 0)
          : (valA > valB ? -1 : valA < valB ? 1 : 0);
      });
    }
    
    // Update the results
    this.searchResults = filteredResults;
  }
  
  // Method to update URL query parameters
  private updateQueryParams(): void {
    // Only navigate if we have a query
    if (this.searchQuery) {
      this.router.navigate(['/search'], {
        queryParams: {
          query: this.searchQuery,
          type: this.showMovies ? 'movie' : 'tv',
          page: this.currentPage.toString()
        },
        // Don't navigate away from the search route
        queryParamsHandling: 'merge'
      });
    }
  }
  
  private saveSearchParams(): void {
    localStorage.setItem('lastSearch', JSON.stringify({
      query: this.searchQuery,
      showMovies: this.showMovies,
      page: this.currentPage,
      filters: this.activeFilters
    }));
  }
}