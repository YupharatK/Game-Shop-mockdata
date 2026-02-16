// src/app/auth/auth-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// ใช้ชื่อ Component ที่เป็นมาตรฐาน (มี ...Component ต่อท้าย)
import { LoginComponent} from './login/login';
import { RegisterComponent } from './register/register'; 


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { } 