import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Player } from '../../Models/players';
import { PlayerDetailsComponent } from "../player-details/player-details.component";
import { SquadListComponent } from "../squad-list/squad-list.component";
import { MatIcon } from "@angular/material/icon";
import { FormationService } from '../../services/formation.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
@Component({
  selector: 'app-squad-pitch',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, PlayerDetailsComponent, SquadListComponent, MatIcon,DragDropModule], // هنا ضفت HttpClientModule
  templateUrl: './squad-pitch.component.html',
  styleUrls: ['./squad-pitch.component.css'] // صححت styleUrl -> styleUrls
})
export class SquadPitchComponent implements OnInit {
 playersList: Player[] = [];   // كل لاعيبة الـ squad
  pitchPlayers: Player[] = [];  // اللاعبين المعروضين على pitch (11 لاعب فقط)
  selectedPlayer?: Player;      // للـ PlayerDetails
  changingPlayer?: Player;   
  selectedFormation!: string; 
    isDragging = false;
  playerPositionsPx: { [playerId: number]: { x: number; y: number } } = {};

currentFormation: any[] = [];
  constructor(private http: HttpClient) {}
  private formationService=inject(FormationService);
  ngOnInit(): void {
     this.selectedFormation=this.formationService.getFormation()
    this.currentFormation = this.formations[this.selectedFormation];
    console.log(this.selectedFormation);
    this.http.get<Player[]>('assets/players.json').subscribe(data => {
      this.playersList = data;
      this.buildPitchPlayers();
   
      console.log('Players Loaded:', this.playersList);
    });
   
  }

  // اختيار لاعب من الـ pitch لعمل Replace
  selectPlayer(player: Player) {
    this.selectedPlayer = player;
    console.log("Selected: ", player.name);
  }
  /////

buildPitchPlayers() {
  this.pitchPlayers = [];

  this.currentFormation.forEach((pos: any) => {
    const player = this.playersList.find(
      p => p.position === pos.role && !this.pitchPlayers.includes(p)
    );
    if (player) {
      this.pitchPlayers.push(player);

      // نحسب px من الـ % الأولية
      const pitch = document.querySelector('.pitch') as HTMLElement;
      const pxX = (pos.x / 100) * pitch.clientWidth;
      const pxY = (pos.y / 100) * pitch.clientHeight;

      this.playerPositionsPx[player.id] = { x: pxX, y: pxY };
    }
  });
}

// drag started
onDragStart() {
  this.isDragging = true;
}

// drag ended
onDragEnd(event: any, player: any) {
  this.isDragging = false;

  // نحفظ مكان اللاعب بالـ px فقط
  const pos = event.source.getFreeDragPosition();

  const pitch = document.querySelector('.pitch') as HTMLElement;

  // clamp داخل الملعب
  const x = Math.max(0, Math.min(pos.x, pitch.clientWidth - 61)); // 61 px عرض اللاعب
  const y = Math.max(0, Math.min(pos.y, pitch.clientHeight - 59)); // 59 px ارتفاع اللاعب

  this.playerPositionsPx[player.id] = { x, y };

  // لا reset
}
  // استبدال اللاعب
  replacePlayer(newPlayer: Player) {
    if (!this.changingPlayer) return;

    if (newPlayer.position !== this.changingPlayer.position) {
      alert("Player position does not match!");
      return;
    }

    const index = this.pitchPlayers.findIndex(p => p === this.changingPlayer);
    if (index !== -1) {
      this.pitchPlayers[index] = newPlayer;
    }

    this.changingPlayer = undefined;
  }

formations:any = {
"4-3-3":[
 {role:"GK",x:10,y:50},

 {role:"DF",x:30,y:20},
 {role:"DF",x:25,y:41},
 {role:"DF",x:25,y:64},
 {role:"DF",x:30,y:85},

 {role:"MF",x:50,y:50},
 {role:"MF",x:55,y:20},
 {role:"MF",x:55,y:80},

 {role:"FW",x:80,y:30},
 {role:"FW",x:90,y:50},
 {role:"FW",x:80,y:70}
],
"3-4-3":[
 {role:"GK",x:10,y:50},

 {role:"DF",x:30,y:25},
 {role:"DF",x:30,y:50},
 {role:"DF",x:30,y:75},

 {role:"MF",x:50,y:20},
 {role:"MF",x:50,y:40},
 {role:"MF",x:50,y:60},
 {role:"MF",x:50,y:80},

 {role:"FW",x:80,y:25},
 {role:"FW",x:85,y:50},
 {role:"FW",x:80,y:75}
],
"4-4-2":[
 {role:"GK",x:10,y:50},

 {role:"DF",x:30,y:15},
 {role:"DF",x:30,y:40},
 {role:"DF",x:30,y:60},
 {role:"DF",x:30,y:85},

 {role:"MF",x:55,y:20},
 {role:"MF",x:55,y:40},
 {role:"MF",x:55,y:60},
 {role:"MF",x:55,y:80},

 {role:"FW",x:85,y:35},
 {role:"FW",x:85,y:65}
],
"5-4-1":[
 {role:"GK",x:10,y:50},

 {role:"DF",x:30,y:15},
 {role:"DF",x:27,y:33},
 {role:"DF",x:25,y:53},
 {role:"DF",x:27,y:73},
 {role:"DF",x:30,y:90},

 {role:"MF",x:55,y:20},
 {role:"MF",x:55,y:40},
 {role:"MF",x:55,y:60},
 {role:"MF",x:55,y:80},

 {role:"FW",x:85,y:50}
]



}



}
