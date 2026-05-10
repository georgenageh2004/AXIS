import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [ MatIconModule,RouterLink,RouterLinkActive],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css'
})
export class SideBarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  @Input() isOpen = false;
  @Input() overlayMode = false;
  @Output() closeRequested = new EventEmitter<void>();

  get showUserManagement(): boolean {
    return this.authService.isIt();
  }

  requestClose(): void {
    this.closeRequested.emit();
  }

  logout(): void {
    this.authService.logout();
    this.requestClose();
    this.router.navigate(['/login']);
  }

}
