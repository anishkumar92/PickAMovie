// src/app/favorites/favorites.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService, User } from '../auth/auth.service';
import { MovieService } from '../movie.service';

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
        this.favoritesSubject.next(user.favoriteMovies || []);
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
    
    // In a real app, we'd update the server here
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/toggle`, {
      userId: currentUser.id,
      movieId,
      isMovie
    }).pipe(
      map(response => {
        if (response.success) {
          // Update local state
          this.favoritesSubject.next(updatedFavorites);
          
          // Update user in auth service
          const updatedUser: User = {
            ...currentUser,
            favoriteMovies: updatedFavorites
          };
          
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          
          return !isFavorite; // Return new state (true if added, false if removed)
        }
        return isFavorite; // Return original state if operation failed
      }),
      catchError(() => {
        // For demo purposes, we'll update local state even if the server fails
        this.favoritesSubject.next(updatedFavorites);
        
        // Update user in auth service
        const updatedUser: User = {
          ...currentUser,
          favoriteMovies: updatedFavorites
        };
        
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        return of(!isFavorite);
      })
    );
  }
  
  // Load favorite movie details
  loadFavoriteMovies(): Observable<any[]> {
    const favoriteIds = this.favoritesSubject.value;
    if (!favoriteIds.length) {
      return of([]);
    }
    
    // This is simplified - in a real app we'd make a single request to fetch all favorites
    // For this demo, we'll load each movie sequentially
    const requests = favoriteIds.map(id => 
      this.movieService.getFlickDetails(true, id)
    );
    
    // This would be better with forkJoin or similar, but keeping it simple
    return of([]); // Placeholder - would need to implement batch loading
  }
}