// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

export interface User {
    id: string;
    name: string;
    email: string;
    token: string;
    isPro: boolean;
    favoriteMovies: number[]; // Array of movie IDs
  }

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Ideally, this would be an environment variable
  private apiUrl = 'https://moviedb-server.vercel.app/auth';
  
  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }
  
  private loadUserFromStorage() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
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
            favoriteMovies: response.user.favoriteMovies || []
          };
          
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
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
            favoriteMovies: []
          };
          
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(error => {
          console.error('Registration error:', error);
          throw error;
        })
      );
  }
  
  logout(): void {
    // For demo purposes, we'll just clear localStorage
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
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
  
  // In a real implementation, this would contact the backend
  upgradeToPro(): Observable<User> {
    // This is a mock implementation
    const user = this.currentUserValue;
    if (!user) {
      return of({} as User);
    }
    
    const updatedUser = {
      ...user,
      isPro: true
    };
    
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    this.currentUserSubject.next(updatedUser);
    return of(updatedUser);
  }

  // Method for canceling Pro membership
cancelPro(): Observable<User> {
  return this.http.put<any>(`${this.apiUrl}/users/cancel-pro`, {}).pipe(
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
}