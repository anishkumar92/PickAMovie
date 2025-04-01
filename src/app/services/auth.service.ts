// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { UserPreferencesService } from './user-preferences.service';

export interface User {
  id: string;
  name: string;
  email: string;
  token: string;
  isPro: boolean;
  includeAdult: boolean;
  favoriteMovies: number[]; // Array of movie IDs
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // API URLs
  private apiUrl = 'https://moviedb-server.vercel.app/auth';
  private baseUrl = 'https://moviedb-server.vercel.app';
  
  constructor(
    private http: HttpClient,
    private preferencesService: UserPreferencesService
  ) {
    this.loadUserFromStorage();
  }
  
  private loadUserFromStorage() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
        
        // Sync the user's adult content preference with the preferences service
        if (user.includeAdult !== undefined) {
          this.preferencesService.setAdultContentSetting(user.includeAdult);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }
  
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
  
  public isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }
  
  login(email: string, password: string): Observable<User> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        map(response => {
          // Store user details and token in local storage
          const user: User = {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            token: response.token,
            isPro: response.user.isPro,
            favoriteMovies: response.user.favoriteMovies || [],
            includeAdult: response.user.includeAdult || false
          };
          
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          
          // Update the preferences service with the user's adult content preference
          this.preferencesService.setAdultContentSetting(user.includeAdult);
          
          return user;
        }),
        catchError(error => {
          console.error('Login error:', error);
          throw error;
        })
      );
  }
  
  register(name: string, email: string, password: string): Observable<User> {
    return this.http.post<any>(`${this.apiUrl}/register`, { name, email, password })
      .pipe(
        map(response => {
          // Store user details and token in local storage
          const user: User = {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            token: response.token,
            isPro: false,
            favoriteMovies: [],
            includeAdult: response.user.includeAdult || false
          };
          
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          
          // Update the preferences service with the user's adult content preference
          this.preferencesService.setAdultContentSetting(user.includeAdult);
          
          return user;
        }),
        catchError(error => {
          console.error('Registration error:', error);
          throw error;
        })
      );
  }
  
  logout(): void {
    // Clear localStorage
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    
    // Note: We don't clear adult content setting from preferences
    // since we want to maintain that preference for anonymous users
  }
  
  // For demo purposes, we'll implement a simple method to check if a user can add more favorites
  canAddFavorite(): boolean {
    const user = this.currentUserValue;
    if (!user) return false;
    
    // Free users can only save 5 movies
    // Pro users have unlimited
    return user.isPro || (user.favoriteMovies.length < 5);
  }
  
  // Method to count remaining favorite slots
  getRemainingFavoriteSlots(): number {
    const user = this.currentUserValue;
    if (!user) return 0;
    if (user.isPro) return Infinity;
    return Math.max(0, 5 - user.favoriteMovies.length);
  }
  
  // Upgrade user to Pro by calling the backend endpoint
  upgradeToPro(): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/users/upgrade`, {}).pipe(
      tap(updatedUser => {
        // Update local storage with the Pro status
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser);
      }),
      catchError(error => {
        console.error('Upgrade to Pro error:', error);
        throw error;
      })
    );
  }
  
  // Method for canceling Pro membership
  cancelPro(): Observable<User> {
    return this.http.put<any>(`${this.baseUrl}/users/cancel-pro`, {}).pipe(
      map(response => {
        // Update the stored user with the non-pro status
        const updatedUser: User = {
          ...this.currentUserValue!,
          isPro: false,
          favoriteMovies: response.user.favoriteMovies
        };
        
        // Update local storage
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser);
        
        return updatedUser;
      }),
      catchError(error => {
        console.error('Cancel Pro error:', error);
        throw error;
      })
    );
  }
  
  // Update adult content preference - this method now delegates to the UserPreferencesService
  updateAdultContentPreference(includeAdult: boolean): Observable<User> {
    const currentUser = this.currentUserValue;
    if (!currentUser) {
      throw new Error('No user is currently logged in');
    }
    
    return this.preferencesService.updateAdultContentPreference(includeAdult, currentUser.token)
      .pipe(
        map(response => {
          // Update the user object with the new preference
          const updatedUser: User = {
            ...currentUser,
            includeAdult: response.user.includeAdult
          };
          
          // Update local storage and the behavior subject
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser);
          
          return updatedUser;
        })
      );
  }
}