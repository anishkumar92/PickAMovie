// src/app/favorites/favorites.component.ts
import { Component, OnInit } from '@angular/core';
import { FavoritesService } from './favorites.service';
import { MovieService } from '../movie.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  favoriteMovies: any[] = [];
  loading = true;
  error = '';
  showMovies = true; // Default to movie type

  constructor(
    private favoritesService: FavoritesService,
    private movieService: MovieService,
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/favorites' } });
      return;
    }

    this.loadFavoriteMovies();
  }

  loadFavoriteMovies(): void {
    this.loading = true;
    const favoriteIds = this.authService.currentUserValue?.favoriteMovies || [];
    
    if (!favoriteIds.length) {
      this.loading = false;
      return;
    }

    // Load each movie sequentially (not efficient but simple for demo)
    // In a real app, we would batch this request
    this.favoriteMovies = [];
    const loadMovie = (index: number) => {
      if (index >= favoriteIds.length) {
        this.loading = false;
        return;
      }

      this.movieService.getFlickDetails(this.showMovies, favoriteIds[index])
        .subscribe({
          next: (movie) => {
            this.favoriteMovies.push(movie);
            loadMovie(index + 1);
          },
          error: (err) => {
            console.error(`Error loading movie ${favoriteIds[index]}:`, err);
            loadMovie(index + 1);
          }
        });
    };

    loadMovie(0);
  }

  removeFavorite(movieId: number): void {
    this.favoritesService.toggleFavorite(movieId, this.showMovies)
      .subscribe({
        next: () => {
          this.favoriteMovies = this.favoriteMovies.filter(movie => movie.id !== movieId);
        },
        error: (err) => {
          this.error = 'Failed to remove from favorites. Please try again.';
          console.error('Error removing favorite:', err);
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
        // Call your movie details modal here - we'll use the approach from movie-list.component.ts
        // For simplicity, just log the details for now
        console.log('Would open details for:', details);
      });
  }
}