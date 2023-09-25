import { Component } from '@angular/core';
import { Banner } from './model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'movie-suggestion-app';
  banner: Banner;
  constructor() {
    this.banner = new Banner(
      'ca-pub-8666369027477672',
      8059182400,
      'auto',
      true
    );
  }
}
