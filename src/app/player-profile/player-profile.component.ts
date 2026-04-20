import { Component, inject, OnInit } from '@angular/core';
import { RadarComponent } from "./radar/radar.component";
import { SimilarPlayersComponent } from './similar-players';
import { PlayersProfile } from '../Models/Players_profile';
import { ProfileService } from '../services/profile.service';
import { ActivatedRoute } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-player-profile',
  standalone: true,
  imports: [RadarComponent, SimilarPlayersComponent, MatIcon],
  templateUrl: './player-profile.component.html',
  styleUrl: './player-profile.component.css'
})
export class PlayerProfileComponent implements OnInit {
isLoading = true;
errorMessage = '';

player: PlayersProfile = {
  id: 0,
  name: '',
  position: '',
  image: '',
  age: 0,
  nationality: '',
  club: '',
  league: '-',
  stats: {
    PlayingTime: { Matchesplayed: 0, Gamesstarted: 0, Minutesplayed: 0, '90s': 0 },
    Attacking: { GoalsScored: 0, AssistsProvided: 0, 'Goals+Assists': 0, Expectedgoals: 0, Expectedassists: 0, npxG: 0, 'G-PK': 0 },
    Defensive: { Totaltackles: 0, Tackleswon: 0, Blocksmade: 0, Interceptions: 0, 'Tkl+Int': 0, Clearances: 0, Err: 0 },
    Goalkeeping: { GoalsConceded: 0, Savesmade: 0, Savepercentage: 0, Cleansheets: 0, Cleansheetpercentage: 0, Penaltiesfaced: 0, Penaltysaves: 0 },
    Possession: { Touches: 0, Carries: 0, Progressiveruns: 0, Miscontrols: 0, Dis: 0 },
    Miscellaneous: { Yellowcards: 0, Redcards: 0, Penaltieswon: 0, Penaltiesconceded: 0, Ballrecoveries: 0 },
    Passing: { ProgressivePasses: 0, Progressivecarries: 0, Keypasses: 0, PPA: 0 }
  }
};
private profileService=inject(ProfileService)
private route=inject(ActivatedRoute)
ngOnInit() {
  this.route.paramMap.subscribe(params => {
    const id = Number(params.get('id'));
    if (!id || Number.isNaN(id)) {
      this.isLoading = false;
      this.errorMessage = 'Invalid player id.';
      return;
    }

    this.isLoading = true;
    this.profileService.getPlayerById(id).subscribe({
      next: data => {
        this.player = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load player profile. Please try again.';
      }
    });
  });
}
}

