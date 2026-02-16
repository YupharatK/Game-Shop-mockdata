// src/app/user/user-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { HomepageComponent } from './homepage/homepage';
import { Shop } from './shop/shop';
import { MyGames } from './my-games/my-games';
import { GameDetails } from './game-details/game-details';  // นำเข้า GameDetails component
import { ShoppingCartComponent } from './shopping-cart/shopping-cart';
import { ProfileComponent } from './profile/profile.component';
import { SearchComponent } from './pages/search/search';
const routes: Routes = [
  {
    path: '',
    component: Layout, // 1. ใช้ LayoutComponent เป็นกรอบ
    children: [ // 2. กำหนดให้ path เหล่านี้เป็น "ลูก" ที่จะแสดงใน <router-outlet> ของ Layout
      { path: '', redirectTo: 'homepage', pathMatch: 'full' },
      { path: 'homepage', component: HomepageComponent },
      { path: 'shop', component: Shop },
      // { path: 'profile', component: ProfileComponent },
      { path: 'my-games', component: MyGames },
      { path: 'game-details/:id', component: GameDetails }, // เพิ่มเส้นทางสำหรับ GameDetails
      { path: 'shopping-cart', component: ShoppingCartComponent }, // เพิ่มเส้นทางสำหรับ ShoppingCart
      { path: 'profile', component: ProfileComponent }, // เพิ่มเส้นทางสำหรับ Profile
      { path: 'search', component: SearchComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }