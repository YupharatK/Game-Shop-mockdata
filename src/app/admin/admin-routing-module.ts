// src/app/admin/admin-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout'; 
import { DashboardComponent } from './dashboard/dashboard'; 
import { GamesComponent } from './games/games';
import { UsersComponent } from './users/users';
import { TransactionComponent } from './transaction/transaction';
import { DiscountsComponent } from './discounts/discounts';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent, // ใช้ LayoutComponent เป็นกรอบ
    children: [ // กำหนดให้ path เหล่านี้เป็น "ลูก" ที่จะแสดงใน <router-outlet> ของ Layout
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent},
      { path: 'games', component: GamesComponent},
      { path: 'users', component: UsersComponent },
      { path: 'transactions', component: TransactionComponent },
      { path: 'discounts', component: DiscountsComponent }

      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }