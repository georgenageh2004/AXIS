import { Component, inject, OnInit } from '@angular/core';
import { RadarComponent } from "./radar/radar.component";
import { PlayersProfile } from '../Models/Players_profile';
import { ProfileService } from '../services/profile.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-player-profile',
  standalone: true,
  imports: [RadarComponent,MatIcon],
  templateUrl: './player-profile.component.html',
  styleUrl: './player-profile.component.css'
})
export class PlayerProfileComponent implements OnInit {
player!:PlayersProfile;
private profileService=inject(ProfileService)
private route=inject(ActivatedRoute)
ngOnInit() {
  const id = Number(this.route.snapshot.paramMap.get('id'));

  this.profileService.getPlayerById(id).subscribe(data => {
    this.player = data!;
  });
}
similarPlayers = [
  {
    name: 'Ederson',
    club: 'Man City',
    position: 'GK',
    image: 'https://fbref.com/req/202302030/images/headshots/7a2e46a8_2022.jpg'
  },
  {
    name: 'Ter Stegen',
    club: 'Barcelona',
    position: 'GK',
    image: 'https://fbref.com/req/202302030/images/headshots/cd1acf9d_2022.jpg'
  },
  {
    name: 'Courtois',
    club: 'Real Madrid',
    position: 'GK',
    image: 'https://fbref.com/req/202302030/images/headshots/e06683ca_2022.jpg'
  },
  {
    name: 'Maignan',
    club: 'AC Milan',
    position: 'GK',
    image: 'https://fbref.com/req/202302030/images/headshots/b217ef29_2022.jpg'
  }
];
}

