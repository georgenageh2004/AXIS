import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PlayersProfile } from '../Models/Players_profile';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
private http=inject(HttpClient)
getPlayers(){
  return this.http.get<PlayersProfile[]>('assets/player_profile.json')
}
 getPlayerById(id:number){
  return this.http.get<PlayersProfile[]>('assets/player_profile.json')
  .pipe(map(players => players.find(p => p.id === id)));
 }

}
