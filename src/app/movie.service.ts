import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import API_KEY from 'apikey';

@Injectable({
  providedIn: 'root',
})
export class MovieService implements OnInit {
  private apiKey = API_KEY;
  private apiUrl = 'https://api.themoviedb.org/3';
  options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkYjQyOWQ1MjIyZjM5MTdjYzNhMmVjNWVkOTc3MjRiYyIsInN1YiI6IjY0ZjgzNDAxYThiMmNhMDBlMTU4ZTE4NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.6cy_92v0WQ5Z8eC4EMRUm3-XEtqVUEoCtehixx7n7yk',
    },
  };

  constructor(private http: HttpClient) {}
  ngOnInit() {
    // Use movieService methods here to fetch and display movie data
  }
  getPopularMovies(): Observable<any> {
    const url = `${this.apiUrl}/movie/popular?language=en-US'`;
    const params = new HttpParams().set('api_key', this.apiKey);

    return this.http.get(url, { params });
  }
  getMovieGenres(): Observable<any> {
    const url = `${this.apiUrl}/genre/movie/list?language=en-US'`;
    const params = new HttpParams().set('api_key', this.apiKey);
    return this.http.get(url, { params });
  }

  getMoviesForGenre(
    genreId: any,
    page: number,
    pageSize: number
  ): Observable<any> {
    let url = `${this.apiUrl}/discover/movie`;
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('include_adult', 'false')
      .set('include_video', 'false')
      .set('page', page.toString()) // Set the page number
      .set('sort_by', 'popularity.desc')
      .set('with_genres', genreId)
      .set('page_size', pageSize.toString()) // Set the page size
      .set('language', 'en-US');

    return this.http.get(url, { params });
  }

  getOneMovieDetails(id: number) {
    const url = `${this.apiUrl}/movie/${id}?language=en-US'`;
    const params = new HttpParams().set('api_key', this.apiKey);
    return this.http.get(url, { params });
  }
}
