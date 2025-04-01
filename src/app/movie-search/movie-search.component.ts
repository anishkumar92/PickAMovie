import { Component, OnInit } from '@angular/core';
import { MovieService } from '../services/movie.service';
import { PaginationConfig } from 'ngx-bootstrap/pagination';
import { FilterModel } from '../filter/filter.component';

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

  constructor(private movieService: MovieService) { }

  ngOnInit(): void {
    // Check if we have previous search params in localStorage
    this.loadPreviousSearch();
  }

  search(): void {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      return;
    }
    
    this.searched = true;
    this.currentPage = 1;
    this.performSearch();
    
    // Save search params
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
    
    // Clear saved search params
    localStorage.removeItem('lastSearch');
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
  
  private saveSearchParams(): void {
    localStorage.setItem('lastSearch', JSON.stringify({
      query: this.searchQuery,
      showMovies: this.showMovies,
      page: this.currentPage,
      filters: this.activeFilters
    }));
  }
  
  private loadPreviousSearch(): void {
    const savedSearch = localStorage.getItem('lastSearch');
    
    if (savedSearch) {
      try {
        const params = JSON.parse(savedSearch);
        
        this.searchQuery = params.query || '';
        this.showMovies = params.showMovies !== undefined ? params.showMovies : true;
        this.currentPage = params.page || 1;
        this.activeFilters = params.filters || null;
        
        // If we have a query, perform the search
        if (this.searchQuery) {
          this.searched = true;
          this.performSearch();
        }
      } catch (e) {
        console.error('Error loading previous search:', e);
        localStorage.removeItem('lastSearch');
      }
    }
  }
}