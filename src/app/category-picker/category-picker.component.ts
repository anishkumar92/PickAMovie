import { Component } from '@angular/core';
import { MovieService } from '../flick-fetch.service';
import { PaginationConfig } from 'ngx-bootstrap/pagination';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-category-picker',
  templateUrl: './category-picker.component.html',
  styleUrls: ['./category-picker.component.scss'],
  providers: [PaginationConfig],
})
export class CategoryPickerComponent {
  showMovies = true; // Flag to swith between Tv shows and movies
  genres: any[] = [];
  movieList: any[] = [];
  selectedGenre: any; // Variable to store the selected genre
  // genre/28-action/movie
  pagedMovies: any[] = []; // Array to hold the movies for the current page
  currentPage = 1; // Current page number
  pageSize = 10; // Number of movies to display per page
  totalPages = 1; // Total number of pages
  // selectedGernre: any;
  newValue: any;
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
      this.selectGenre(this.selectedGenre);
    });
  }

  onToggle() {
    this.showMovies = !this.showMovies;
    // this.fetchFlick();
    this.router.navigate([
      '/category',
      this.showMovies ? 'Movies' : 'TV',
      this.showMovies ? 'Action' : 'Comedy',
    ]);
    // this.selectGenre(this.selectedGenre);
  }

  // Method to handle the selection of a genre
  selectGenre(genre: any) {
    console.log('gene', genre);
    this.selectedGenre = genre; // Set the selected genre
    this.router.navigate([
      '/category',
      this.showMovies ? 'Movies' : 'TV',
      this.selectedGenre.name,
    ]);

    this.currentPage = 1;
    console.log(this.selectedGenre);
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
    this.loadPage(this.selectedGenre.id, this.currentPage);
  }
}
