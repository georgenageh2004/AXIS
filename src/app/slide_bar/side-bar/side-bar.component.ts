import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [ MatIconModule,RouterLink,RouterLinkActive],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css'
})
export class SideBarComponent {
  @Input() isOpen = false;
  @Input() overlayMode = false;
  @Output() closeRequested = new EventEmitter<void>();

  requestClose(): void {
    this.closeRequested.emit();
  }

}
