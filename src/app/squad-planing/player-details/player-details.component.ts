import { Component, Input } from '@angular/core';
import { Player } from '../../Models/players';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-player-details',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  templateUrl: './player-details.component.html',
  styleUrl: './player-details.component.css'
})
export class PlayerDetailsComponent {
  @Input() player?: Player;
}
