import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing-module';
import { LayoutComponent } from './layout/layout';
import { DashboardComponent } from './dashboard/dashboard';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { GamesComponent } from './games/games';
import { GameFormComponent } from './games/game-form/game-form';
import { ReactiveFormsModule } from '@angular/forms';
import { UsersComponent } from './users/users';
import { TransactionComponent } from './transaction/transaction';
import { SharedModule } from "../shared/shared-module";


@NgModule({
  declarations: [
    LayoutComponent,
    DashboardComponent,
    GamesComponent,
    GameFormComponent,
    UsersComponent,
    TransactionComponent,
    
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    FormsModule
]
})
export class AdminModule { }
