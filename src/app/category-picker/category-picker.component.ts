import { Component } from '@angular/core';
import { MovieService } from '../movie.service';
import { PaginationConfig } from 'ngx-bootstrap/pagination';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-category-picker',
  templateUrl: './category-picker.component.html',
  styleUrls: ['./category-picker.component.scss'],
  providers: [PaginationConfig],
})
export class CategoryPickerComponent {
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

  // Function to load a specific page of movies
  loadPage(id: number, page: number) {
    this.currentPage = page;

    // Call your server-side API to fetch the data for the current page
    console.log(id, this.currentPage, this.pageSize);
    this.movieService
      .getFlickForGenre(this.showMovies, id, this.currentPage, this.pageSize)
      .subscribe((data) => {
        console.log('res', data);
        this.pagedMovies = data.results; // Update the displayed movies
        this.totalPages = data.total_pages; // Update the total pages
      });
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
  }

  // Helper function to get the appropriate icon for each genre
  getGenreIcon(genreName: string): string {
    return this.genreIcons[genreName] || 'fas fa-film'; // Default icon if no mapping exists
  }
}