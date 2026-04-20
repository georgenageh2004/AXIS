import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ScoutingFilterQuery = Record<string, string | number>;

@Injectable({
  providedIn: 'root'
})
export class ScoutingFilterStateService {
  private readonly activeFilterQuerySubject = new BehaviorSubject<ScoutingFilterQuery | null>(null);

  readonly activeFilterQuery$ = this.activeFilterQuerySubject.asObservable();

  setActiveFilterQuery(query: ScoutingFilterQuery): void {
    this.activeFilterQuerySubject.next({ ...query });
  }

  clearActiveFilterQuery(): void {
    this.activeFilterQuerySubject.next(null);
  }
}
