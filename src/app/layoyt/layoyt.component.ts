import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SideBarComponent } from '../slide_bar/side-bar/side-bar.component';

@Component({
  selector: 'app-layoyt',
  standalone: true,
  imports: [RouterOutlet,SideBarComponent],
  templateUrl: './layoyt.component.html',
  styleUrl: './layoyt.component.css'
})
export class LayoytComponent {
  private router = inject(Router);
  isSidebarOpen = false;

  get isProfileRoute(): boolean {
    return this.router.url.startsWith('/program/profile-details/');
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  closeSidebarOnOverlay(): void {
    if ((window.innerWidth <= 991 || this.isProfileRoute) && this.isSidebarOpen) {
      this.isSidebarOpen = false;
    }
  }

}
