// src/app/shared/favorite-button/favorite-button.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FavoritesService } from '../../favorites/favorites.service';
import { AuthService } from '../../services/auth.service';
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
  animateParticles: boolean = false;
  
  constructor(
    private favoritesService: FavoritesService,
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.checkFavoriteStatus();
    
    // Set random directions for particles
    this.setupParticles();
    
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
  
  setupParticles(): void {
    // Set random directions for particles using CSS variables
    setTimeout(() => {
      const particles = document.querySelectorAll('.particle');
      particles.forEach(particle => {
        const el = particle as HTMLElement;
        el.style.setProperty('--x', (Math.random() * 2 - 1).toFixed(2));
        el.style.setProperty('--y', (Math.random() * 2 - 1).toFixed(2));
      });
    }, 0);
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
    
    // Trigger particle animation when adding to favorites (not when removing)
    if (!this.isFavorite) {
      this.animateParticles = true;
      setTimeout(() => {
        this.animateParticles = false;
      }, 600); // Match animation duration
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