import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from "@angular/material/icon";
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatIcon,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  authError = '';
  loading = false;
form= new FormGroup({
  email:new  FormControl('',{
    validators:[Validators.email,Validators.required]
  }),
  password:new FormControl('',
    {
      validators:[Validators.required,Validators.minLength(6)]
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

clearAuthError(): void {
  if (this.authError) {
    this.authError = '';
  }
}

onSubmit(){
  if(this.form.invalid){
    this.authError = '';
    this.form.markAllAsTouched();
    return;
  }

  const emailValue = (this.form.value.email ?? '').trim().toLowerCase();
  const passValue = this.form.value.password ?? '';

  this.loading = true;
  this.authService
    .login(emailValue, passValue)
    .pipe(finalize(() => (this.loading = false)))
    .subscribe({
      next: () => {
        this.authError = '';
        this.router.navigate(['/program']);
      },
      error: () => {
        this.authError = 'Invalid email or password.';
      }
    });
}
}
