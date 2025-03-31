import { Component, OnInit } from '@angular/core';
import { MovieService } from '../movie.service';
import { PaginationConfig } from 'ngx-bootstrap/pagination';

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

  constructor(private movieService: MovieService) { }

  ngOnInit(): void {
  }

  search(): void {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      return;
    }
    
    this.searched = true;
    this.currentPage = 1;
    this.performSearch();
  }

  performSearch(): void {
    this.movieService.searchFlicks(this.searchQuery, this.showMovies, this.currentPage)
      .subscribe(data => {
        this.searchResults = data.results;
        this.totalPages = data.total_pages;
        
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
    
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearResults(): void {
    this.searchResults = [];
    this.searched = false;
    this.currentPage = 1;
    this.totalPages = 0;
  }
}