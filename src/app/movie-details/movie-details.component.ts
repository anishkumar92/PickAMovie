import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.scss'],
})
export class MovieDetailsComponent implements OnInit {
  // @Input() movieDetails: any;
  // @Input() openPopup: boolean = false;
  @Input() movie: any;
  movieDetials: any;
  showModal = true;
  constructor(public activeModal: NgbActiveModal) {} // Inject NgbModal

  ngOnInit(): void {
    console.log('Movie Details:', this.movie);
    this.movieDetials = this.movie;
    console.log('Movie Details 2:', this.movieDetials);
  }

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

  getGenres(genres: any[]): string {
    if (!genres || genres.length === 0) {
      return ''; // Return an empty string if no genres are provided
    }

    // Use the map() function to extract the genre names
    const genreNames = genres.map((genre) => genre.name);

    // Use the join() function to concatenate the genre names with a comma
    return genreNames.join(', ');
  }

  closeModal() {
    this.activeModal.close(); // Set showModal to false to hide the modal
  }
}
