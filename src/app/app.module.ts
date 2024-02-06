import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { MovieListComponent } from './movie-list/movie-list.component';
import { MovieSearchComponent } from './movie-search/movie-search.component';
import { MovieDetailsComponent } from './movie-details/movie-details.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CategoryPickerComponent } from './category-picker/category-picker.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { FormsModule } from '@angular/forms';
import { LoaderInterceptor } from './loading.interceptor';
import { LoaderComponent } from './loader/loader.component';
import { LoadingService } from './loading.service';
import { AppRoutingModule } from './app-routing.module';
import { NavbarComponent } from './navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { RandomMovieComponent } from './random-movie/random-movie.component';
import { ContactComponent } from './contact/contact.component';
import { BannerComponent } from './banner/banner.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    MovieDetailsComponent,
    MovieListComponent,
    MovieSearchComponent,
    CategoryPickerComponent,
    LoaderComponent,
    NavbarComponent,
    HomeComponent,
    RandomMovieComponent,
    ContactComponent,
    BannerComponent,
    PageNotFoundComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    PaginationModule.forRoot(),
    FormsModule,
    AppRoutingModule,
  ],
  providers: [
    LoadingService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
