import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { itRoleGuard } from './guards/it-role.guard';

export const routes: Routes = [
  // PUBLIC PAGES
  {
    path: '',
    loadComponent: () =>
      import('./landing/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./landing/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./landing/contact/contact.component').then((m) => m.ContactComponent),
  },

  {
    path: 'program',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./layoyt/layoyt.component').then((m) => m.LayoytComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./scouting/scouting.component').then((m) => m.ScoutingComponent),
      },
      {
        path: 'squad-planning',
        loadComponent: () =>
          import('./squad-planing/squad/squad.component').then((m) => m.SquadComponent),
      },
      {
        path: 'short-list',
        loadComponent: () =>
          import('./shortlist/shortlist.component').then((m) => m.ShortlistComponent),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashbord/dashbord.component').then((m) => m.DashbordComponent),
      },
      {
        path: 'user-management',
        canActivate: [itRoleGuard],
        loadComponent: () =>
          import('./user-management/user-management.component').then(
            (m) => m.UserManagementComponent
          ),
      },
      {
        path: 'profile-details/:id',
        loadComponent: () =>
          import('./player-profile/player-profile.component').then(
            (m) => m.PlayerProfileComponent
          ),
      },
    ],
  },

];
