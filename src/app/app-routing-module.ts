// src/app/app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
const routes: Routes = [
  // --- Auth Routes (สำหรับ Login/Register) ---
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth-module').then(m => m.AuthModule)
  },

 
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin-module').then(m => m.AdminModule),
  },
  
  // --- User Routes (นี่คือส่วนที่ UserModule จะมารับผิดชอบทั้งหมด) ---
  {
    path: '', // ให้ UserModule จัดการทุก path ที่ไม่มี prefix อื่นๆ (เช่น homepage, shop)
    loadChildren: () => import('./user/user-module').then(m => m.UserModule)
  }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }