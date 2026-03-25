import { Component } from '@angular/core';
import { FiltersComponent } from './filters/filters.component';
import { PalyersScoutComponent } from './palyers-scout/palyers-scout.component';

@Component({
  selector: 'app-scouting',
  standalone: true,
  imports: [FiltersComponent,PalyersScoutComponent],
  templateUrl: './scouting.component.html',
  styleUrl: './scouting.component.css'
})
export class ScoutingComponent {

}
