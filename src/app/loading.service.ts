import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  public isLoadingSubject = new Subject<boolean>();
  isLoading: boolean = false;

  showLoader() {
    this.isLoading = true;
    this.isLoadingSubject.next(true);
  }

  hideLoader() {
    this.isLoading = false;
    this.isLoadingSubject.next(false);
  }
}
