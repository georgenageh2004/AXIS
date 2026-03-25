import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
private http=inject(HttpClient)
 private baseUrl = 'http://localhost:3000/users';

 login(email:string,password:string){
  return this.http.get<any>( `${this.baseUrl}?email=${email}&password=${password}`)
 }

}
