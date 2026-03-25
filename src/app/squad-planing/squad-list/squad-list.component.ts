import { NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Player } from '../../Models/players';

@Component({
  selector: 'app-squad-list',
  standalone: true,
  imports: [FormsModule,NgFor],
  templateUrl: './squad-list.component.html',
  styleUrl: './squad-list.component.css'
})
export class SquadListComponent {
 @Input() players: Player[] = [];
 @Output() replacementSelected = new EventEmitter<Player>();

selectReplacement(player: Player) {
  this.replacementSelected.emit(player);
}

}
