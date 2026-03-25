import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { FormationService } from '../services/formation.service';

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
  leagues:any[]=[];
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
  this.http.get<any[]>('assets/leagues.json').subscribe({
    next : (data) => {
    this.leagues=data;
      console.log(data)
      
    },
    error: (err) => console.error(err)
  }
  )
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
    this.router.navigate(['/scouting'])
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
