import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatIcon } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, MatIcon, RouterLink],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  private http=inject(HttpClient)
private router=inject(Router)
 
form= new FormGroup({
  email:new  FormControl('',{
    validators:[Validators.email,Validators.required]
  }),
  password:new FormControl('',
    {
      validators:[Validators.required,Validators.minLength(6)]
    }
  ), username:new FormControl('',
    {
      validators:[Validators.required]
    }
  )

})
 get EmailInvalid(){
  return this.form.controls.email.touched&&
  this.form.controls.email.dirty&&
  this.form.controls.email.invalid
 }
 get PassInvalid(){
 return this.form.controls.password.touched&&
  this.form.controls.password.dirty&&
  this.form.controls.password.invalid
 }
  get userInvalid(){
 return this.form.controls.username.touched&&
  this.form.controls.username.dirty&&
  this.form.controls.username.invalid
 }
   onSupmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data = {
      username: this.form.value.username,
      email: this.form.value.email,
      password: this.form.value.password
    };

    this.http.post(`${environment.legacyJsonBaseUrl}/users`, data).subscribe({
      next: (res) => {
        console.log('User added:', res);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}