import { Routes } from '@angular/router';

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
    loadComponent: () =>
      import('./sign-up/sign-up.component').then((m) => m.SignUpComponent),
  },
  {
    path: 'questions',
    loadComponent: () =>
      import('./questionnaire/questionnaire.component').then(
        (m) => m.QuestionnaireComponent
      ),
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
        path: 'repots',
        loadComponent: () =>
          import('./reports/reports.component').then((m) => m.ReportsComponent),
      },
      {
        path: 'performance',
        loadComponent: () =>
          import('./reports/performance/performance.component').then(
            (m) => m.PerformanceComponent
          ),
      },
      {
        path: 'finance',
        loadComponent: () =>
          import('./reports/finance/finance.component').then((m) => m.FinanceComponent),
      },
      {
        path: 'recomend',
        loadComponent: () =>
          import('./reports/recomendation-report/recomendation-report.component').then(
            (m) => m.RecomendationReportComponent
          ),
      },
      {
        path: 'scout_report',
        loadComponent: () =>
          import('./reports/souting-report/souting-report.component').then(
            (m) => m.SoutingReportComponent
          ),
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
        path: 'profile-details/:id',
        loadComponent: () =>
          import('./player-profile/player-profile.component').then(
            (m) => m.PlayerProfileComponent
          ),
      },
    ],
  },

];
