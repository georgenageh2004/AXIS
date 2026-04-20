import { inject, Injectable } from '@angular/core';
import { Player, ShortlistItem,  } from '../Models/players';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
//  player_cart:Player[] = [];
//  private http =inject(HttpClient);

//  private baseUrl = 'http://localhost:3000/shortlist';

  

//   getShortlist(): Observable<ShortlistPlayer[]> {
//   return this.http.get<ShortlistPlayer[]>(this.baseUrl);
// }

//   addToShortlist(player: Player) {
//     return this.http.post(this.baseUrl, player);
//   }

//   removeFromShortlist(id: number) {
//     return this.http.delete(`${this.baseUrl}/${id}`);
//   }
 private storageKey = 'shortlist_v1';
  private shortlistSubject = new BehaviorSubject<ShortlistItem[]>(this.loadFromStorage());
  shortlist$ = this.shortlistSubject.asObservable();

  private nextId = 1;

  private loadFromStorage(): ShortlistItem[] {
    const raw = localStorage.getItem(this.storageKey);
    const list = raw ? JSON.parse(raw) : [];
    if (list.length) this.nextId = Math.max(...list.map((i: ShortlistItem) => i.id)) + 1;
    return list;
  }

  private save(list: ShortlistItem[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(list));
    this.shortlistSubject.next(list);
  }

  getShortlist(): Observable<ShortlistItem[]> {
    return this.shortlist$;
  }

  addToShortlist(player: Player): void {
    const current = this.shortlistSubject.value;
    if (current.some(i => i.playerId === player.id)) return;

    const newItem: ShortlistItem = {
      id: this.nextId++,
      playerId: player.id,
      addedAt: new Date().toISOString(),
      player
    };
    this.save([...current, newItem]);
  }

  removeFromShortlist(playerId: number): void {
    const current = this.shortlistSubject.value;
    this.save(current.filter(i => i.playerId !== playerId));
  }

  toggleShortlist(player: Player): void {
    if (this.shortlistSubject.value.some(i => i.playerId === player.id)) {
      this.removeFromShortlist(player.id);
    } else {
      this.addToShortlist(player);
    }
  }

  clearShortlist(): void {
    this.save([]);
  }
 

  
}
