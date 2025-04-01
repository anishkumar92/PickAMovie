// src/app/favorites/favorites.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService, User } from '../services/auth.service';
import { MovieService } from '../services/movie.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private apiUrl = 'https://moviedb-server.vercel.app/favorites';
  private favoritesSubject = new BehaviorSubject<number[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private movieService: MovieService
  ) {
    // Initialize favorites from current user
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.favoritesSubject.next([...user.favoriteMovies]);
      } else {
        this.favoritesSubject.next([]);
      }
    });
  }
  
  getFavorites(): Observable<number[]> {
    return this.favorites$;
  }
  
  isFavorite(movieId: number): boolean {
    return this.favoritesSubject.value.includes(movieId);
  }
  
  toggleFavorite(movieId: number, isMovie: boolean = true): Observable<boolean> {
    const currentUser = this.authService.currentUserValue;
    
    if (!currentUser) {
      return of(false);
    }
    
    const currentFavorites = [...this.favoritesSubject.value];
    const isFavorite = currentFavorites.includes(movieId);
    
    // If trying to add a favorite but not a Pro user and already at limit
    if (!isFavorite && !this.authService.canAddFavorite()) {
      return of(false);
    }
    
    let updatedFavorites: number[];
    
    if (isFavorite) {
      // Remove from favorites
      updatedFavorites = currentFavorites.filter(id => id !== movieId);
    } else {
      // Add to favorites
      updatedFavorites = [...currentFavorites, movieId];
    }
    
    // Update local state FIRST for immediate UI feedback
    this.updateLocalFavorites(updatedFavorites, currentUser);
    
    // Then update the server
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/toggle`, {
      userId: currentUser.id,
      movieId,
      isMovie
    }).pipe(
      map(response => {
        if (response.success) {
          return !isFavorite; // Return new state (true if added, false if removed)
        } else {
          // If server operation failed, revert the local state
          this.updateLocalFavorites(currentFavorites, currentUser);
          return isFavorite; // Return original state
        }
      }),
      catchError(error => {
        // On error, revert to the original state
        console.error('Toggle favorite error:', error);
        this.updateLocalFavorites(currentFavorites, currentUser);
        return of(isFavorite);
      })
    );
  }
  
  // Helper method to update local state
  private updateLocalFavorites(favorites: number[], user: User): void {
    // Create a copy of the user object to prevent reference issues
    const updatedUser: User = {
      ...user,
      favoriteMovies: [...favorites] // Use a new array
    };
    
    // Update localStorage
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Update the BehaviorSubject
    this.favoritesSubject.next([...favorites]);
    
    // Update the auth service
    this.authService.currentUserSubject.next(updatedUser);
  }
  
  // Method to force refresh favorites (can be called when needed)
  refreshFavorites(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      // Ensure we're working with a fresh copy
      const freshFavorites = [...currentUser.favoriteMovies];
      this.favoritesSubject.next(freshFavorites);
    }
  }
  
  // Method to directly remove a movie from favorites with immediate UI update
  // This is useful for the favorites page to avoid the flickering
  removeMovieFromFavorites(movieId: number, isMovie: boolean = true): Observable<boolean> {
    const currentUser = this.authService.currentUserValue;
    
    if (!currentUser) {
      return of(false);
    }
    
    const currentFavorites = [...this.favoritesSubject.value];
    
    // Only proceed if the movie is actually in favorites
    if (!currentFavorites.includes(movieId)) {
      return of(false);
    }
    
    // Remove from favorites
    const updatedFavorites = currentFavorites.filter(id => id !== movieId);
    
    // Update local state FIRST for immediate UI feedback
    this.updateLocalFavorites(updatedFavorites, currentUser);
    
    // Then update the server
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/toggle`, {
      userId: currentUser.id,
      movieId,
      isMovie
    }).pipe(
      map(response => {
        if (response.success) {
          return true; // Success
        } else {
          // If server operation failed, revert the local state
          this.updateLocalFavorites(currentFavorites, currentUser);
          return false; // Failed
        }
      }),
      catchError(error => {
        // On error, revert to the original state
        console.error('Remove favorite error:', error);
        this.updateLocalFavorites(currentFavorites, currentUser);
        return of(false);
      })
    );
  }
}