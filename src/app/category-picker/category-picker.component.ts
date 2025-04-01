// src/app/category-picker/category-picker.component.ts
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MovieService } from '../services/movie.service';
import { PaginationConfig } from 'ngx-bootstrap/pagination';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterModel } from '../filter/filter.component';
@Component({
  selector: 'app-category-picker',
  templateUrl: './category-picker.component.html',
  styleUrls: ['./category-picker.component.scss'],
  providers: [PaginationConfig],
})
export class CategoryPickerComponent {
  @ViewChild('genresSlider') genresSlider!: ElementRef;
  
  showMovies = true; // Flag to switch between TV shows and movies
  genres: any[] = [];
  movieList: any[] = [];
  selectedGenre: any; // Variable to store the selected genre
  pagedMovies: any[] = []; // Array to hold the movies for the current page
  currentPage = 1; // Current page number
  pageSize = 10; // Number of movies to display per page
  totalPages = 1; // Total number of pages
  newValue: any;
  newPage = 1;

  // Genre icon mapping
  genreIcons: { [key: string]: string } = {
    // Movie Genres
    'Action': 'fas fa-fist-raised',
    'Adventure': 'fas fa-hiking',
    'Animation': 'fas fa-film',
    'Comedy': 'fas fa-laugh',
    'Crime': 'fas fa-user-secret',
    'Documentary': 'fas fa-file-video',
    'Drama': 'fas fa-theater-masks',
    'Family': 'fas fa-users',
    'Fantasy': 'fas fa-dragon',
    'History': 'fas fa-landmark',
    'Horror': 'fas fa-ghost',
    'Music': 'fas fa-music',
    'Mystery': 'fas fa-search',
    'Romance': 'fas fa-heart',
    'Science Fiction': 'fas fa-rocket',
    'TV Movie': 'fas fa-tv',
    'Thriller': 'fas fa-mask',
    'War': 'fas fa-fighter-jet',
    'Western': 'fas fa-hat-cowboy',
    
    // TV Show Genres
    'Action & Adventure': 'fas fa-running',
    'Kids': 'fas fa-child',
    'News': 'fas fa-newspaper',
    'Reality': 'fas fa-video',
    'Sci-Fi & Fantasy': 'fas fa-space-shuttle',
    'Soap': 'fas fa-sun',
    'Talk': 'fas fa-comments',
    'War & Politics': 'fas fa-landmark',
    
    // Additional TV Show Genres
    'Animation & Cartoon': 'fas fa-child',
    'Anime': 'fas fa-dragon',
    'Biography': 'fas fa-id-badge',
    'Cooking & Food': 'fas fa-utensils',
    'Game Show': 'fas fa-gamepad',
    'Home & Garden': 'fas fa-home',
    'Mini-Series': 'fas fa-list-ol',
    'Sport': 'fas fa-basketball-ball',
    'Travel': 'fas fa-plane',
    'True Crime': 'fas fa-crosshairs',
    'Talk Show': 'fas fa-microphone-alt',
    'Science & Nature': 'fas fa-flask',
    
    // Fallback icon
    'default': 'fas fa-film'
  };

  constructor(
    private movieService: MovieService,
    private paginationConfig: PaginationConfig,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      params['type'] === 'Movies'
        ? (this.showMovies = true)
        : (this.showMovies = false);
      this.newValue = params['genre'];
      this.newPage = Number(params['page']);

      this.fetchFlick();
    });
  }

  fetchFlick() {
    this.movieService.getGenres(this.showMovies).subscribe((data) => {
      // Handle the data here
      this.genres = data.genres;
      if (this.genres) {
        this.selectedGenre = this.genres.find(
          (obj) => obj.name === this.newValue
        );
      }
      console.log('genres', this.selectedGenre);
      this.selectGenre(this.selectedGenre, this.newPage);
    });
  }

  onFilterChanged(filters: FilterModel): void {
    console.log('Filters applied:', filters);
    
    // When filters change, reload the current page with the new filters
    if (this.selectedGenre) {
      this.loadPage(this.selectedGenre.id, this.currentPage);
    }
  }

  loadPage(id: number, page: number) {
    this.currentPage = page;
    
    // Call service method to fetch data
    this.movieService
      .getFilteredFlicks(this.showMovies, id, this.currentPage)
      .subscribe((data) => {
        console.log('Filter results:', data);
        this.pagedMovies = data.results;
        this.totalPages = data.total_pages;
        
        // Scroll to top after loading new content
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      });
  }

  onToggle() {
    this.showMovies = !this.showMovies;
    this.router.navigate([
      '/category',
      this.showMovies ? 'Movies' : 'TV',
      this.showMovies ? 'Action' : 'Animation',
      '1',
    ]);
  }

  // Method to handle the selection of a genre
  selectGenre(genre: any, page: number = 1) {
    this.currentPage = page;
    console.log('gene', genre);
    this.selectedGenre = genre; // Set the selected genre
    this.router.navigate([
      '/category',
      this.showMovies ? 'Movies' : 'TV',
      this.selectedGenre.name,
      page,
    ]);

    if (this.selectedGenre) {
      this.loadPage(this.selectedGenre.id, this.currentPage);
    }
  }

 

  // Function to handle page change event
  pageChanged(event: any) {
    this.currentPage = event.page;
    this.router.navigate([
      '/category',
      this.showMovies ? 'Movies' : 'TV',
      this.selectedGenre.name,
      this.currentPage,
    ]);
    
    if (this.selectedGenre) {
      this.loadPage(this.selectedGenre.id, this.currentPage);
    }
  }

  // Helper function to get the appropriate icon for each genre
  getGenreIcon(genreName: string): string {
    return this.genreIcons[genreName] || 'fas fa-film'; // Default icon if no mapping exists
  }
  
  // Slider controls
  scrollGenres(direction: 'left' | 'right') {
    const container = this.genresSlider.nativeElement;
    const scrollAmount = 300; // Adjust this value for scroll distance
    
    if (direction === 'left') {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }
  }
}