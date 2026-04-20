import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import type { DropdownOption } from '../../shared/custom-dropdown/custom-dropdown.component';
import { CustomDropdownModule } from '../../shared/custom-dropdown/custom-dropdown.module';
import { environment } from '../../../environments/environment';

interface LeagueApiResponse {
  leagueId: number;
  leagueName: string;
  clubs: unknown[] | null;
}

interface ClubApiResponse {
  clubId: number;
  clubName: string;
  leagueId: number;
  league: unknown | null;
}

interface PlayerFilterQuery {
  name?: string;
  position?: string;
  leagueId?: number;
  clubId?: number;
  nationality?: string;
  minAge?: number;
  maxAge?: number;
  minMP?: number;
  minStarts?: number;
  minMinutes?: number;
  min90s?: number;
  minGoals?: number;
  minAssists?: number;
  minGPlusA?: number;
  minXG?: number;
  minXAG?: number;
  minNpxG?: number;
  minGMinusPK?: number;
  minTackles?: number;
  minTklW?: number;
  minBlocks?: number;
  minInterceptions?: number;
  minTklInt?: number;
  minClearances?: number;
  minErrors?: number;
  minProgPasses?: number;
  minProgCarries?: number;
  minKeyPasses?: number;
  minPPA?: number;
  minTouches?: number;
  minCarries?: number;
  minProgRunsRec?: number;
  minMiscontrols?: number;
  minDispossessed?: number;
  minGA?: number;
  minSaves?: number;
  minSavePct?: number;
  minCS?: number;
  minCSPct?: number;
  minYellowCards?: number;
  minRedCards?: number;
  minPKWon?: number;
  minPKCon?: number;
  minRecoveries?: number;
  page: number;
  pageSize: number;
}

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [ReactiveFormsModule, MatIcon, CustomDropdownModule],
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css']
})
export class FiltersComponent implements OnInit {
  private readonly API_BASE_URL = `${environment.apiBaseUrl}/api/players`;
  private readonly MIN_ZERO_VALIDATOR = [Validators.min(0)];

  private readonly statFieldMap: Record<string, keyof PlayerFilterQuery> = {
    MP: 'minMP',
    Starts: 'minStarts',
    Minutes: 'minMinutes',
    Minutes90s: 'min90s',
    GoalsScored: 'minGoals',
    AssitsProvided: 'minAssists',
    GPlusA: 'minGPlusA',
    ExpectedGoals: 'minXG',
    ExpectedAssistes: 'minXAG',
    NpxG: 'minNpxG',
    GMinusPK: 'minGMinusPK',
    TotalTackels: 'minTackles',
    TklW: 'minTklW',
    BlocksMade: 'minBlocks',
    Interceptions: 'minInterceptions',
    TklInt: 'minTklInt',
    Clearances: 'minClearances',
    Errors: 'minErrors',
    Progressivepasses: 'minProgPasses',
    ProgCarries: 'minProgCarries',
    KeyPasses: 'minKeyPasses',
    PassesIntothePenaltyArea: 'minPPA',
    Touches: 'minTouches',
    Carries: 'minCarries',
    ProgRunsRec: 'minProgRunsRec',
    Miscontrols: 'minMiscontrols',
    Dispossessed: 'minDispossessed',
    GA: 'minGA',
    SavesMade: 'minSaves',
    SavePct: 'minSavePct',
    CleanSheates: 'minCS',
    CSPct: 'minCSPct',
    YellowCards: 'minYellowCards',
    RedCards: 'minRedCards',
    PKWon: 'minPKWon',
    PKCon: 'minPKCon',
    Recoveries: 'minRecoveries'
  };

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  @Output() filtersApplied = new EventEmitter<Record<string, string | number>>();

  leagues: LeagueApiResponse[] = [];
  clubs: ClubApiResponse[] = [];
  nationalities: string[] = [];
  filteredClubs: ClubApiResponse[] = [];

  positionOptions: DropdownOption[] = [];
  leagueOptions: DropdownOption[] = [];
  nationalityOptions: DropdownOption[] = [];
  clubOptions: DropdownOption[] = [];

  filtersForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadPositions();
    this.loadLeagues();
    this.loadNationalities();
    this.loadClubs();

    this.filtersForm.get('league')?.valueChanges.subscribe(leagueIdValue => {
      const selectedLeagueId = this.toOptionalPositiveNumber(leagueIdValue);

      if (selectedLeagueId === undefined) {
        this.filteredClubs = [...this.clubs];
      } else {
        this.filteredClubs = this.clubs.filter(club => club.leagueId === selectedLeagueId);
      }

      this.clubOptions = this.mapClubsToOptions(this.filteredClubs);

      const selectedClubId = this.toOptionalPositiveNumber(this.filtersForm.get('clubs')?.value);
      if (selectedClubId !== undefined && !this.filteredClubs.some(club => club.clubId === selectedClubId)) {
        this.filtersForm.get('clubs')?.setValue('');
      }
    });
  }

  initForm(): void {
    this.filtersForm = this.fb.group({
      name: [''],
      position: ['', [Validators.required]],
      league: [''],
      clubs: [''],
      nationality: [''],

      ageMin: [null, [Validators.min(15), Validators.max(45)]],
      ageMax: [null, [Validators.min(15), Validators.max(45)]],

      MP: [null, this.MIN_ZERO_VALIDATOR],
      Starts: [null, this.MIN_ZERO_VALIDATOR],
      Minutes: [null, this.MIN_ZERO_VALIDATOR],
      Minutes90s: [null, this.MIN_ZERO_VALIDATOR],

      GoalsScored: [null, this.MIN_ZERO_VALIDATOR],
      AssitsProvided: [null, this.MIN_ZERO_VALIDATOR],
      GPlusA: [null, this.MIN_ZERO_VALIDATOR],
      ExpectedGoals: [null, this.MIN_ZERO_VALIDATOR],
      ExpectedAssistes: [null, this.MIN_ZERO_VALIDATOR],
      NpxG: [null, this.MIN_ZERO_VALIDATOR],
      GMinusPK: [null, this.MIN_ZERO_VALIDATOR],

      TotalTackels: [null, this.MIN_ZERO_VALIDATOR],
      TklW: [null, this.MIN_ZERO_VALIDATOR],
      BlocksMade: [null, this.MIN_ZERO_VALIDATOR],
      Interceptions: [null, this.MIN_ZERO_VALIDATOR],
      TklInt: [null, this.MIN_ZERO_VALIDATOR],
      Clearances: [null, this.MIN_ZERO_VALIDATOR],
      Errors: [null, this.MIN_ZERO_VALIDATOR],

      Progressivepasses: [null, this.MIN_ZERO_VALIDATOR],
      ProgCarries: [null, this.MIN_ZERO_VALIDATOR],
      KeyPasses: [null, this.MIN_ZERO_VALIDATOR],
      PassesIntothePenaltyArea: [null, this.MIN_ZERO_VALIDATOR],
      Touches: [null, this.MIN_ZERO_VALIDATOR],
      Carries: [null, this.MIN_ZERO_VALIDATOR],
      ProgRunsRec: [null, this.MIN_ZERO_VALIDATOR],
      Miscontrols: [null, this.MIN_ZERO_VALIDATOR],
      Dispossessed: [null, this.MIN_ZERO_VALIDATOR],

      GA: [null, this.MIN_ZERO_VALIDATOR],
      SavesMade: [null, this.MIN_ZERO_VALIDATOR],
      SavePct: [null, this.MIN_ZERO_VALIDATOR],
      CleanSheates: [null, this.MIN_ZERO_VALIDATOR],
      CSPct: [null, this.MIN_ZERO_VALIDATOR],

      YellowCards: [null, this.MIN_ZERO_VALIDATOR],
      RedCards: [null, this.MIN_ZERO_VALIDATOR],
      PKWon: [null, this.MIN_ZERO_VALIDATOR],
      PKCon: [null, this.MIN_ZERO_VALIDATOR],
      Recoveries: [null, this.MIN_ZERO_VALIDATOR]
    });
  }

  get Possinvalid(): boolean {
    const hasSearchName = !!this.cleanString(this.filtersForm.get('name')?.value);
    return !hasSearchName && this.filtersForm.controls['position'].invalid;
  }

  loadPositions(): void {
    this.http.get<string[]>(`${this.API_BASE_URL}/positions`).subscribe({
      next: data => {
        this.positionOptions = this.mapStringArrayToOptions(data);
      },
      error: err => console.error(err)
    });
  }

  loadLeagues(): void {
    this.http.get<LeagueApiResponse[]>(`${this.API_BASE_URL}/leagues`).subscribe({
      next: data => {
        this.leagues = Array.isArray(data) ? data : [];
        this.leagueOptions = this.mapLeaguesToOptions(this.leagues);
      },
      error: err => console.error(err)
    });
  }

  loadClubs(): void {
    this.http.get<ClubApiResponse[]>(`${this.API_BASE_URL}/clubs`).subscribe({
      next: data => {
        this.clubs = Array.isArray(data) ? data : [];
        this.filteredClubs = [...this.clubs];
        this.clubOptions = this.mapClubsToOptions(this.filteredClubs);
      },
      error: err => console.error(err)
    });
  }

  loadNationalities(): void {
    this.http.get<string[]>(`${this.API_BASE_URL}/nationalities`).subscribe({
      next: data => {
        this.nationalities = Array.isArray(data) ? data : [];
        this.nationalityOptions = this.mapStringArrayToOptions(this.nationalities);
      },
      error: err => console.error(err)
    });
  }

  mapClubsToOptions(items: ClubApiResponse[]): DropdownOption[] {
    return items.map(item => ({
      value: String(item.clubId),
      label: item.clubName
    }));
  }

  mapLeaguesToOptions(items: LeagueApiResponse[]): DropdownOption[] {
    return items.map(item => ({
      value: String(item.leagueId),
      label: item.leagueName
    }));
  }

  mapStringArrayToOptions(items: string[]): DropdownOption[] {
    return items.map(item => ({
      value: item,
      label: item
    }));
  }

  private toOptionalNonNegativeNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 0) {
      return undefined;
    }

    return parsed;
  }

  private toOptionalPositiveNumber(value: unknown): number | undefined {
    const parsed = this.toOptionalNonNegativeNumber(value);
    if (parsed === undefined || parsed <= 0) {
      return undefined;
    }

    return parsed;
  }

  private toOptionalAge(value: unknown): number | undefined {
    const parsed = this.toOptionalNonNegativeNumber(value);
    if (parsed === undefined) {
      return undefined;
    }

    return parsed;
  }

  private cleanString(value: unknown): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }

    const cleaned = value.trim();
    return cleaned ? cleaned : undefined;
  }

  private removeEmptyFields<T extends Record<string, unknown>>(obj: T): Partial<T> {
    const cleaned: Partial<T> = {};

    Object.entries(obj).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      (cleaned as Record<string, unknown>)[key] = value;
    });

    return cleaned;
  }

  buildFilterRequest(): PlayerFilterQuery {
    const value = this.filtersForm.value;

    const query: Partial<PlayerFilterQuery> = {
      name: this.cleanString(value.name),
      position: this.cleanString(value.position),
      leagueId: this.toOptionalPositiveNumber(value.league),
      clubId: this.toOptionalPositiveNumber(value.clubs),
      nationality: this.cleanString(value.nationality),
      page: 1,
      pageSize: 30
    };

    const minAge = this.toOptionalAge(value.ageMin);
    const maxAge = this.toOptionalAge(value.ageMax);

    if (maxAge !== undefined) {
      query.maxAge = maxAge;
    }

    if (minAge !== undefined && (maxAge === undefined || minAge <= maxAge)) {
      query.minAge = minAge;
    }

    Object.entries(this.statFieldMap).forEach(([formField, queryField]) => {
      const parsed = this.toOptionalNonNegativeNumber(value[formField]);
      if (parsed !== undefined) {
        (query as Record<string, unknown>)[queryField] = parsed;
      }
    });

    return this.removeEmptyFields(query) as PlayerFilterQuery;
  }

  applyFilters(): void {
    const selectedPosition = this.cleanString(this.filtersForm.get('position')?.value);
    const searchName = this.cleanString(this.filtersForm.get('name')?.value);

    if (!selectedPosition && !searchName) {
      this.filtersForm.get('position')?.markAsTouched();
      return;
    }

    const requestQuery = this.buildFilterRequest();
    this.filtersApplied.emit(requestQuery as unknown as Record<string, string | number>);
    this.scrollToTop();
    this.resetFilters();
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onFilterInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (!target || target.type !== 'number') {
      return;
    }

    const parsed = Number(target.value);
    if (!Number.isNaN(parsed) && parsed < 0) {
      target.value = '0';

      const controlName = target.getAttribute('formControlName');
      if (controlName) {
        this.filtersForm.get(controlName)?.setValue(0);
      }
    }
  }

  private resetFilters(): void {
    this.filtersForm.reset({
      name: '',
      position: '',
      league: '',
      clubs: '',
      nationality: '',
      ageMin: null,
      ageMax: null,
      MP: null,
      Starts: null,
      Minutes: null,
      Minutes90s: null,
      GoalsScored: null,
      AssitsProvided: null,
      GPlusA: null,
      ExpectedGoals: null,
      ExpectedAssistes: null,
      NpxG: null,
      GMinusPK: null,
      TotalTackels: null,
      TklW: null,
      BlocksMade: null,
      Interceptions: null,
      TklInt: null,
      Clearances: null,
      Errors: null,
      Progressivepasses: null,
      ProgCarries: null,
      KeyPasses: null,
      PassesIntothePenaltyArea: null,
      Touches: null,
      Carries: null,
      ProgRunsRec: null,
      Miscontrols: null,
      Dispossessed: null,
      GA: null,
      SavesMade: null,
      SavePct: null,
      CleanSheates: null,
      CSPct: null,
      YellowCards: null,
      RedCards: null,
      PKWon: null,
      PKCon: null,
      Recoveries: null
    });

    this.filteredClubs = [...this.clubs];
    this.clubOptions = this.mapClubsToOptions(this.filteredClubs);
    this.filtersForm.markAsPristine();
    this.filtersForm.markAsUntouched();
  }
}
