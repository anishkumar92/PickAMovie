// src/app/services/user-preferences.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  // BehaviorSubject for adult content preference
  private includeAdultSubject = new BehaviorSubject<boolean>(false);
  
  // Public observable that components can subscribe to
  public includeAdult$ = this.includeAdultSubject.asObservable();
  
  // Base URL for backend API
  private baseUrl = 'https://moviedb-server.vercel.app';
  
  constructor(private http: HttpClient) {
    this.initializeAdultContentPreference();
  }
  
  /**
   * Initialize the adult content preference from localStorage
   */
  private initializeAdultContentPreference(): void {
    const storedValue = localStorage.getItem('includeAdult');
    const includeAdult = storedValue === 'true';
    this.includeAdultSubject.next(includeAdult);
  }
  
  /**
   * Get the current adult content preference
   */
  getAdultContentSetting(): boolean {
    return this.includeAdultSubject.value;
  }
  
  /**
   * Toggle adult content preference locally
   * This method doesn't update the server, only local state
   */
  setAdultContentSetting(include: boolean): void {
    localStorage.setItem('includeAdult', include.toString());
    this.includeAdultSubject.next(include);
  }
  
  /**
   * Update adult content preference on the server
   * @param includeAdult Boolean indicating whether to include adult content
   * @param userId User ID for authenticated users
   * @returns Observable of the server response
   */
  updateAdultContentPreference(includeAdult: boolean, token: string): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/users/preferences/adult-content`, 
      { includeAdult },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    ).pipe(
      map(response => {
        // Update local storage and subject with the server response
        localStorage.setItem('includeAdult', response.user.includeAdult.toString());
        this.includeAdultSubject.next(response.user.includeAdult);
        return response;
      }),
      catchError(error => {
        console.error('Error updating adult content preference:', error);
        throw error;
      })
    );
  }
  
  /**
   * Get all user preferences as a single object
   * This could be expanded to include other preferences besides adult content
   */
  getAllPreferences(): { includeAdult: boolean } {
    return {
      includeAdult: this.getAdultContentSetting()
    };
  }
}