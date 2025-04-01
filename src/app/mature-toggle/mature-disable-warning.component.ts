import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-mature-disable-warning',
  template: `
    <div class="disable-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h4>Disable Mature Content</h4>
          <button type="button" class="custom-close-btn" (click)="activeModal.dismiss()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="warning-icon">
            <i class="fas fa-eye-slash"></i>
          </div>
          
          <div class="warning-message">
            <p>Are you sure you want to disable mature content?</p>
            <p>This will filter out adult content from your search results and recommendations.</p>
            <p class="note">You can enable mature content again at any time from your profile settings.</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" (click)="activeModal.dismiss()">
            Cancel
          </button>
          <button type="button" class="btn btn-accent" (click)="activeModal.close('confirmed')">
            Yes, Disable Mature Content
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary-color: #682f76;
      --secondary-color: #f6f6f4;
      --accent-color: #b0e66b;
      --warning-color: #e20f0f;
      --dark-color: #07295f;
    }
    
    .disable-modal {
      color: var(--secondary-color);
    }
    
    .modal-content {
      background-color: var(--primary-color);
      border: 2px solid var(--accent-color);
    }
    
    .modal-header {
      border-bottom: none;
      padding: 1.5rem 1.5rem 0.5rem;
      position: relative;
    }
    
    .modal-header h4 {
      color: var(--secondary-color);
      font-weight: bold;
      font-size: 1.5rem;
      margin: 0 auto;
      text-align: center;
      width: 100%;
    }
    
    .custom-close-btn {
      position: absolute;
      right: 15px;
      top: 15px;
      background: transparent;
      border: none;
      color: var(--secondary-color);
      font-size: 1.2rem;
      cursor: pointer;
      transition: all 0.2s;
      padding: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 50%;
    }
    
    .custom-close-btn:hover {
      background-color: rgba(246, 246, 244, 0.1);
      transform: scale(1.1);
    }
    
    .modal-body {
      padding: 1rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .warning-icon {
      font-size: 3rem;
      color: var(--accent-color);
      margin-bottom: 1.5rem;
      height: 80px;
      width: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background-color: rgba(176, 230, 107, 0.1);
    }
    
    .warning-message {
      text-align: center;
    }
    
    .warning-message p {
      margin-bottom: 10px;
    }
    
    .note {
      font-size: 0.9rem;
      opacity: 0.7;
      font-style: italic;
      margin-top: 1rem;
    }
    
    .modal-footer {
      border-top: none;
      padding: 0.5rem 1.5rem 1.5rem;
      justify-content: center;
      gap: 1rem;
    }
    
    .btn-outline-secondary {
      color: var(--secondary-color);
      border-color: rgba(246, 246, 244, 0.3);
      transition: all 0.2s;
    }
    
    .btn-outline-secondary:hover {
      background-color: rgba(246, 246, 244, 0.1);
      color: var(--secondary-color);
    }
    
    .btn-accent {
      background-color: var(--accent-color);
      color: var(--dark-color);
      border: none;
      font-weight: bold;
      transition: all 0.3s;
    }
    
    .btn-accent:hover {
      background-color: #9ad455;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(176, 230, 107, 0.3);
    }
    
    @media (max-width: 576px) {
      .modal-header h4 {
        font-size: 1.3rem;
      }
      
      .modal-footer {
        flex-direction: column-reverse;
        align-items: stretch;
      }
    }
  `]
})
export class MatureDisableWarningComponent {
  constructor(public activeModal: NgbActiveModal) {}
}