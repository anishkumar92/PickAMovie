// src/app/navbar/navbar.component.ts
import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  theme: string = 'light'; // default theme
  
  constructor(
    private router: Router,
    public authService: AuthService // Make it public to use in the template
  ) {}
  
  // Add scroll behavior to shrink navbar when scrolling
  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (window.scrollY > 50) {
      document.querySelector('.navbar')?.classList.add('scrolled');
    } else {
      document.querySelector('.navbar')?.classList.remove('scrolled');
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