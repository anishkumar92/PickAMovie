import { Component } from '@angular/core';

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
  onSubmit() {
    // Handle form submission here
    console.log('Form submitted with data:', this.formData);
    // You can add code here to send the form data to a server or perform other actions.
  }
}
