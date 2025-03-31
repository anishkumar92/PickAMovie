import { Component } from '@angular/core';
import { MovieService } from '../movie.service';

@Component({
  selector: 'app-random-movie',
  templateUrl: './random-movie.component.html',
  styleUrls: ['./random-movie.component.scss'],
})
export class RandomMovieComponent {
  movieID = 1;
  movie: any;
  apiData: any;
  isFectching: boolean = true;
  showMovies: boolean = true;
  constructor(private movieService: MovieService) {
    this.initializeAPI();
  }

  onToggle() {
    this.showMovies = !this.showMovies;
  }

  getImageUrl(filePath: string | null): string {
    if (filePath) {
      const baseUrl = 'https://image.tmdb.org/t/p/';
      const imageSize = 'w500'; // Adjust the size as needed (e.g., w200, w300, original)
      return `${baseUrl}${imageSize}${filePath}`;
    } else {
      // Provide a fallback image URL or handle null values as needed
      return 'assets/no-image-available.png'; // Fallback image URL
    }
  }

  getGenres(genres: any[]): string {
    if (!genres || genres.length === 0) {
      return ''; // Return an empty string if no genres are provided
    }

    // Use the map() function to extract the genre names
    const genreNames = genres.map((genre) => genre.name);

    // Use the join() function to concatenate the genre names with a comma
    return genreNames.join(', ');
  }

  initializeAPI() {
    // this.movieService.getPopularMovies().subscribe((result) => {
    //   console.log('movie', result);
    //   this.apiData = result;
    // });
  }
  selectRandomMovie(): any {
    this.isFectching = false;
    this.movieService.getFlickDetails(this.showMovies, this.movieID).subscribe(
      (result) => {
        this.movie = result;
        this.isFectching = true;
      },
      (err) => {
        this.isFectching = true;

        alert('Hit Random Again ! the Movie wasnt Sutiable for all ages');
      }
    );
  }

  getRandomMovie() {
    this.isFectching = true;
    const totalPages = 100;
    this.movie = null;
    let randomPage = Math.floor(Math.random() * totalPages) + 1;
    this.movieService
      .getRandomFlick(this.showMovies, randomPage)
      .subscribe((result) => {
        this.apiData = result.results;
        const movieArray = Math.floor(Math.random() * this.apiData.length); // Assuming 20 movies per page
        this.movieID = this.apiData[movieArray].id;
        setTimeout(() => {
          this.selectRandomMovie();
        }, 10);
      });
  }
}
