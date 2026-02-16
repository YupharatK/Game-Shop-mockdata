// src/app/auth/auth.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// 1. แก้ไข Path ให้ถูกต้อง: import Routing Module ของตัวเองจากโฟลเดอร์เดียวกัน
import { AuthRoutingModule } from './auth-routing-module';

// 2. แก้ไขชื่อ Component ให้เป็นมาตรฐาน
import { LoginComponent } from './login/login'; 
import { RegisterComponent } from './register/register'; 


@NgModule({
  // 3. ใช้ชื่อ Component ที่ถูกต้องและสอดคล้องกัน
  declarations: [
    LoginComponent,
    RegisterComponent,

  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule
  ]
})
export class AuthModule { }