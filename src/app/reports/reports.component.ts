import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {
private router=inject(Router)
  details_1(){
  this.router.navigate(['/program/performance'])
}
  details_2(){
   this.router.navigate(['/program/finance'])
}
  details_3(){
   this.router.navigate(['/program/scout_report'])
}
  details_4(){
   this.router.navigate(['/program/recomend'])
}
}
