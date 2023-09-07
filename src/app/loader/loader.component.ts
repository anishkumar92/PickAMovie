import { Component, Input } from '@angular/core';
import { LoadingService } from '../loading.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
})
export class LoaderComponent {
  isLoading: boolean = true;
  constructor(private loadingService: LoadingService) {}
  // isLoading: any = this.loader.isLoadingSubject;

  ngOnInit() {
    // Subscribe to the isLoading$ observable
    this.loadingService.isLoadingSubject.subscribe((isLoading) => {
      // You can access the loading state here
      if (isLoading) {
        this.isLoading = true;
        // The loader is active
        console.log('Loading...');
      } else {
        this.isLoading = false;

        // The loader is not active
        console.log('Not loading.');
      }
    });
  }
}
