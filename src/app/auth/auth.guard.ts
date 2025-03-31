// src/app/auth/auth.guard.ts
import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const currentUser = this.authService.currentUserValue;
    
    if (currentUser) {
      // Check if route requires pro subscription
      if (route.data['requiresPro'] && !currentUser.isPro) {
        // Redirect to upgrade page
        this.router.navigate(['/profile'], { 
          queryParams: { returnUrl: state.url, upgrade: true }
        });
        return false;
      }
      
      // Logged in
      return true;
    }
    
    // Not logged in, redirect to login with return url
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}