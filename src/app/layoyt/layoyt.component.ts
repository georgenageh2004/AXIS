import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideBarComponent } from '../slide_bar/side-bar/side-bar.component';

@Component({
  selector: 'app-layoyt',
  standalone: true,
  imports: [RouterOutlet,SideBarComponent],
  templateUrl: './layoyt.component.html',
  styleUrl: './layoyt.component.css'
})
export class LayoytComponent {

}
