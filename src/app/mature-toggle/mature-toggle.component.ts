import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { UserPreferencesService } from '../services/user-preferences.service';
import { AuthService } from '../services/auth.service';
import { MatureDisableWarningComponent } from './mature-disable-warning.component';
import { MatureWarningComponent } from './mature-warning.component';

@Component({
  selector: 'app-mature-toggle',
  templateUrl: './mature-toggle.component.html',
  styleUrls: ['./mature-toggle.component.scss']
})
export class MatureToggleComponent implements OnInit, OnDestroy {
  includeAdult: boolean = false;
  private preferenceSubscription: Subscription | null = null;

  constructor(
    private preferencesService: UserPreferencesService,
    private authService: AuthService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    // Get initial value
    this.includeAdult = this.preferencesService.getAdultContentSetting();
    
    // Subscribe to changes
    this.preferenceSubscription = this.preferencesService.includeAdult$.subscribe(value => {
      this.includeAdult = value;
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.preferenceSubscription) {
      this.preferenceSubscription.unsubscribe();
    }
  }

  toggleAdultContent(event: any): void {
    const isChecked = event.target.checked;
    
    if (isChecked) {
      // Show confirmation modal for ENABLING mature content
      const enableModalRef = this.modalService.open(MatureWarningComponent, {
        centered: true,
        backdrop: 'static',
        windowClass: 'mature-warning-modal'
      });
      
      enableModalRef.result.then((result) => {
        if (result === 'confirmed') {
          // User confirmed, update and save
          this.updateSettings(true);
        } else {
          // User declined, revert the toggle
          event.target.checked = false;
        }
      }, (reason) => {
        // Modal dismissed, revert the toggle
        event.target.checked = false;
      });
    } else {
      // Show confirmation modal for DISABLING mature content
      const disableModalRef = this.modalService.open(MatureDisableWarningComponent, {
        centered: true,
        backdrop: 'static',
        windowClass: 'mature-disable-modal'
      });
      
      disableModalRef.result.then((result) => {
        if (result === 'confirmed') {
          // User confirmed, update the setting
          this.updateSettings(false);
        } else {
          // User declined, revert the toggle back to checked
          event.target.checked = true;
        }
      }, (reason) => {
        // Modal dismissed, revert the toggle back to checked
        event.target.checked = true;
      });
    }
  }
  
  private updateSettings(value: boolean): void {
    if (this.authService.isLoggedIn()) {
      // If user is logged in, update on server
      this.authService.updateAdultContentPreference(value).subscribe({
        next: () => {
          // Server update successful, update local setting
          this.preferencesService.setAdultContentSetting(value);
          // Optional: provide visual feedback
          this.showFeedback(value);
        },
        error: (error) => {
          console.error('Error updating mature content setting:', error);
          // Revert the toggle in case of error
          this.includeAdult = !value; // Update UI
          // Show error notification
          alert('Failed to update content settings. Please try again.');
        }
      });
    } else {
      // For anonymous users, just update locally
      this.preferencesService.setAdultContentSetting(value);
      // Optional: provide visual feedback
      this.showFeedback(value);
    }
  }
  
  /**
   * Shows feedback toast or notification after successful update
   */
  private showFeedback(enabled: boolean): void {
    const message = enabled 
      ? 'Mature content has been enabled. You will now see adult content in search results.'
      : 'Mature content has been disabled. Adult content will be filtered from your results.';
      
    // Use a simple alert for now, but could be replaced with a toast notification
    // if you have a toast service implemented
    // this.toastService.show(message, { classname: 'bg-success text-light', delay: 3000 });
    
    // Simple feedback (remove this if you implement a toast)
    console.log('Setting updated:', message);
  }
}