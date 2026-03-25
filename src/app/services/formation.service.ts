import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormationService {

  constructor() { }
  selectedFormation:string="4-3-3"
  setFormation(formation:string){
    this.selectedFormation=formation;
  }
  getFormation(){
  return this.selectedFormation;
  }
}
