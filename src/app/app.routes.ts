import { Routes } from '@angular/router';
import { SquadComponent } from './squad-planing/squad/squad.component';
import { QuestionnaireComponent } from './questionnaire/questionnaire.component';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { LayoytComponent } from './layoyt/layoyt.component';
import { ReportsComponent } from './reports/reports.component';
import { PerformanceComponent } from './reports/performance/performance.component';
import { FinanceComponent } from './reports/finance/finance.component';
import { RecomendationReportComponent } from './reports/recomendation-report/recomendation-report.component';
import { SoutingReportComponent } from './reports/souting-report/souting-report.component';
import { ScoutingComponent } from './scouting/scouting.component';
import { PlayerProfileComponent } from './player-profile/player-profile.component';

export const routes: Routes = [
{path:'login', component:LoginComponent},
{path:'signup' , component:SignUpComponent},
{path:'questions',component:QuestionnaireComponent},

{
    path:'',component:LayoytComponent,
    children:[
    {path:'', component:ScoutingComponent},
  
    {path:'squad-planning',component:SquadComponent},
    {path:'repots',component:ReportsComponent},
    {path:'performance',component:PerformanceComponent},
    {path:'finance',component:FinanceComponent},
    {path:'recomend', component:RecomendationReportComponent},
    {path:'scout_report',component:SoutingReportComponent},
    {path:'profile-details/:id',component:PlayerProfileComponent}


    ]

},



];
