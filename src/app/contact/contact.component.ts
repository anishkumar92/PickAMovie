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
  onSubmit() {
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
  }
}
