import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { FormationService } from '../services/formation.service';
import { environment } from '../../environments/environment';

interface LeagueApiResponse {
  leagueId: number;
  leagueName: string;
  clubs: unknown[] | null;
}

@Component({
  selector: 'app-questionnaire',
  standalone: true,
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.css'],
  imports: [ReactiveFormsModule,FormsModule,NgIf

  ]
})
export class QuestionnaireComponent {
  form: FormGroup;
  isOpen=false;
  private formationService=inject(FormationService)
  leagues: LeagueApiResponse[] = [];
  private http: HttpClient = inject(HttpClient);
  private router: Router = inject(Router);
 ngOnInit() {
   this.LoadLeagues();
 }
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      league:[null, Validators.required],
      preferredFormation: [null, Validators.required],
      playingStyle: [null, Validators.required],
      budget: [null, [Validators.required,Validators.min(0)]]
    });
  }

toggleDropdown(){
  this.isOpen=!this.isOpen
}
selectLeague(name:string){
this.form.patchValue({
  league: name
})
this.isOpen=false;
}


  ////دا بيحمل الدوريات ف السيلكت بوكس
 LoadLeagues(){
   console.log("Before HTTP");
    this.http.get<LeagueApiResponse[]>(`${environment.apiBaseUrl}/api/players/leagues`)
    .subscribe({
        next: res => {
          this.leagues = Array.isArray(res) ? res : [];
          console.log("SUCCESS", this.leagues);
        },
      error: err => console.log("ERROR", err)
    });

  console.log("After HTTP");
 }
 
  submitAnswers() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
console.log(this.form.value)
  const formation=this.form.value.preferredFormation;
    this.formationService.setFormation(formation);
    console.log(formation)
    this.router.navigate(['/program/squad-planning'])
  //   this.http.post('http://localhost:3000/answers', this.form.value)
  //     .subscribe({
  //       next: (res) => {
  //         console.log('Submitted successfully', res);
  //         this.router.navigate(['/scouting'])
  //       },
  //       error: (err) => console.error('Submission error', err)
  //     });
    }
}
