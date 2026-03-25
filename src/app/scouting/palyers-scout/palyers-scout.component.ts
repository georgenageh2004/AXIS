import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-palyers-scout',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './palyers-scout.component.html',
  styleUrl: './palyers-scout.component.css'
})
export class PalyersScoutComponent {
  players:any[]=[];
  private http=inject(HttpClient);

  ngOnInit(){
    this.http.get<any>('assets/players.json').subscribe({
      next:(data)=>{
        this.players=data;
         console.log('Players Loaded:', this.players);


      },
      error:(err)=>console.error(err)
    })
  }

}
