// src/app/shared/favorite-button/favorite-button.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FavoritesService } from '../../favorites/favorites.service';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-favorite-button',
  templateUrl: './favorite-button.component.html',
  styleUrls: ['./favorite-button.component.scss']
})
export class FavoriteButtonComponent implements OnInit {
  @Input() movieId: number = 0;
  @Input() isMovie: boolean = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  
  isFavorite: boolean = false;
  isProcessing: boolean = false;
  limitReached: boolean = false;
  
  constructor(
    private favoritesService: FavoritesService,
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.checkFavoriteStatus();
    
    // Subscribe to favorite changes
    this.favoritesService.getFavorites().subscribe(favorites => {
      this.isFavorite = favorites.includes(this.movieId);
      this.limitReached = !this.authService.canAddFavorite();
    });
  }
  
  private checkFavoriteStatus(): void {
    this.isFavorite = this.favoritesService.isFavorite(this.movieId);
    this.limitReached = !this.authService.canAddFavorite();
  }
  
  toggleFavorite(event: Event): void {
    event.stopPropagation(); // Prevent click from propagating to parent
    
    // If not logged in, redirect to login
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: this.router.url } 
      });
      return;
    }
    
    // If trying to add but limit reached
    if (!this.isFavorite && this.limitReached) {
      // Redirect to profile with upgrade parameter
      this.router.navigate(['/profile'], { 
        queryParams: { upgrade: true } 
      });
      return;
    }
    
    this.isProcessing = true;
    
    this.favoritesService.toggleFavorite(this.movieId, this.isMovie)
      .subscribe({
        next: (isNowFavorite) => {
          this.isFavorite = isNowFavorite;
          this.isProcessing = false;
        },
        error: (error) => {
          console.error('Error toggling favorite:', error);
          this.isProcessing = false;
        }
      });
  }
  
  getRemainingFavorites(): number {
    return this.authService.getRemainingFavoriteSlots();
  }
}