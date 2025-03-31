import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoadingService } from './loading.service';

// import API_KEY from 'apikey';

@Injectable({
  providedIn: 'root',
})
export class MovieService implements OnInit {
  // private apiKey = API_KEY;
  isLoading: boolean = true;
  // private baseUrl = 'http://localhost:5000/api/tmdb-proxy';
  private baseUrl = 'https://moviedb-server.vercel.app/tmdb-proxy';

  private apiUrl = 'https://api.themoviedb.org/3';
  // options = {
  //   method: 'GET',
  //   headers: {
  //     accept: 'application/json',
  //     Authorization:
  //       'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkYjQyOWQ1MjIyZjM5MTdjYzNhMmVjNWVkOTc3MjRiYyIsInN1YiI6IjY0ZjgzNDAxYThiMmNhMDBlMTU4ZTE4NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.6cy_92v0WQ5Z8eC4EMRUm3-XEtqVUEoCtehixx7n7yk',
  //   },
  // };

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService
  ) {}
  ngOnInit() {}

  getGenres(showMovies: boolean): Observable<any> {
    const url = `${this.baseUrl}`; // Use the server-side proxy route
    const params = new HttpParams().set(
      'url',
      `${this.apiUrl}/genre/${showMovies ? 'movie' : 'tv'}/list?language=en-US`
    );
    // .set('api_key', this.apiKey);
    return this.http.get(url, { params });
  }
  getFlickForGenre(
    showMovies: boolean,
    genreId: any,
    page: number,
    pageSize: number
  ): Observable<any> {
    const url = `${this.baseUrl}`;
    const params = new HttpParams()
      .set('url', `${this.apiUrl}/discover/${showMovies ? 'movie' : 'tv'}`)
      .set('include_adult', 'false')
      .set('include_video', 'false')
      .set('page', page.toString())
      .set('sort_by', 'popularity.desc')
      .set('with_genres', genreId)
      .set('page_size', pageSize.toString())
      .set('language', 'en-US');

    return this.http.get(url, { params });
  }

  getFlickDetails(showMovies: boolean, id: number) {
    const url = `${this.baseUrl}`;
    const params = new HttpParams().set(
      'url',
      `${this.apiUrl}/${
        showMovies ? 'movie' : 'tv'
      }/${id}?include_adult=false&language=en-US'`
    );
    return this.http.get(url, { params });
  }

  getRandomFlick(showMovies: boolean, pageno = 1): Observable<any> {
    const url = `${this.baseUrl}`;
    const params = new HttpParams().set(
      'url',
      `${this.apiUrl}/${
        showMovies ? 'movie' : 'tv'
      }/popular?page=${pageno.toString()}&include_adult=false&language=en-US'`
    );
    return this.http.get(url, { params });
  }

  //
  sendEmail(formData: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    console.log('form', formData);
    const url = `https://moviedb-server.vercel.app/send-email`;
    return this.http.post(url, formData, httpOptions);
  }

  // Add this method to your existing MovieService class in flick-fetch.service.ts

searchFlicks(query: string, showMovies: boolean, page: number = 1): Observable<any> {
  const url = `${this.baseUrl}`;
  const params = new HttpParams()
    .set('url', `${this.apiUrl}/search/${showMovies ? 'movie' : 'tv'}`)
    .set('query', query)
    .set('include_adult', 'false')
    .set('language', 'en-US')
    .set('page', page.toString());

  return this.http.get(url, { params });
}

}
