import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from "@angular/material/icon";
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatIcon,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private router=inject(Router)
  private Authservice=inject(AuthService)
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
 signup(){
this.router.navigate(['/signup'])
 }
onSubmit(){
  if(this.form.invalid)return
  const emailValue=this.form.value.email ??"";
  const passValue=this.form.value.password ??"";
  this.Authservice.login(emailValue,passValue).subscribe(
    users=>{
      if(users.length===1){
        console.log("login succes",users[0])
        
        this.router.navigate(['/questions'])
      }else{
        alert("login faild")
      }
       

    }
    
    
  )
}
}
