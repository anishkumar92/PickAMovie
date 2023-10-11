import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  constructor(private router: Router) {}
  closeNavbar() {
    const navbarToggler = document.querySelector(
      '.navbar-toggler'
    ) as HTMLElement;
    if (navbarToggler) {
      navbarToggler.click(); // Simulate a click on the navbar-toggler button to close the navbar
    }
  }
}
