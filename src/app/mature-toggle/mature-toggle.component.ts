import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MovieService } from '../movie.service';

@Component({
  selector: 'app-mature-toggle',
  templateUrl: './mature-toggle.component.html',
  styleUrls: ['./mature-toggle.component.scss']
})
export class MatureToggleComponent implements OnInit {
  includeAdult: boolean = false;

  constructor(
    private movieService: MovieService, 
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    // Initialize from service
    this.includeAdult = this.movieService.getAdultContentSetting();
  }

  toggleAdultContent(event: any): void {
    const isChecked = event.target.checked;
    
    if (isChecked) {
      // Show confirmation modal
      const modalRef = this.modalService.open(MatureContentWarningComponent);
      
      modalRef.result.then((result) => {
        if (result === 'confirmed') {
          // User confirmed, update the service
          this.includeAdult = true;
          this.movieService.toggleAdultContent(true);
        } else {
          // User declined, revert the toggle
          this.includeAdult = false;
          event.target.checked = false;
        }
      }, (reason) => {
        // Modal dismissed, revert the toggle
        this.includeAdult = false;
        event.target.checked = false;
      });
    } else {
      // User is turning it off, no confirmation needed
      this.includeAdult = false;
      this.movieService.toggleAdultContent(false);
    }
  }
}

// Warning Modal Component
@Component({
  selector: 'mature-content-warning',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Enable Adult Content?</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss('cancel')"></button>
    </div>
    <div class="modal-body">
      <div class="warning-icon"><i class="fas fa-exclamation-triangle"></i></div>
      <p class="warning-text">You are about to enable mature content which may include adult themes, 
      strong language, and explicit content not suitable for minors.</p>
      <p class="warning-text">Are you sure you want to continue?</p>
      <p class="disclaimer">By enabling this content, you confirm that you are of legal age 
      to view mature content in your country or region.</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-secondary" (click)="activeModal.dismiss('cancel')">Cancel</button>
      <button type="button" class="btn btn-danger" (click)="activeModal.close('confirmed')">Enable Mature Content</button>
    </div>
  `,
  styles: [`
    .modal-header {
      background-color: var(--warning-color);
      color: var(--secondary-color);
      padding: 15px 20px;
    }
    
    .modal-title {
      font-weight: bold;
      font-size: 1.4rem;
    }
    
    .btn-close {
      color: var(--secondary-color);
      opacity: 0.8;
    }
    
    .modal-body {
      background-color: var(--black-color);
      color: var(--secondary-color);
      padding: 25px;
    }
    
    .warning-icon {
      font-size: 3rem;
      color: var(--warning-color);
      text-align: center;
      margin-bottom: 1.5rem;
    }
    
    .warning-text {
      font-size: 1.1rem;
      margin-bottom: 15px;
      line-height: 1.5;
    }
    
    .disclaimer {
      font-size: 0.9rem;
      font-style: italic;
      color: var(--secondary-color);
      opacity: 0.8;
      margin-top: 20px;
      border-top: 1px solid rgba(246, 246, 244, 0.2);
      padding-top: 15px;
    }
    
    .modal-footer {
      background-color: var(--black-color);
      border-top: none;
      padding: 15px 20px 25px;
    }
    
    .btn-outline-secondary {
      color: var(--secondary-color);
      border-color: var(--secondary-color);
    }
    
    .btn-outline-secondary:hover {
      background-color: rgba(246, 246, 244, 0.1);
      color: var(--secondary-color);
    }
    
    .btn-danger {
      background-color: var(--warning-color);
      border-color: var(--warning-color);
      color: var(--secondary-color);
    }
    
    .btn-danger:hover {
      background-color: #c41b1b;
      border-color: #c41b1b;
    }
  `]
})
export class MatureContentWarningComponent {
  constructor(public activeModal: NgbActiveModal) {}
}