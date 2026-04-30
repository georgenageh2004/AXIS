import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, DestroyRef, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from "@angular/material/icon";
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Player } from '../../Models/players';
import { ScoutingFilterQuery } from '../../services/scouting-filter-state.service';
import { environment } from '../../../environments/environment';
import { ShortlistService } from '../../services/shortlist.service';

interface PlayerApiDto {
  playerId: number;
  name: string;
  age: number;
  position: string;
  nationality?: string;
  imageUrl?: string;
  clubName: string;
  maxZScore?: number;
}

interface PlayersPageResponse {
  data?: PlayerApiDto[];
  Data?: PlayerApiDto[];
  players?: PlayerApiDto[];
  Players?: PlayerApiDto[];
  items?: PlayerApiDto[];
  Items?: PlayerApiDto[];
  totalItems?: number;
  TotalItems?: number;
  totalCount?: number;
  TotalCount?: number;
  pageNumber?: number;
  PageNumber?: number;
  currentPage?: number;
  CurrentPage?: number;
  pageSize?: number;
  PageSize?: number;
}

@Component({
  selector: 'app-palyers-scout',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './palyers-scout.component.html',
  styleUrl: './palyers-scout.component.css'
})
export class PalyersScoutComponent implements OnChanges, OnInit {
  private readonly API_BASE_URL = `${environment.apiBaseUrl}/api/players`;
  private initialized = false;
  private readonly destroyRef = inject(DestroyRef);

  @Input() activeFilterQuery: ScoutingFilterQuery | null = null;

  players: Player[] = [];
  shortlistIds = new Set<number>();
  updatingPlayerIds = new Set<number>();

  currentPage = 1;
  pageSize = 30;
  totalCount = 0;

  isLoading = false;
  errorMessage = '';
  shortlistErrorMessage = '';

  private readonly userId: number;

  constructor(private http: HttpClient, private shortlistService: ShortlistService, private router: Router) {
    this.userId = this.shortlistService.resolveUserId();
  }

  ngOnInit(): void {
    this.initialized = true;
    this.refreshPlayers(1);

    this.shortlistService
      .watchShortlist()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(list => {
        this.shortlistIds = new Set(list.map(item => item.playerId));
      });

    this.shortlistService
      .getUserShortlist(this.userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: Error) => {
          this.shortlistErrorMessage = error.message;
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.initialized || !changes['activeFilterQuery']) {
      return;
    }

    this.refreshPlayers(1);
  }

  get totalPages(): number {
    if (this.totalCount <= 0) {
      return 1;
    }

    return Math.ceil(this.totalCount / this.pageSize);
  }

  get hasPreviousPage(): boolean {
    return this.currentPage > 1;
  }

  get hasNextPage(): boolean {
    return this.currentPage < this.totalPages;
  }

  loadPlayers(page = this.currentPage): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http
      .get<PlayersPageResponse | PlayerApiDto[]>(`${this.API_BASE_URL}/all`, {
        params: {
          page: String(page),
          pageSize: String(this.pageSize)
        }
      })
      .subscribe({
        next: response => {
          const payload = Array.isArray(response) ? { data: response } : response;
          const data = payload.data ?? payload.Data ?? [];

          this.players = data.map(player => this.toPlayerModel(player));
          this.totalCount = payload.totalItems ?? payload.TotalItems ?? payload.totalCount ?? payload.TotalCount ?? this.players.length;
          this.currentPage = payload.pageNumber ?? payload.PageNumber ?? payload.currentPage ?? payload.CurrentPage ?? page;
          this.isLoading = false;
        },
        error: () => {
          this.players = [];
          this.totalCount = 0;
          this.errorMessage = 'Failed to load players. Please try again.';
          this.isLoading = false;
        }
      });
  }

  previousPage(): void {
    if (!this.hasPreviousPage || this.isLoading) {
      return;
    }

    const targetPage = this.currentPage - 1;
    this.refreshPlayers(targetPage);
  }

  nextPage(): void {
    if (!this.hasNextPage || this.isLoading) {
      return;
    }

    const targetPage = this.currentPage + 1;
    this.refreshPlayers(targetPage);
  }

  toggle(player: Player): void {
    if (this.updatingPlayerIds.has(player.id)) {
      return;
    }

    this.shortlistErrorMessage = '';
    this.updatingPlayerIds.add(player.id);

    const request$ = this.isInShortlist(player)
      ? this.shortlistService.removeFromShortlist(this.userId, player.id)
      : this.shortlistService.addToShortlist(this.userId, player);

    request$
      .pipe(
        finalize(() => {
          this.updatingPlayerIds.delete(player.id);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        error: (error: Error) => {
          this.shortlistErrorMessage = error.message;
        }
      });
  }

  viewProfile(player: Player): void {
    this.router.navigate(['/program/profile-details', player.id]);
  }

  isInShortlist(player: Player): boolean {
    return this.shortlistIds.has(player.id);
  }

  isPlayerUpdating(playerId: number): boolean {
    return this.updatingPlayerIds.has(playerId);
  }

  onImageError(player: Player): void {
    player.image = undefined;
  }

  private toPlayerModel(player: PlayerApiDto): Player {
    return {
      id: player.playerId,
      name: player.name,
      position: player.position,
      age: player.age,
      nationality: player.nationality,
      club: player.clubName,
      image: player.imageUrl || undefined,
      maxZScore: player.maxZScore,
      goals: 0,
      assists: 0,
      tackles: 0,
      matchesPlayed: 0
    };
  }

  private loadFilteredPlayers(page: number): void {
    if (!this.activeFilterQuery) {
      this.loadPlayers(page);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.http
      .get<PlayersPageResponse>(`${this.API_BASE_URL}/filter`, {
        params: this.buildFilterParams(page)
      })
      .subscribe({
        next: response => {
          const data = this.extractPlayersData(response);
          this.players = data.map(player => this.toPlayerModel(player));
          this.totalCount = response.totalItems ?? response.TotalItems ?? response.totalCount ?? response.TotalCount ?? this.players.length;
          this.currentPage = response.pageNumber ?? response.PageNumber ?? response.currentPage ?? response.CurrentPage ?? page;
          this.isLoading = false;
        },
        error: () => {
          this.players = [];
          this.totalCount = 0;
          this.errorMessage = 'Failed to load filtered players. Please try again.';
          this.isLoading = false;
        }
      });
  }

  private loadSearchedPlayers(searchName: string, page: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http
      .get<PlayersPageResponse | PlayerApiDto[]>(`${this.API_BASE_URL}/search`, {
        params: {
          name: searchName,
          page: String(page),
          pageSize: String(this.pageSize)
        }
      })
      .subscribe({
        next: response => {
          const payload = Array.isArray(response) ? { data: response } : response;
          const data = this.extractPlayersData(payload);

          this.players = data.map(player => this.toPlayerModel(player));
          this.totalCount = payload.totalItems ?? payload.TotalItems ?? payload.totalCount ?? payload.TotalCount ?? this.players.length;
          this.currentPage = payload.pageNumber ?? payload.PageNumber ?? payload.currentPage ?? payload.CurrentPage ?? page;
          this.isLoading = false;
        },
        error: () => {
          this.players = [];
          this.totalCount = 0;
          this.errorMessage = 'Failed to search players. Please try again.';
          this.isLoading = false;
        }
      });
  }

  private buildFilterParams(page: number): HttpParams {
    let params = new HttpParams();
    const query = this.activeFilterQuery ?? {};

    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '' || key === 'page' || key === 'pageSize') {
        return;
      }

      params = params.set(key, String(value));
    });

    params = params.set('page', String(page));
    params = params.set('pageSize', String(this.pageSize));

    return params;
  }

  private extractPlayersData(response: PlayersPageResponse): PlayerApiDto[] {
    return response.data ?? response.Data ?? response.players ?? response.Players ?? response.items ?? response.Items ?? [];
  }

  private getSearchName(): string | undefined {
    const value = this.activeFilterQuery?.['name'];
    if (typeof value !== 'string') {
      return undefined;
    }

    const cleaned = value.trim();
    return cleaned ? cleaned : undefined;
  }

  private refreshPlayers(page: number): void {
    const searchName = this.getSearchName();
    if (searchName) {
      this.loadSearchedPlayers(searchName, page);
      return;
    }

    if (this.activeFilterQuery) {
      this.loadFilteredPlayers(page);
      return;
    }

    this.loadPlayers(page);
  }
}