// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';

import { AppComponent } from './app.component';
import { MovieListComponent } from './movie-list/movie-list.component';
import { MovieSearchComponent } from './movie-search/movie-search.component';
import { MovieDetailsComponent } from './movie-details/movie-details.component';
import { CategoryPickerComponent } from './category-picker/category-picker.component';
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
import { MatureToggleComponent } from './mature-toggle/mature-toggle.component';

// Import new modules
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';

// Import new components
import { FavoritesComponent } from './favorites/favorites.component';
import { ProfileComponent } from './profile/profile.component';
import { FilterModule } from './filter/filter.module';
import { MatureDisableWarningComponent } from './mature-toggle/mature-disable-warning.component';
import { MatureWarningComponent } from './mature-toggle/mature-warning.component';

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
    MatureToggleComponent,
    MatureWarningComponent,
    MatureDisableWarningComponent,
    // Add new components
    FavoritesComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    PaginationModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    // Add new modules
    AuthModule,
    SharedModule,
    FilterModule
  ],
  providers: [
    LoadingService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true,
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}