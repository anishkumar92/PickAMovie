import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  theme: string = 'light'; // default theme
  constructor(private router: Router) {}
  closeNavbar() {
    const navbarToggler = document.querySelector(
      '.navbar-toggler'
    ) as HTMLElement;
    if (navbarToggler) {
      navbarToggler.click(); // Simulate a click on the navbar-toggler button to close the navbar
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
}
