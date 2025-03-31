// src/app/movie-details/movie-details.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FavoritesService } from '../favorites/favorites.service';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.scss'],
})
export class MovieDetailsComponent implements OnInit {
  @Input() movie: any;
  showModal = true;
  showFullText: boolean = false;
  isFavorite: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private favoritesService: FavoritesService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('Content Details:', this.movie);
    // Check if movie is in favorites
    if (this.movie && this.movie.id) {
      this.checkFavoriteStatus();
    }
  }

  // Check if we're dealing with a TV show or a movie
  isTvShow(): boolean {
    return this.movie.hasOwnProperty('first_air_date') || 
           this.movie.hasOwnProperty('name') || 
           this.movie.hasOwnProperty('seasons');
  }

  // Get the title (different property names for movies vs TV shows)
  getTitle(): string {
    if (this.isTvShow()) {
      return this.movie.name || 'Unknown Title';
    }
    return this.movie.title || 'Unknown Title';
  }

  // Get release year (different property names for movies vs TV shows)
  getReleaseYear(): string {
    if (this.isTvShow()) {
      return this.movie.first_air_date ? 
        this.movie.first_air_date.substring(0, 4) : 'N/A';
    }
    return this.movie.release_date ? 
      this.movie.release_date.substring(0, 4) : 'N/A';
  }

  // Get networks for TV shows
  getNetworks(): string {
    if (!this.movie.networks || !this.movie.networks.length) {
      return 'Unknown';
    }
    return this.movie.networks.map((network: any) => network.name).join(', ');
  }

  toggleText() {
    this.showFullText = !this.showFullText;
  }

  searchMovie(title: string): void {
    const query = encodeURIComponent(title);
    const url = `https://www.google.com/search?q=${query}`;
    window.open(url, '_blank');
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

  closeModal() {
    this.activeModal.close(); // Close the modal
  }
  
  private checkFavoriteStatus(): void {
    this.isFavorite = this.favoritesService.isFavorite(this.movie.id);
  }
  
  toggleFavorite(event: Event): void {
    event.stopPropagation(); // Prevent click from propagating
    
    // If not logged in, redirect to login
    if (!this.authService.isLoggedIn()) {
      this.closeModal();
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: this.router.url } 
      });
      return;
    }
    
    // If trying to add but limit reached
    if (!this.isFavorite && !this.authService.canAddFavorite()) {
      this.closeModal();
      this.router.navigate(['/profile'], { 
        queryParams: { upgrade: true } 
      });
      return;
    }
    
    this.favoritesService.toggleFavorite(this.movie.id, !this.isTvShow())
      .subscribe({
        next: (isNowFavorite) => {
          this.isFavorite = isNowFavorite;
          
          // Notify user of success
          const message = isNowFavorite 
            ? 'Added to favorites!' 
            : 'Removed from favorites!';
          
          // You could implement a toast notification system here
          console.log(message);
        },
        error: (error) => {
          console.error('Error toggling favorite:', error);
        }
      });
  }
}