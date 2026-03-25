import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from "@angular/material/icon";
import { max, min } from 'rxjs';

@Component({
  selector: 'app-filters',
   standalone: true,
  imports: [ReactiveFormsModule, MatIcon],
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {
private fb = inject(FormBuilder);
private http =inject(HttpClient);
 leagues: any[] = [];
 clubs:any[]=[];
 nationality:any[]=[]
 filteredClubs: any[] = [];

  filtersForm!: FormGroup;
  age_rule:any={
    age:{min:15 , max:45}
  }

  // قواعد كل Position
  POSITION_RULES: any = {
    attacker: {
      GoalsScored: { min: 0, max: 300 },
      AssitsProvided: { min: 0, max: 300 },
      ExpectedGoals: { min: 0, max: 200 },
      ExpectedAssistes: { min: 0, max: 200 },
      // Defender stats
      TotalTackels:{min:0,max:150},
      BlocksMade:{min:0,max:200},
      Interceptions:{min:0,max:300},
      Clearances:{min:0,max:300},
      //Passing &Creativity Stats
      Progressivepasses:{min:0,max:500},
      KeyPasses:{min:0,max:2000},
      PassesIntothePenaltyArea:{min:0,max:500},
      //Goalkeeping stats
      SavesMade:{min:0,max:0},
      CleanSheates:{min:0,max:0},
      penaltySaved:{min:0,max:0},
      //Possession& Ball Control
      Touches:{min:0,max:900},
      Carries:{min:0,max:800},
      
    },
    midfielder: {
       GoalsScored: { min: 0, max: 70 },
      AssitsProvided: { min: 0, max: 500 },
      ExpectedGoals: { min: 0, max: 40 },
      ExpectedAssistes: { min: 0, max: 700 },
      // Defender stats
      TotalTackels:{min:0,max:200},
      BlocksMade:{min:0,max:300},
      Interceptions:{min:0,max:400},
      Clearances:{min:0,max:400},
      //Passing &Creativity Stats
      Progressivepasses:{min:0,max:500},
      KeyPasses:{min:0,max:3000},
      PassesIntothePenaltyArea:{min:0,max:400},
      //Goalkeeping stats
      SavesMade:{min:0,max:0},
      CleanSheates:{min:0,max:0},
      penaltySaved:{min:0,max:0},
      //Possession& Ball Control
      Touches:{min:0,max:950},
      Carries:{min:0,max:900},
      
    },
    defender: {
      GoalsScored: { min: 0, max: 30 },
      AssitsProvided: { min: 0, max: 200 },
      ExpectedGoals: { min: 0, max: 40 },
      ExpectedAssistes: { min: 0, max: 220 },
      // Defender stats
      TotalTackels:{min:0,max:300},
      BlocksMade:{min:0,max:400},
      Interceptions:{min:0,max:500},
      Clearances:{min:0,max:600},
      //Passing &Creativity Stats
      Progressivepasses:{min:0,max:300},
      KeyPasses:{min:0,max:2000},
      PassesIntothePenaltyArea:{min:0,max:100},
      //Goalkeeping stats
      SavesMade:{min:0,max:0},
      CleanSheates:{min:0,max:0},
      penaltySaved:{min:0,max:0},
      //Possession& Ball Control
      Touches:{min:0,max:900},
      Carries:{min:0,max:800},
    },
    goalkeeper: {
      GoalsScored: { min: 0, max: 6 },
      AssitsProvided: { min: 0, max: 20 },
      ExpectedGoals: { min: 0, max: 10 },
      ExpectedAssistes: { min: 0, max: 25 },
      // Defender stats
      TotalTackels:{min:0,max:20},
      BlocksMade:{min:0,max:200},
      Interceptions:{min:0,max:100},
      Clearances:{min:0,max:300},
      //Passing &Creativity Stats
      Progressivepasses:{min:0,max:500},
      KeyPasses:{min:0,max:2000},
      PassesIntothePenaltyArea:{min:0,max:10},
      //Goalkeeping stats
      SavesMade:{min:0,max:500},
      CleanSheates:{min:0,max:100},
      penaltySaved:{min:0,max:70},
      //Possession& Ball Control
      Touches:{min:0,max:400},
      Carries:{min:0,max:300},
     
    }
  };

  ngOnInit(): void {
    this.initForm();
    // this.handlePositionChange();
    this.loadleagus();
    this.loadNationalities();
    this.loadclubs();
    

    this.filtersForm.get('league')?.valueChanges.subscribe(leagueName => {
    this.filteredClubs = this.clubs.filter(c => c.leagueName == leagueName);
  });
  }
  ///هنا هبقا اربط ال api بتاع الدوريات 
 loadleagus(){
  this.http.get<any[]>('assets/leagues.json').subscribe({
    next: (data) => {
          this.leagues = data;
          console.log(data);
        },
        error: (err) => console.error(err)
     
  })
 }
 ///هنا هبقا اربط ال api بتاع الاندية 
 loadclubs(){
  this.http.get<any[]>('assets/clubs.json').subscribe({
    next:(data)=>{
      this.clubs=data;
      console.log(data);
    },
    error:(err)=>console.error(err)
  })
 }
 //هنا هبقا اربط api بتاع الجنسيات
 loadNationalities(){
  this.http.get<any[]>('assets/nationality.json').subscribe({
    next:(data)=>{
      this.nationality=data
      console.log(data)
    },
    error:(err)=>console.error(err)
  })
 }
 
  // 1) إنشاء الفورم
  initForm() {
    this.filtersForm = this.fb.group({
      position: ['',[Validators.required]],
      league:[''],
      clubs:[''],
      nationality:[''],

      ageMin:[null],
      ageMax:[null],

      GoalsScoredMin: [null],
      GoalsScoredMax: [null],

      ExpectedGoalsMin: [null],
     ExpectedGoalsMax: [null],

      AssitsProvidedMin: [null],
      AssitsProvidedMax: [null],

      ExpectedAssistesMin: [null],
      ExpectedAssistesMax: [null],

      TotalTackelsMin: [null],
      TotalTackelsMax: [null],

      BlocksMadeMin: [null],
      BlocksMadeMax: [null],

      InterceptionsMin: [null],
      InterceptionsMax: [null],

      ClearancesMin: [null],
      ClearancesMax: [null],

      ProgressivepassesMin: [null],
      ProgressivepassesMax: [null],

      KeyPassesMin: [null],
      KeyPassesMax: [null],

      PassesIntothePenaltyAreaMin: [null],
      PassesIntothePenaltyAreaMax: [null],

      SavesMadeMin: [null],
      SavesMadeMax: [null],

      CleanSheatesMin: [null],
      CleanSheatesMax: [null],

      penaltySavedMin: [null],
      penaltySavedMax: [null],

      TouchesMin: [null],
      TouchesMax: [null],

      CarriesMin: [null],
      CarriesMax: [null],


    });
  }
get Possinvalid(){
return this.filtersForm.controls['position'].invalid
 
 }
toNumberOrDefault(value: any, def: number): number {
  if (value === '' || value === null || value === undefined) return def;
  const n = Number(value);
  return isNaN(n) ? def : n;
}

buildRange(
  minVal: any,
  maxVal: any,
  rule: { min: number; max: number }
) {
  let min = this.toNumberOrDefault(minVal, rule.min);
  let max = this.toNumberOrDefault(maxVal, rule.max);

  if (max < 0) {
  max = 0;
}
  // clamp بالقواعد
  min = Math.max(min, rule.min);
  max = Math.min(max, rule.max);

  // لو min > max → نشيل min
  if (min > max) {
    return { max };
  }

 

  return { min, max };
}

  // 4) قبل الريكوست صحّح كله
 sanitizeFilters() {
  const pos = this.filtersForm.value.position;
  if (!pos) return this.filtersForm.value;

  const v = this.filtersForm.value;
  const rules = this.POSITION_RULES[pos];
  const rule_age=this.age_rule
  return {
    position: pos,
    leagues: v.league || undefined,
    club: v.clubs || undefined,
    nationality: v.nationality || undefined,

    age: this.buildRange(v.ageMin, v.ageMax, rule_age.age),

    GoalsScored: this.buildRange(
      v.GoalsScoredMin,
      v.GoalsScoredMax,
      rules.GoalsScored
    ),

    ExpectedGoals: this.buildRange(
      v.ExpectedGoalsMin,
      v.ExpectedGoalsMax,
      rules.ExpectedGoals
    ),

    AssitsProvided: this.buildRange(
      v.AssitsProvidedMin,
      v.AssitsProvidedMax,
      rules.AssitsProvided
    ),

    ExpectedAssistes: this.buildRange(
      v.ExpectedAssistesMin,
      v.ExpectedAssistesMax,
      rules.ExpectedAssistes
    ),

    TotalTackels: this.buildRange(
      v.TotalTackelsMin,
      v.TotalTackelsMax,
      rules.TotalTackels
    ),

    BlocksMade: this.buildRange(
      v.BlocksMadeMin,
      v.BlocksMadeMax,
      rules.BlocksMade
    ),

    Interceptions: this.buildRange(
      v.InterceptionsMin,
      v.InterceptionsMax,
      rules.Interceptions
    ),

    Clearances: this.buildRange(
      v.ClearancesMin,
      v.ClearancesMax,
      rules.Clearances
    ),

     Progressivepasses: this.buildRange(
      v.ProgressivepassesMin,
      v.ProgressivepassesMax,
      rules.Progressivepasses
    ),
     KeyPasses: this.buildRange(
      v.KeyPassesMin,
      v.KeyPassesMax,
      rules.KeyPasses
    ),
     PassesIntothePenaltyArea: this.buildRange(
      v.PassesIntothePenaltyAreaMin,
      v.PassesIntothePenaltyAreaMax,
      rules.PassesIntothePenaltyArea
    ),

     SavesMade: this.buildRange(
      v.SavesMadeMin,
      v.SavesMadeMax,
      rules.SavesMade
    ),
     CleanSheates: this.buildRange(
      v.CleanSheatesMin,
      v.CleanSheatesMax,
      rules.CleanSheates
    ),
    penaltySaved: this.buildRange(
      v.penaltySavedMin,
      v.penaltySavedMax,
      rules.penaltySaved
    ),

     Touches: this.buildRange(
      v.TouchesMin,
      v.TouchesMax,
      rules.Touches
    ),

     Carries: this.buildRange(
      v.CarriesMin,
      v.CarriesMax,
      rules.Carries
    ),



  };
}


  // 5) لما اليوزر يدوس Apply
  applyFilters() {
    const cleanFilters = this.sanitizeFilters();

    console.log('Request Data:', cleanFilters);

    // هنا تبعت للباك
    // this.http.get('/players', { params: cleanFilters }).subscribe(...)
  }
}







































































//////حاسس انه ملهوش لازمة ومش فعالة 
  // 2) لو اليوزر غيّر البوزيشن
  // handlePositionChange() {
  //   this.filtersForm.get('position')?.valueChanges.subscribe(pos => {
  //     if (!pos) return;

  //     const rules = this.POSITION_RULES[pos];

  //     this.autoCorrectAll(rules); // أول ما يختار Position صحّح القيم الحالية لو أكبر/أصغر
  //   });
  // }

  // 3) تصحيح كل الإحصائيات حسب قواعد البوزيشن
  // autoCorrectAll(rules: any) {
  //   const updatedValues: any = {};
  //   let agemin=this.filtersForm.value.ageMin;
  //    let agemax=this.filtersForm.value.ageMax;
  //   if(agemin && agemin < 15){
  //     agemin = 15;
  //   }
  //   if(agemax&&agemax>45){
  //     agemax = 45;
  //   }
  //   if(agemax&&agemin && agemin>agemax){
  //     agemin = agemax;

  //   }
  //   updatedValues.ageMin=agemin;
  //   updatedValues.ageMax=agemax;

    
  //   // expected goals
  //   const xgMin = this.filtersForm.value.expectedGoalsMin;
  //   const xgMax = this.filtersForm.value.expectedGoalsMax;

  //   updatedValues.expectedGoalsMin = xgMin < rules.expectedGoals.min ? rules.expectedGoals.min : xgMin;
  //   updatedValues.expectedGoalsMax = xgMax > rules.expectedGoals.max ? rules.expectedGoals.max : xgMax;
    

  //   // passes
  //   const passesMin = this.filtersForm.value.passesMin;
  //   const passesMax = this.filtersForm.value.passesMax;

  //   updatedValues.passesMin = passesMin < rules.passes.min ? rules.passes.min : passesMin;
  //   updatedValues.passesMax = passesMax > rules.passes.max ? rules.passes.max : passesMax;

  //   // shots
  //   const shotsMin = this.filtersForm.value.shotsMin;
  //   const shotsMax = this.filtersForm.value.shotsMax;

  //   updatedValues.shotsMin = shotsMin < rules.shots.min ? rules.shots.min : shotsMin;
  //   updatedValues.shotsMax = shotsMax > rules.shots.max ? rules.shots.max : shotsMax;

  //   // chances
  //   const chancesMin = this.filtersForm.value.chancesMin;
  //   const chancesMax = this.filtersForm.value.chancesMax;

  //   updatedValues.chancesMin = chancesMin < rules.chances.min ? rules.chances.min : chancesMin;
  //   updatedValues.chancesMax = chancesMax > rules.chances.max ? rules.chances.max : chancesMax;

  //   this.filtersForm.patchValue(updatedValues, { emitEvent: false });
  // }