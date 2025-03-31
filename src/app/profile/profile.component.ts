// src/app/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, User } from '../auth/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  showUpgradeModal = false;
  
  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/profile' } });
      return;
    }
    
    this.currentUser = this.authService.currentUserValue;
    
    // Check if we should show the upgrade modal
    this.route.queryParams.subscribe(params => {
      if (params['upgrade'] === 'true') {
        this.showUpgradeModal = true;
      }
    });
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
  
  upgradeToPro(): void {
    this.authService.upgradeToPro().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.showUpgradeModal = false;
        
        // Show success message
        alert('Congratulations! You are now a Pro user with unlimited favorites!');
      },
      error: (error) => {
        console.error('Upgrade error:', error);
        alert('Failed to upgrade. Please try again later.');
      }
    });
  }
  
  closeUpgradeModal(): void {
    this.showUpgradeModal = false;
    
    // Remove upgrade parameter from URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { upgrade: null },
      queryParamsHandling: 'merge'
    });
  }
  
  getRemainingFavorites(): number {
    return this.authService.getRemainingFavoriteSlots();
  }
  
  getTotalFavorites(): number {
    return this.currentUser?.favoriteMovies.length || 0;
  }
  
  getFavoritesPercentage(): number {
    if (this.currentUser?.isPro) return 0; // Pro users don't have a percentage
    return (this.getTotalFavorites() / 5) * 100;
  }
}