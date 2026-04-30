import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CompareActionResult {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComparisonService {
  private readonly storageKey = 'axis_compare_ids_v1';
  private readonly maxPlayers = 4;

  private readonly compareIdsSubject = new BehaviorSubject<number[]>(this.readFromStorage());
  readonly compareIds$ = this.compareIdsSubject.asObservable();

  watchCompareIds(): Observable<number[]> {
    return this.compareIds$;
  }

  getCompareIds(): number[] {
    return this.compareIdsSubject.value;
  }

  addPlayer(playerId: number): CompareActionResult {
    if (!Number.isInteger(playerId) || playerId <= 0) {
      return { success: false, message: 'Invalid player id.' };
    }

    const current = this.compareIdsSubject.value;

    if (current.includes(playerId)) {
      return { success: false, message: 'Player already selected in comparison.' };
    }

    if (current.length >= this.maxPlayers) {
      return { success: false, message: 'You can compare up to 4 players only.' };
    }

    this.persist([...current, playerId]);
    return { success: true, message: 'Player added to comparison.' };
  }

  removePlayer(playerId: number): void {
    const updated = this.compareIdsSubject.value.filter(id => id !== playerId);
    this.persist(updated);
  }

  replaceIds(ids: number[]): void {
    const sanitized = ids
      .map(id => Number(id))
      .filter(id => Number.isInteger(id) && id > 0)
      .filter((id, index, arr) => arr.indexOf(id) === index)
      .slice(0, this.maxPlayers);

    this.persist(sanitized);
  }

  clear(): void {
    this.persist([]);
  }

  private readFromStorage(): number[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .map(value => Number(value))
        .filter(value => Number.isInteger(value) && value > 0)
        .filter((value, index, arr) => arr.indexOf(value) === index)
        .slice(0, this.maxPlayers);
    } catch {
      return [];
    }
  }

  private persist(ids: number[]): void {
    this.compareIdsSubject.next(ids);
    localStorage.setItem(this.storageKey, JSON.stringify(ids));
  }
}
