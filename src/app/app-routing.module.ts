import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CategoryPickerComponent } from './category-picker/category-picker.component';
import { HomeComponent } from './home/home.component';
import { RandomMovieComponent } from './random-movie/random-movie.component';
import { ContactComponent } from './contact/contact.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'category/:type/:genre/:page', component: CategoryPickerComponent },
  { path: 'random', component: RandomMovieComponent },
  { path: 'contact', component: ContactComponent },
  { path: '', component: HomeComponent },
  { path: '**', component: PageNotFoundComponent },
  // write a lazy loaded route
  // { path: 'lazy', loadChildren: () => import('./lazy/lazy.module').then(m => m.LazyModule) },
  // Add more routes as needed
];
@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes), CommonModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
