// src/app/filter/filter.component.ts
import { Component, OnInit, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { MovieService } from '../movie.service';
import { trigger, transition, style, animate } from '@angular/animations';

export interface FilterModel {
  sortBy: string;
  yearFrom: number | null;
  yearTo: number | null;
  runtimeMin: number | null;
  runtimeMax: number | null;
  voteMin: number | null;
  voteMax: number | null;
  voteCount: number;
  language: string;
  includeAdult: boolean;
  withProviders: number[];
}

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(-20px)', opacity: 0 }))
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class FilterComponent implements OnInit {
  @Input() showMovies: boolean = true;
  @Output() filterChanged = new EventEmitter<FilterModel>();
  
  isExpanded: boolean = false;
  includeAdult: boolean = false;
  currentYear: number = new Date().getFullYear();
  activeFiltersCount: number = 0;
  
  filterModel: FilterModel = {
    sortBy: 'popularity.desc',
    yearFrom: null,
    yearTo: null,
    runtimeMin: null,
    runtimeMax: null,
    voteMin: null,
    voteMax: null,
    voteCount: 0,
    language: '',
    includeAdult: false,
    withProviders: []
  };
  
  sortOptions = [
    { label: 'Popularity Descending', value: 'popularity.desc' },
    { label: 'Popularity Ascending', value: 'popularity.asc' },
    { label: 'Rating Descending', value: 'vote_average.desc' },
    { label: 'Rating Ascending', value: 'vote_average.asc' },
    { label: 'Release Date Descending', value: 'release_date.desc' },
    { label: 'Release Date Ascending', value: 'release_date.asc' },
    { label: 'Title (A-Z)', value: 'original_title.asc' },
    { label: 'Title (Z-A)', value: 'original_title.desc' }
  ];

  // These would be fetched from the API
  availableProviders: any[] = [
    { id: 8, name: 'Netflix', logo_path: '/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg' },
    { id: 9, name: 'Amazon Prime', logo_path: '/68MNrwlkpF7WnmNPXLah69CR5cb.jpg' },
    { id: 337, name: 'Disney+', logo_path: '/7rwgEs2mJrYYZnOV2cH6S3rYmFG.jpg' },
    { id: 384, name: 'HBO Max', logo_path: '/aS2zvJWn9mwiCOeaaCkIh4wleZS.jpg' },
    { id: 2, name: 'Apple TV', logo_path: '/peURlLlr8jggOwK53fJ5wdQl05y.jpg' },
    { id: 3, name: 'Hulu', logo_path: '/giwM8XX4V2AQb9vsoN7yti82tKK.jpg' }
  ];
  
  languages = [
    { iso_639_1: 'en', english_name: 'English' },
    { iso_639_1: 'es', english_name: 'Spanish' },
    { iso_639_1: 'fr', english_name: 'French' },
    { iso_639_1: 'de', english_name: 'German' },
    { iso_639_1: 'it', english_name: 'Italian' },
    { iso_639_1: 'ja', english_name: 'Japanese' },
    { iso_639_1: 'ko', english_name: 'Korean' },
    { iso_639_1: 'zh', english_name: 'Chinese' },
    { iso_639_1: 'ru', english_name: 'Russian' },
    { iso_639_1: 'pt', english_name: 'Portuguese' },
    { iso_639_1: 'hi', english_name: 'Hindi' }
  ];

// Add to filter.component.ts
@HostListener('document:click', ['$event'])
clickOutside(event: Event) {
  if (this.isExpanded && !this.elementRef.nativeElement.contains(event.target)) {
    this.isExpanded = false;
  }
}

// Make sure to inject ElementRef in constructor
constructor(
  private movieService: MovieService,
  private elementRef: ElementRef
) { }

  ngOnInit(): void {
    // Check if adult content is enabled in settings
    this.includeAdult = this.movieService.getAdultContentSetting();
    
    // Subscribe to changes in the adult content setting
    this.movieService.includeAdult$.subscribe(value => {
      this.includeAdult = value;
      // If adult setting is disabled, ensure the filter is also disabled
      if (!value) {
        this.filterModel.includeAdult = false;
      }
    });
    
    // Load filters from service (if they exist)
    this.loadSavedFilters();
    
    // In a real implementation, you would fetch watch providers and languages
    this.loadWatchProviders();
    this.loadLanguages();
    
    // Calculate active filters count
    this.updateActiveFiltersCount();
  }
  
  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }
  
  toggleProvider(providerId: number, event: any): void {
    const checked = event.target.checked;
    
    if (checked) {
      // Add provider if not already in array
      if (!this.filterModel.withProviders.includes(providerId)) {
        this.filterModel.withProviders.push(providerId);
      }
    } else {
      // Remove provider if in array
      this.filterModel.withProviders = this.filterModel.withProviders.filter(id => id !== providerId);
    }
    
    this.updateActiveFiltersCount();
  }
  
  resetFilters(): void {
    this.filterModel = {
      sortBy: 'popularity.desc',
      yearFrom: null,
      yearTo: null,
      runtimeMin: null,
      runtimeMax: null,
      voteMin: null,
      voteMax: null,
      voteCount: 0,
      language: '',
      includeAdult: false,
      withProviders: []
    };
    
    this.updateActiveFiltersCount();
    this.saveFilters();
    this.filterChanged.emit(this.filterModel);
  }
  
  applyFilters(): void {
    // Save filters to service for persistence
    this.saveFilters();
    
    // Close the filter panel
    this.isExpanded = false;
    
    // Emit the filter event with current values
    this.filterChanged.emit(this.filterModel);
  }
  
  // Clear specific filter sections
  clearYearFilters(): void {
    this.filterModel.yearFrom = null;
    this.filterModel.yearTo = null;
    this.updateActiveFiltersCount();
    this.applyFilters();
  }
  
  clearRatingFilters(): void {
    this.filterModel.voteMin = null;
    this.filterModel.voteMax = null;
    this.updateActiveFiltersCount();
    this.applyFilters();
  }
  
  clearVoteCountFilter(): void {
    this.filterModel.voteCount = 0;
    this.updateActiveFiltersCount();
    this.applyFilters();
  }
  
  clearRuntimeFilters(): void {
    this.filterModel.runtimeMin = null;
    this.filterModel.runtimeMax = null;
    this.updateActiveFiltersCount();
    this.applyFilters();
  }
  
  clearProviderFilters(): void {
    this.filterModel.withProviders = [];
    this.updateActiveFiltersCount();
    this.applyFilters();
  }
  
  // Get readable label for current sort option
  getSortLabel(): string {
    const option = this.sortOptions.find(opt => opt.value === this.filterModel.sortBy);
    return option ? option.label : 'Popularity';
  }
  
  // Update active filters count
  updateActiveFiltersCount(): void {
    let count = 0;
    
    // Count each active filter
    if (this.filterModel.yearFrom || this.filterModel.yearTo) count++;
    if ((this.filterModel.voteMin !== null && this.filterModel.voteMin > 0) || 
        (this.filterModel.voteMax !== null && this.filterModel.voteMax < 10)) count++;
    if (this.filterModel.voteCount > 0) count++;
    if (this.showMovies && ((this.filterModel.runtimeMin !== null && this.filterModel.runtimeMin > 0) || (this.filterModel.runtimeMax !== null && this.filterModel.runtimeMax < 300))) count++;
    if (this.filterModel.withProviders.length > 0) count++;
    if (this.filterModel.sortBy !== 'popularity.desc') count++;
    
    this.activeFiltersCount = count;
  }
  
  // Methods to fetch data from API (implementation would depend on your service)
  private loadWatchProviders(): void {
    // In a real implementation, you'd use your movie service to fetch these
    // this.movieService.getWatchProviders().subscribe(providers => {
    //   this.availableProviders = providers;
    // });
  }
  
  private loadLanguages(): void {
    // Similarly, in a real implementation:
    // this.movieService.getLanguages().subscribe(languages => {
    //   this.languages = languages;
    // });
  }
  
  // Methods to save and load filter state
  private saveFilters(): void {
    // You can save to localStorage, or use a dedicated filter service
    localStorage.setItem('movieFilters', JSON.stringify({
      ...this.filterModel,
      isMovie: this.showMovies
    }));
    
    // Update service filter options
    for (const [key, value] of Object.entries(this.filterModel)) {
      if (['sortBy', 'language', 'includeAdult'].includes(key)) {
        this.movieService.setFilterOption(key, value);
      }
    }
    
    // Special handling for year filter
    if (this.filterModel.yearFrom || this.filterModel.yearTo) {
      const yearFilter: { primaryReleaseDateGte?: string; primaryReleaseDateLte?: string } = {};
      if (this.filterModel.yearFrom) {
        yearFilter['primaryReleaseDateGte'] = `${this.filterModel.yearFrom}-01-01`;
      }
      if (this.filterModel.yearTo) {
        yearFilter['primaryReleaseDateLte'] = `${this.filterModel.yearTo}-12-31`;
      }
      this.movieService.setFilterOption('year', yearFilter);
    } else {
      this.movieService.setFilterOption('year', null);
    }
    
    // Special handling for vote average
    if (this.filterModel.voteMin !== null || this.filterModel.voteMax !== null) {
      const voteFilter: { voteAverageGte?: number; voteAverageLte?: number } = {};
      if (this.filterModel.voteMin !== null) {
        voteFilter['voteAverageGte'] = this.filterModel.voteMin;
      }
      if (this.filterModel.voteMax !== null) {
        voteFilter['voteAverageLte'] = this.filterModel.voteMax;
      }
      this.movieService.setFilterOption('voteAverage', voteFilter);
    } else {
      this.movieService.setFilterOption('voteAverage', null);
    }
    
    // Set vote count
    this.movieService.setFilterOption('voteCount', this.filterModel.voteCount > 0 ? 
      { 'voteCountGte': this.filterModel.voteCount } : null);
    
    // Set providers
    this.movieService.setFilterOption('withWatchProviders', 
      this.filterModel.withProviders.length > 0 ? this.filterModel.withProviders.join('|') : null);
    
    // Set runtime filter (movies only)
    if (this.showMovies && (this.filterModel.runtimeMin !== null || this.filterModel.runtimeMax !== null)) {
      const runtimeFilter: { runtimeGte?: number; runtimeLte?: number } = {};
      if (this.filterModel.runtimeMin !== null) {
        runtimeFilter['runtimeGte'] = this.filterModel.runtimeMin;
      }
      if (this.filterModel.runtimeMax !== null) {
        runtimeFilter['runtimeLte'] = this.filterModel.runtimeMax;
      }
      this.movieService.setFilterOption('runtime', runtimeFilter);
    } else {
      this.movieService.setFilterOption('runtime', null);
    }
    
    // Finally, set the sort option
    this.movieService.setSortBy(this.filterModel.sortBy);
  }
  
  private loadSavedFilters(): void {
    // Load from localStorage or from the movie service
    const savedFilters = localStorage.getItem('movieFilters');
    
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        
        // Only apply if the filters were saved for the same content type (movie/tv)
        if (parsedFilters.isMovie === this.showMovies) {
          this.filterModel = {
            ...this.filterModel,
            ...parsedFilters
          };
        }
      } catch (e) {
        console.error('Error loading saved filters:', e);
        localStorage.removeItem('movieFilters');
      }
    } else {
      // Try to load from service
      this.filterModel.sortBy = this.movieService.getSortBy();
      
      // Load other filters if set
      const yearFilter = this.movieService.getFilterOption('year');
      if (yearFilter) {
        if (yearFilter.primaryReleaseDateGte) {
          this.filterModel.yearFrom = parseInt(yearFilter.primaryReleaseDateGte.split('-')[0], 10);
        }
        if (yearFilter.primaryReleaseDateLte) {
          this.filterModel.yearTo = parseInt(yearFilter.primaryReleaseDateLte.split('-')[0], 10);
        }
      }
      
      const voteFilter = this.movieService.getFilterOption('voteAverage');
      if (voteFilter) {
        this.filterModel.voteMin = voteFilter.voteAverageGte || null;
        this.filterModel.voteMax = voteFilter.voteAverageLte || null;
      }
      
      const voteCountFilter = this.movieService.getFilterOption('voteCount');
      if (voteCountFilter && voteCountFilter.voteCountGte) {
        this.filterModel.voteCount = voteCountFilter.voteCountGte;
      }
      
      const providersFilter = this.movieService.getFilterOption('withWatchProviders');
      if (providersFilter) {
        const providersFilter: string = this.movieService.getFilterOption('withWatchProviders') as string;
        this.filterModel.withProviders = providersFilter.split('|').map((id: string): number => parseInt(id, 10));
      }
      
      if (this.showMovies) {
        const runtimeFilter = this.movieService.getFilterOption('runtime');
        if (runtimeFilter) {
          this.filterModel.runtimeMin = runtimeFilter.runtimeGte || null;
          this.filterModel.runtimeMax = runtimeFilter.runtimeLte || null;
        }
      }
      
      this.filterModel.language = this.movieService.getFilterOption('language') || '';
      this.filterModel.includeAdult = this.movieService.getFilterOption('includeAdult') || false;
    }
    
    // Calculate active filters count after loading
    this.updateActiveFiltersCount();
  }
}