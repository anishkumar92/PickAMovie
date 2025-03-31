// src/app/favorites/favorites.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FavoritesService } from './favorites.service';
import { MovieService } from '../movie.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { MovieDetailsComponent } from '../movie-details/movie-details.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit, OnDestroy {
  favoriteMovies: any[] = [];
  loading = true;
  error = '';
  showMovies = true; // Default to movie type
  private favoritesSubscription: Subscription | undefined;

  constructor(
    private favoritesService: FavoritesService,
    private movieService: MovieService,
    public authService: AuthService,
    private router: Router,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/favorites' } });
      return;
    }

    // Subscribe to the favorites observable
    this.favoritesSubscription = this.favoritesService.getFavorites().subscribe(favorites => {
      console.log('Favorites changed, reloading data...', favorites);
      this.loadFavoriteMovies(favorites);
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription when component is destroyed
    if (this.favoritesSubscription) {
      this.favoritesSubscription.unsubscribe();
    }
  }

  // Pass the current favorites array directly to avoid timing issues
  loadFavoriteMovies(favoriteIds: number[]): void {
    this.loading = true;
    
    if (!favoriteIds.length) {
      this.favoriteMovies = []; // Clear the array when there are no favorites
      this.loading = false;
      return;
    }

    // Create a new array to store the loaded favorite movies
    const newFavoriteMovies: any[] = [];
    let loadedCount = 0;
    
    favoriteIds.forEach(id => {
      this.movieService.getFlickDetails(this.showMovies, id)
        .subscribe({
          next: (movie) => {
            // Add a property to track removal state
            movie.isRemoving = false;
            newFavoriteMovies.push(movie);
            loadedCount++;
            
            // When all movies are loaded, update state and turn off loading
            if (loadedCount === favoriteIds.length) {
              this.favoriteMovies = newFavoriteMovies;
              this.loading = false;
            }
          },
          error: (err) => {
            console.error(`Error loading movie ${id}:`, err);
            loadedCount++;
            
            // Still check if this was the last movie to load
            if (loadedCount === favoriteIds.length) {
              this.favoriteMovies = newFavoriteMovies;
              this.loading = false;
            }
          }
        });
    });
  }

  removeFavorite(movieId: number): void {
    // Find the movie and mark it as being removed
    const movieToRemove = this.favoriteMovies.find(movie => movie.id === movieId);
    if (movieToRemove) {
      movieToRemove.isRemoving = true;
    }
    
    // Call the service to update the backend with optimistic UI update
    this.favoritesService.removeMovieFromFavorites(movieId, this.showMovies)
      .subscribe({
        next: (success) => {
          if (!success) {
            // If removal failed, unmark the movie
            if (movieToRemove) {
              movieToRemove.isRemoving = false;
            }
            this.error = 'Failed to remove from favorites. Please try again.';
          }
        },
        error: (err) => {
          console.error('Error removing favorite:', err);
          // If there was an error, unmark the movie
          if (movieToRemove) {
            movieToRemove.isRemoving = false;
          }
          this.error = 'Failed to remove from favorites. Please try again.';
        }
      });
  }

  // Method to generate full image URLs based on provided file paths
  getImageUrl(filePath: string | null): string {
    if (filePath) {
      const baseUrl = 'https://image.tmdb.org/t/p/';
      const imageSize = 'w500'; // Adjust the size as needed
      return `${baseUrl}${imageSize}${filePath}`;
    } else {
      // Provide a fallback image URL or handle null values as needed
      return 'assets/no-image-available.png'; // Fallback image URL
    }
  }

  getMovieTitle(movie: any): string {
    return movie.title || movie.name || 'Unknown Title';
  }

  openMovieDetails(movie: any): void {
    // Open movie details modal using the existing movie service functionality
    this.movieService.getFlickDetails(this.showMovies, movie.id)
      .subscribe(details => {
        // Open the modal directly using the injected modalService
        const modalRef = this.modalService.open(MovieDetailsComponent, {
          centered: true,
          size: 'lg'
        });
        modalRef.componentInstance.movie = details;
        modalRef.componentInstance.showModal = true;
      });
  }
}