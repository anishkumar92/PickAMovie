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
    
    // Update the URL to match your backend
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/favorites/toggle`, {
      movieId,
      isMovie
    }).pipe(
      map(response => {
        return response.success || false; // Ensure a boolean is always returned
      }),
      catchError(error => {
        // Handle specific status codes
        if (error.status === 403) {
          // Handle limit reached
          console.error('Favorite limit reached:', error);
        }
        return of(false);
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