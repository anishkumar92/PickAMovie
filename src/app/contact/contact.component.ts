import { Component } from '@angular/core';
import { MovieService } from '../movie.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent {
  formData = {
    name: '',
    email: '',
    message: '',
  };
  constructor(private movieService: MovieService) {}
  onSubmit(contactForm: any): void {
    if (contactForm.valid) {
      this.movieService.sendEmail(this.formData).subscribe({
        next: (data) => console.log('res', data),
        error: (error) => console.error('There was an error!', error),
      });
      this.formData = {
        name: '',
        email: '',
        message: '',
      };
      alert('Your message has been sent!');
    } else {
      // Form is invalid, display error messages or handle as needed.
      console.log('Form is invalid. Please check the fields.');
    }
  }
}
