import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CategoryPickerComponent } from './category-picker/category-picker.component';
import { HomeComponent } from './home/home.component';
import { RandomMovieComponent } from './random-movie/random-movie.component';
import { ContactComponent } from './contact/contact.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'category', component: CategoryPickerComponent },
  { path: 'random', component: RandomMovieComponent },
  { path: 'contact', component: ContactComponent },
  { path: '', component: HomeComponent },
  { path: '*', component: HomeComponent },
  // Add more routes as needed
];
@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes), CommonModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
