// src/app/navbar/navbar.component.ts
import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { MovieService } from '../movie.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  theme: string = 'light'; // default theme
  includeAdult: boolean = false;
  
  constructor(
    private router: Router,
    public authService: AuthService, // Make it public to use in the template
    private movieService: MovieService
  ) {}
  
  ngOnInit(): void {
    // Subscribe to changes in the mature content setting
    this.movieService.includeAdult$.subscribe(value => {
      this.includeAdult = value;
    });
    
    // Initialize from stored value in MovieService
    this.includeAdult = this.movieService.getAdultContentSetting();
  }
  
  // Add scroll behavior to shrink navbar when scrolling
  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (window.scrollY > 50) {
      document.querySelector('.navbar')?.classList.add('scrolled');
    } else {
      document.querySelector('.navbar')?.classList.remove('scrolled');
    }
  }
  
  // Navigate to profile settings when mature content indicator is clicked
  navigateToProfileSettings(): void {
    if (this.authService.isLoggedIn()) {
      // If user is logged in, navigate to profile
      this.router.navigate(['/profile']);
    } else {
      // If not logged in, prompt them to login first
      if (confirm('You need to log in to change content settings. Would you like to log in now?')) {
        this.router.navigate(['/login'], { 
          queryParams: { returnUrl: '/profile' } 
        });
      }
    }
  }
  
  closeNavbar() {
    // Check if the navbar is expanded and viewport is mobile/tablet
    if (window.innerWidth < 992) {
      const navbarCollapse = document.querySelector('.navbar-collapse');
      if (navbarCollapse?.classList.contains('show')) {
        // Find the navbar toggler button and click it to close the navbar
        const navbarToggler = document.querySelector('.navbar-toggler') as HTMLElement;
        if (navbarToggler) {
          navbarToggler.click();
        }
      }
    }
  }

  toggleTheme() {
    const body = document.body;
    if (this.theme === 'light') {
      this.theme = 'dark';
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      this.theme = 'light';
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    }
  }
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}