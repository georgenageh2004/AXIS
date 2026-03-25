import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideBarComponent } from './slide_bar/side-bar/side-bar.component';
import { SquadPitchComponent } from './squad-planing/squad-pitch/squad-pitch.component';
import { SquadComponent } from './squad-planing/squad/squad.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,SideBarComponent,SquadComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'AXIS';
}
