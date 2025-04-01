// src/app/home/home.component.ts
import { Component, OnInit, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  isLoggedIn: boolean = false;
  isPro: boolean = false;
  private authSubscription: Subscription | undefined;
  private parallaxEnabled: boolean = true;
  private handleMouseMove: ((e: MouseEvent) => void) | null = null;
  private handleScroll: (() => void) | null = null;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // Check if user is logged in
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isPro = this.authService.currentUserValue?.isPro || false;

    // Subscribe to auth changes
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isPro = user?.isPro || false;
    });

    // Disable parallax on mobile devices for better performance
    if (window.innerWidth < 768) {
      this.parallaxEnabled = false;
    }
  }

  ngAfterViewInit(): void {
    // Initialize parallax effect
    this.initParallax();
    
    // Initialize 3D tilt effect for cards
    this.initTiltCards();
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    
    // Remove event listeners
    if (this.handleMouseMove) {
      window.removeEventListener('mousemove', this.handleMouseMove);
    }
    if (this.handleScroll) {
      window.removeEventListener('scroll', this.handleScroll);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    // Disable parallax on mobile devices
    if (window.innerWidth < 768) {
      this.parallaxEnabled = false;
    } else {
      this.parallaxEnabled = true;
      this.initParallax();
    }
  }

  private initParallax(): void {
    if (!this.parallaxEnabled) return;
    
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    
    // Parallax effect on mouse move
    this.handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX / window.innerWidth;
      const mouseY = e.clientY / window.innerHeight;
      
      parallaxLayers.forEach((layer: Element) => {
        const speed = (layer as HTMLElement).dataset['speed'] || '0';
        const x = (window.innerWidth - mouseX * parseInt(speed) * 100);
        const y = (window.innerHeight - mouseY * parseInt(speed) * 100);
        
        (layer as HTMLElement).style.transform = `translate3d(${x / 100}px, ${y / 100}px, 0)`;
      });
    };
    
    // Parallax effect on scroll
    this.handleScroll = () => {
      const scrollTop = window.pageYOffset;
      
      parallaxLayers.forEach((layer: Element) => {
        const speed = (layer as HTMLElement).dataset['speed'] || '0';
        const yPos = scrollTop * parseInt(speed);
        
        (layer as HTMLElement).style.transform = `translate3d(0, ${yPos}px, 0)`;
      });
    };
    
    if (this.handleMouseMove) {
      window.addEventListener('mousemove', this.handleMouseMove);
    }
    if (this.handleScroll) {
      window.addEventListener('scroll', this.handleScroll);
    }
  }

  private initTiltCards(): void {
    const cards = document.querySelectorAll('.tilt-card');
    
    cards.forEach(card => {
      card.addEventListener('mousemove', (e: any) => {
        const cardRect = card.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
        
        const rotateX = 20 * mouseY / (cardRect.height / 2);
        const rotateY = -20 * mouseX / (cardRect.width / 2);
        
        (card as HTMLElement).style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      });
      
      card.addEventListener('mouseleave', () => {
        (card as HTMLElement).style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
      });
    });
  }
}