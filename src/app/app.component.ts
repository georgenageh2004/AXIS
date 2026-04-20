import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavComponent } from "./landing/nav/nav.component";
import { FooterComponent } from "./landing/footer/footer.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, NavComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'AXIS';
  showMarketingShell = true;
  private router = inject(Router);
  private readonly marketingRoutes = new Set(['/', '/about', '/contact']);

  constructor() {
    this.updateShellVisibility(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.updateShellVisibility(event.urlAfterRedirects);
      });
  }

  private updateShellVisibility(url: string): void {
    const cleanPath = url.split('?')[0].split('#')[0] || '/';
    this.showMarketingShell = this.marketingRoutes.has(cleanPath);
  }
}
