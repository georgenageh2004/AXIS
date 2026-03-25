import { Component } from '@angular/core';
import { SquadPitchComponent } from '../squad-pitch/squad-pitch.component';

@Component({
  selector: 'app-squad',
  standalone: true,
  imports: [SquadPitchComponent],
  templateUrl: './squad.component.html',
  styleUrl: './squad.component.css'
})
export class SquadComponent {

}
