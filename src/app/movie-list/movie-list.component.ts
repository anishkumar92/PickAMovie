import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { MovieService } from '../flick-fetch.service';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MovieDetailsComponent } from '../movie-details/movie-details.component';

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss'],
  providers: [NgbModalConfig, NgbModal],
})
export class MovieListComponent implements OnInit {
  @Input() movieList: any;
  @Input() showMovies: boolean = true;
  movies: any;
  movieDetails: any;
  openPopup: boolean = false;
  constructor(
    private movieService: MovieService,
    private modalService: NgbModal
  ) {}
  ngOnInit(): void {
    console.log('movies 111', this.movieList);
    this.movies = this.movieList;
  }

  // Method to generate full image URLs based on provided file paths
  getImageUrl(filePath: string | null): string {
    if (filePath) {
      const baseUrl = 'https://image.tmdb.org/t/p/';
      const imageSize = 'w500'; // Adjust the size as needed (e.g., w200, w300, original)
      return `${baseUrl}${imageSize}${filePath}`;
    } else {
      // Provide a fallback image URL or handle null values as needed
      return 'assets/no-image-available.png'; // Fallback image URL
    }
  }

  onSelect(selectedId: any): void {
    this.movieService
      .getFlickDetails(this.showMovies, selectedId)
      .subscribe((data) => {
        console.log('one movie', data);
        this.movieDetails = data; // Update the displayed movies
        this.openPopup = true;
        // this.movieDetails = selectedId;
        this.openMovieDetailsModal(this.movieDetails);
      });
  }

  // Function to open the movie details modal
  openMovieDetailsModal(movie: any) {
    const modalRef = this.modalService.open(MovieDetailsComponent, {
      centered: true,
    });
    modalRef.componentInstance.movie = movie; // Pass movie data to the modal
  }
}
