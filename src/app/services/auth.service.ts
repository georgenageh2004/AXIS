import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
private http=inject(HttpClient)
 private baseUrl = `${environment.legacyJsonBaseUrl}/users`;

 login(email:string,password:string){
  return this.http.get<any>( `${this.baseUrl}?email=${email}&password=${password}`)
 }

}
