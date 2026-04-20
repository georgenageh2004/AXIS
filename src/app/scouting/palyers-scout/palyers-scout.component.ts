import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Player, ShortlistItem,  } from '../../Models/players';
import { ScoutingFilterQuery } from '../../services/scouting-filter-state.service';
import { environment } from '../../../environments/environment';

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
export class PalyersScoutComponent implements OnChanges {
  private readonly API_BASE_URL = `${environment.apiBaseUrl}/api/players`;
  private initialized = false;

  @Input() activeFilterQuery: ScoutingFilterQuery | null = null;

  players: Player[] = [];
  shortlist: ShortlistItem[] = [];
  shortlistIds = new Set<number>();

  currentPage = 1;
  pageSize = 30;
  totalCount = 0;

  isLoading = false;
  errorMessage = '';

  constructor(private http: HttpClient, private shortlistService: CartService, private router: Router) {}

  ngOnInit() {
    this.initialized = true;
    this.refreshPlayers(1);

    this.shortlistService.getShortlist().subscribe(list => {
      this.shortlist = list;
      this.shortlistIds = new Set(list.map(i => i.playerId));
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

  toggle(player: Player) {
    this.shortlistService.toggleShortlist(player);
  }

  viewProfile(player: Player): void {
    this.router.navigate(['/program/profile-details', player.id]);
  }

  isInShortlist(player: Player): boolean {
    return this.shortlistIds.has(player.id);
  }

  clearAll() {
    this.shortlistService.clearShortlist();
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