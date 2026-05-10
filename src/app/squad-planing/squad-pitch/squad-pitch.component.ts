import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Player } from '../../Models/players';
import { PlayerDetailsComponent } from "../player-details/player-details.component";
import { SquadListComponent } from "../squad-list/squad-list.component";
import { MatIcon } from "@angular/material/icon";
import { FormationService } from '../../services/formation.service';
import { CdkDragEnd, CdkDragStart, DragDropModule } from '@angular/cdk/drag-drop';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

interface SquadApiPlayer {
  id: number;
  name: string;
  position?: string;
  positions?: string[];
  age?: number;
  nationality?: string;
  matchesPlayed?: number;
  goals?: number;
  assists?: number;
  tackles?: number;
  zScore: number;
  imageUrl: string;
}

interface SquadApiResponse {
  clubId: number;
  clubName: string;
  players: SquadApiPlayer[];
  savedFormation?: string;
  savedPlayers?: SquadSavePlayer[];
}

interface SquadSavePlayer {
  playerId: number;
  role: string;
  x: number;
  y: number;
}

interface SquadSaveRequest {
  clubId: number;
  formation: string;
  players: SquadSavePlayer[];
}
@Component({
  selector: 'app-squad-pitch',
  standalone: true,
  imports: [CommonModule, FormsModule, PlayerDetailsComponent, SquadListComponent, MatIcon, DragDropModule],
  templateUrl: './squad-pitch.component.html',
  styleUrls: ['./squad-pitch.component.css'] // صححت styleUrl -> styleUrls
})
export class SquadPitchComponent implements OnInit {
 playersList: Player[] = [];   // كل لاعيبة الـ squad
  pitchPlayers: Player[] = [];  // اللاعبين المعروضين على pitch (11 لاعب فقط)
  selectedPlayer?: Player;      // للـ PlayerDetails
  changingPlayer?: Player;   
  selectedFormation!: string; 
  formationOptions: string[] = [];
  isLoading = false;
  errorMessage = '';
  clubId = 2;
  clubName = '';
  isSaving = false;
  saveMessage = '';
  saveError = '';
  private readonly squadApiBaseUrl = `${environment.apiBaseUrl}/api/Squad`;
  // Free-drag offsets (in px) stored internally only (not in Player / backend)
  private readonly zeroDragPosition = { x: 0, y: 0 };
  playerDragPositionsPx: { [playerId: number]: { x: number; y: number } } = {};

  private suppressClickUntilMs = 0;

  currentFormation: Array<{ role: string; x: number; y: number }> = [];
  @ViewChild('pitchBoundary') pitchBoundary?: ElementRef<HTMLElement>;
  constructor(private http: HttpClient) {}
  private formationService = inject(FormationService);
  private authService = inject(AuthService);
  ngOnInit(): void {
    this.formationOptions = Object.keys(this.formations);
    const storedFormation = this.formationService.getFormation();
    this.selectedFormation = this.formations[storedFormation] ? storedFormation : '4-3-3';
    this.currentFormation = this.formations[this.selectedFormation] ?? [];
    const authClubId = this.authService.getClubId();
    if (Number.isInteger(authClubId) && (authClubId ?? 0) > 0) {
      this.clubId = authClubId as number;
    }
    this.loadSquad();
  }

  onFormationChange(formation: string): void {
    this.selectedFormation = formation;
    this.formationService.setFormation(formation);
    this.currentFormation = this.formations[formation] ?? [];
    this.playerDragPositionsPx = {};
    this.buildPitchPlayers();
  }

  saveSquad(): void {
    if (this.isSaving || this.isLoading) return;

    const payload = this.buildSavePayload();
    if (!payload.players.length) {
      this.saveError = 'No players to save.';
      this.saveMessage = '';
      return;
    }

    this.isSaving = true;
    this.saveError = '';
    this.saveMessage = '';

    this.http.post(`${this.squadApiBaseUrl}/save`, payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.saveMessage = 'Squad saved successfully.';
      },
      error: () => {
        this.isSaving = false;
        this.saveError = 'Failed to save squad.';
      }
    });
  }

  private buildSavePayload(): SquadSaveRequest {
    const { pitchWidth, pitchHeight } = this.getPitchDimensions();

    const players: SquadSavePlayer[] = this.pitchPlayers
      .map((player, index) => {
        const slot = this.currentFormation[index];
        if (!slot) return null;

        const drag = this.playerDragPositionsPx[player.id] ?? this.zeroDragPosition;
        const offsetX = pitchWidth ? (drag.x / pitchWidth) * 100 : 0;
        const offsetY = pitchHeight ? (drag.y / pitchHeight) * 100 : 0;

        const x = this.clampPercent(slot.x + offsetX);
        const y = this.clampPercent(slot.y + offsetY);

        return {
          playerId: player.id,
          role: slot.role,
          x: Math.round(x),
          y: Math.round(y)
        };
      })
      .filter((player): player is SquadSavePlayer => Boolean(player));

    return {
      clubId: this.clubId,
      formation: this.selectedFormation,
      players
    };
  }

  private getPitchDimensions(): { pitchWidth: number; pitchHeight: number } {
    const element = this.pitchBoundary?.nativeElement;
    if (!element) {
      return { pitchWidth: 0, pitchHeight: 0 };
    }

    const rect = element.getBoundingClientRect();
    return { pitchWidth: rect.width, pitchHeight: rect.height };
  }

  private clampPercent(value: number): number {
    if (Number.isNaN(value)) return 0;
    return Math.min(100, Math.max(0, value));
  }

  private roundPercent(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private loadSquad(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<SquadApiResponse>(`${this.squadApiBaseUrl}`).subscribe({
      next: response => {
        this.clubId = response?.clubId ?? this.clubId;
        this.clubName = response?.clubName ?? '';
        this.playersList = this.mapApiPlayers(response?.players ?? []);
        const savedPlayers = Array.isArray(response?.savedPlayers) ? response.savedPlayers : [];
        const appliedSaved = this.applySavedSquadFromApi(response?.savedFormation, savedPlayers);
        if (!appliedSaved) {
          this.buildPitchPlayers();
        }
        this.isLoading = false;
      },
      error: () => {
        this.playersList = [];
        this.pitchPlayers = [];
        this.errorMessage = 'Failed to load squad players.';
        this.isLoading = false;
      }
    });
  }

  private mapApiPlayers(players: SquadApiPlayer[]): Player[] {
    return players.map(player => {
      const positions = this.resolveRawPositions(player);
      const joinedPositions = positions.join('/');
      const displayPosition = player.position && player.position.trim()
        ? player.position
        : (joinedPositions || 'MF');

      return {
        id: player.id,
        name: player.name,
        position: displayPosition,
        positions,
        age: player.age,
        nationality: player.nationality,
        matchesPlayed: player.matchesPlayed,
        goals: player.goals,
        assists: player.assists,
        tackles: player.tackles,
        zScore: player.zScore,
        imageUrl: player.imageUrl,
        image: player.imageUrl
      };
    });
  }

  private resolveRawPositions(player: SquadApiPlayer): string[] {
    if (Array.isArray(player.positions) && player.positions.length > 0) {
      return player.positions.map(position => position.trim()).filter(Boolean);
    }

    return this.splitPositions(player.position);
  }

  private splitPositions(position?: string): string[] {
    if (!position) return [];

    return position
      .split(/[,/|]+/)
      .map(part => part.trim())
      .filter(Boolean);
  }

  private normalizeRole(position: string): string | null {
    const value = position.trim().toUpperCase();

    if (value === 'GK') return 'GK';
    if (value === 'DF') return 'DF';
    if (value === 'MF') return 'MF';
    if (value === 'FW') return 'FW';

    const map: Record<string, string> = {
      CB: 'DF',
      LB: 'DF',
      RB: 'DF',
      LWB: 'DF',
      RWB: 'DF',
      WB: 'DF',
      FB: 'DF',
      SW: 'DF',
      DM: 'MF',
      CDM: 'MF',
      CM: 'MF',
      CAM: 'MF',
      AM: 'MF',
      LM: 'MF',
      RM: 'MF',
      LCM: 'MF',
      RCM: 'MF',
      LDM: 'MF',
      RDM: 'MF',
      LAM: 'MF',
      RAM: 'MF',
      LW: 'FW',
      RW: 'FW',
      LF: 'FW',
      RF: 'FW',
      ST: 'FW',
      CF: 'FW',
      SS: 'FW'
    };

    return map[value] ?? null;
  }

  private resolvePlayerRoles(player: Player): string[] {
    const rawPositions = (player.positions && player.positions.length > 0)
      ? player.positions
      : this.splitPositions(player.position);

    const roles = rawPositions
      .map(position => this.normalizeRole(position))
      .filter((role): role is string => Boolean(role));

    if (roles.length > 0) {
      return Array.from(new Set(roles));
    }

    return this.normalizeRole(player.position)
      ? [this.normalizeRole(player.position) as string]
      : [];
  }

  // اختيار لاعب من الـ pitch لعمل Replace
  selectPlayer(player: Player) {
    this.selectedPlayer = player;
    console.log("Selected: ", player.name);
  }
  /////

buildPitchPlayers() {
  this.pitchPlayers = [];

  const pools = this.getPositionPools();
  const poolIndexes: Record<string, number> = {};
  const selectedIds = new Set<number>();

  this.currentFormation.forEach((pos: any) => {
    const pool = pools[pos.role] ?? [];
    let poolIndex = poolIndexes[pos.role] ?? 0;
    let player = pool[poolIndex];

    while (player && selectedIds.has(player.id)) {
      poolIndex += 1;
      player = pool[poolIndex];
    }

    if (player) {
      this.pitchPlayers.push(player);
      selectedIds.add(player.id);
      poolIndexes[pos.role] = poolIndex + 1;
      // When (re)building the pitch players, start them at the formation anchor
      // with zero drag offset.
      delete this.playerDragPositionsPx[player.id];
    } else {
      poolIndexes[pos.role] = poolIndex;
    }
  });
}

private getPositionPools(): Record<string, Player[]> {
  const pools: Record<string, Player[]> = {};

  for (const player of this.playersList) {
    const roles = this.resolvePlayerRoles(player);
    for (const role of roles) {
      if (!pools[role]) {
        pools[role] = [];
      }
      pools[role].push(player);
    }
  }

  for (const key of Object.keys(pools)) {
    pools[key].sort((a, b) => (b.zScore ?? 0) - (a.zScore ?? 0));
  }

  return pools;
}

getPlayerDragPosition(playerId: number): { x: number; y: number } {
  return this.playerDragPositionsPx[playerId] ?? this.zeroDragPosition;
}

private applySavedSquadFromApi(savedFormation?: string, savedPlayers?: SquadSavePlayer[]): boolean {
  if (!savedFormation || !this.formations[savedFormation]) {
    return false;
  }

  if (!Array.isArray(savedPlayers) || savedPlayers.length === 0) {
    return false;
  }

  const formationSlots = this.formations[savedFormation] ?? [];
  if (savedPlayers.length !== formationSlots.length) {
    return false;
  }

  const playersById = new Map(this.playersList.map(player => [player.id, player]));
  const seen = new Set<number>();

  for (const entry of savedPlayers) {
    if (!playersById.has(entry.playerId) || seen.has(entry.playerId)) {
      return false;
    }
    seen.add(entry.playerId);
  }

  this.selectedFormation = savedFormation;
  this.formationService.setFormation(savedFormation);
  this.currentFormation = formationSlots;
  this.playerDragPositionsPx = {};
  this.pitchPlayers = savedPlayers.map(entry => playersById.get(entry.playerId) as Player);

  this.scheduleApplySavedOffsets(savedPlayers);
  return true;
}

private scheduleApplySavedOffsets(savedPlayers: SquadSavePlayer[]): void {
  let attempts = 0;

  const tryApply = () => {
    attempts += 1;
    if (this.applySavedOffsets(savedPlayers) || attempts >= 10) {
      return;
    }

    requestAnimationFrame(tryApply);
  };

  requestAnimationFrame(tryApply);
}

private applySavedOffsets(savedPlayers: SquadSavePlayer[]): boolean {
  const { pitchWidth, pitchHeight } = this.getPitchDimensions();
  if (pitchWidth <= 0 || pitchHeight <= 0) {
    return false;
  }

  savedPlayers.forEach((entry, index) => {
    const slot = this.currentFormation[index];
    if (!slot) {
      return;
    }

    const deltaX = entry.x - slot.x;
    const deltaY = entry.y - slot.y;
    this.playerDragPositionsPx[entry.playerId] = {
      x: Math.round((deltaX / 100) * pitchWidth),
      y: Math.round((deltaY / 100) * pitchHeight)
    };
  });

  return true;
}

// drag started
onDragStart(_event: CdkDragStart) {
  // suppress click that may fire on pointerup after dragging
  this.suppressClickUntilMs = Date.now() + 200;
}

// drag ended
onDragEnd(event: CdkDragEnd, player: Player) {
  // store free-drag offset in px (internal only)
  const pos = event.source.getFreeDragPosition();
  this.playerDragPositionsPx[player.id] = {
    x: Math.round(pos.x),
    y: Math.round(pos.y)
  };

  this.suppressClickUntilMs = Date.now() + 200;
}

onPlayerClick(player: Player) {
  if (Date.now() < this.suppressClickUntilMs) return;
  this.selectPlayer(player);
}
  // استبدال اللاعب
  replacePlayer(newPlayer: Player) {
    if (!this.changingPlayer) return;

    const index = this.pitchPlayers.findIndex(p => p === this.changingPlayer);
    const slotRole = this.currentFormation[index]?.role;

    if (!slotRole || !this.canPlayRole(newPlayer, slotRole)) {
      alert("Player position does not match!");
      return;
    }

    if (index !== -1) {
      // Reset drag positions when a slot is replaced
      delete this.playerDragPositionsPx[this.changingPlayer.id];
      delete this.playerDragPositionsPx[newPlayer.id];

      this.pitchPlayers[index] = newPlayer;

      if (this.selectedPlayer === this.changingPlayer) {
        this.selectedPlayer = newPlayer;
      }
    }

    this.changingPlayer = undefined;
  }

  private canPlayRole(player: Player, role: string): boolean {
    return this.resolvePlayerRoles(player).includes(role);
  }

formations: Record<string, Array<{ role: string; x: number; y: number }>> = {
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
],
"4-2-3-1":[
 {role:"GK",x:10,y:50},

 {role:"DF",x:30,y:15},
 {role:"DF",x:30,y:40},
 {role:"DF",x:30,y:60},
 {role:"DF",x:30,y:85},

 {role:"MF",x:45,y:35},
 {role:"MF",x:45,y:65},

 {role:"MF",x:62,y:25},
 {role:"MF",x:62,y:50},
 {role:"MF",x:62,y:75},

 {role:"FW",x:85,y:50}
],
"4-1-4-1":[
 {role:"GK",x:10,y:50},

 {role:"DF",x:30,y:15},
 {role:"DF",x:30,y:40},
 {role:"DF",x:30,y:60},
 {role:"DF",x:30,y:85},

 {role:"MF",x:45,y:50},

 {role:"MF",x:62,y:20},
 {role:"MF",x:62,y:40},
 {role:"MF",x:62,y:60},
 {role:"MF",x:62,y:80},

 {role:"FW",x:85,y:50}
],
"3-5-2":[
 {role:"GK",x:10,y:50},

 {role:"DF",x:30,y:25},
 {role:"DF",x:30,y:50},
 {role:"DF",x:30,y:75},

 {role:"MF",x:52,y:15},
 {role:"MF",x:52,y:35},
 {role:"MF",x:52,y:50},
 {role:"MF",x:52,y:65},
 {role:"MF",x:52,y:85},

 {role:"FW",x:82,y:40},
 {role:"FW",x:82,y:60}
],
"5-3-2":[
 {role:"GK",x:10,y:50},

 {role:"DF",x:30,y:12},
 {role:"DF",x:28,y:30},
 {role:"DF",x:25,y:50},
 {role:"DF",x:28,y:70},
 {role:"DF",x:30,y:88},

 {role:"MF",x:55,y:25},
 {role:"MF",x:55,y:50},
 {role:"MF",x:55,y:75},

 {role:"FW",x:85,y:40},
 {role:"FW",x:85,y:60}
]



}



}
