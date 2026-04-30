import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { Player } from '../Models/players';
import { environment } from '../../environments/environment';

interface ApiMessageResponse {
  message?: string;
}

interface ShortlistMutationPayload {
  userId: number;
  playerId: number;
}

export interface ShortlistPlayer {
  playerId: number;
  name: string;
  position: string;
  age: number;
  nationality: string;
  imageUrl: string;
  clubName: string;
  leagueName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShortlistService {
  private readonly http = inject(HttpClient);
  private readonly API_BASE_URL = `${environment.apiBaseUrl}/api`;

  private readonly userIdStorageKeys = ['axis_user_id', 'userId'] as const;
  private readonly shortlistSubject = new BehaviorSubject<ShortlistPlayer[]>([]);

  private loadedUserId: number | null = null;

  readonly shortlist$ = this.shortlistSubject.asObservable();

  resolveUserId(userId?: number): number {
    if (Number.isInteger(userId) && (userId ?? 0) > 0) {
      return userId as number;
    }

    for (const key of this.userIdStorageKeys) {
      const value = localStorage.getItem(key);
      const parsed = Number(value);
      if (Number.isInteger(parsed) && parsed > 0) {
        return parsed;
      }
    }

    return environment.shortlistDefaultUserId;
  }

  watchShortlist(): Observable<ShortlistPlayer[]> {
    return this.shortlist$;
  }

  getUserShortlist(userId?: number, forceRefresh = false): Observable<ShortlistPlayer[]> {
    const resolvedUserId = this.resolveUserId(userId);

    if (!forceRefresh && this.loadedUserId === resolvedUserId) {
      return of(this.shortlistSubject.value);
    }

    return this.http.get<ShortlistPlayer[]>(`${this.API_BASE_URL}/Shortlist/user/${resolvedUserId}`).pipe(
      map(players => players ?? []),
      tap(players => {
        this.loadedUserId = resolvedUserId;
        this.shortlistSubject.next(players);
      }),
      catchError(error => this.handleError(error, 'Failed to load shortlist. Please try again.'))
    );
  }

  addToShortlist(userId: number | undefined, player: Player): Observable<string> {
    const resolvedUserId = this.resolveUserId(userId);
    const payload: ShortlistMutationPayload = {
      userId: resolvedUserId,
      playerId: player.id
    };

    return this.http.post<ApiMessageResponse>(`${this.API_BASE_URL}/Players/add-to-shortlist`, payload).pipe(
      tap(() => {
        if (this.loadedUserId !== resolvedUserId) {
          return;
        }

        const current = this.shortlistSubject.value;
        if (current.some(item => item.playerId === player.id)) {
          return;
        }

        this.shortlistSubject.next([...current, this.mapPlayerToShortlistItem(player)]);
      }),
      map(response => response.message ?? 'Player added successfully'),
      catchError(error => this.handleError(error, 'Failed to add player to shortlist. Please try again.'))
    );
  }

  removeFromShortlist(userId: number | undefined, playerId: number): Observable<string> {
    const resolvedUserId = this.resolveUserId(userId);
    const payload: ShortlistMutationPayload = {
      userId: resolvedUserId,
      playerId
    };

    return this.http
      .request<ApiMessageResponse>('DELETE', `${this.API_BASE_URL}/Shortlist/remove`, {
        body: payload
      })
      .pipe(
        tap(() => {
          if (this.loadedUserId !== resolvedUserId) {
            return;
          }

          this.shortlistSubject.next(this.shortlistSubject.value.filter(item => item.playerId !== playerId));
        }),
        map(response => response.message ?? 'Player removed successfully'),
        catchError(error => this.handleError(error, 'Failed to remove player from shortlist. Please try again.'))
      );
  }

  clearShortlist(userId?: number): Observable<string> {
    const resolvedUserId = this.resolveUserId(userId);

    return this.http
      .delete<ApiMessageResponse>(`${this.API_BASE_URL}/Shortlist/clear-all/${resolvedUserId}`)
      .pipe(
        tap(() => {
          if (this.loadedUserId !== resolvedUserId) {
            return;
          }

          this.shortlistSubject.next([]);
        }),
        map(response => response.message ?? 'All players removed from your shortlist'),
        catchError(error => this.handleError(error, 'Failed to clear shortlist. Please try again.'))
      );
  }

  private mapPlayerToShortlistItem(player: Player): ShortlistPlayer {
    return {
      playerId: player.id,
      name: player.name,
      position: player.position,
      age: player.age ?? 0,
      nationality: player.nationality ?? 'N/A',
      imageUrl: player.image ?? '',
      clubName: player.club ?? 'N/A',
      leagueName: ''
    };
  }

  private handleError(error: unknown, fallbackMessage: string): Observable<never> {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim()) {
        return throwError(() => new Error(error.error));
      }

      if (this.hasMessage(error.error)) {
        return throwError(() => new Error(error.error.message));
      }
    }

    return throwError(() => new Error(fallbackMessage));
  }

  private hasMessage(value: unknown): value is { message: string } {
    return (
      typeof value === 'object' &&
      value !== null &&
      'message' in value &&
      typeof (value as { message: unknown }).message === 'string' &&
      ((value as { message: string }).message.trim().length > 0)
    );
  }
}
