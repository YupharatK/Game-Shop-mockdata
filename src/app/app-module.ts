// src/app/app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router'; // 1. Import RouterModule
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { App } from './app';
import { AppRoutingModule } from './app-routing-module';
import { AuthInterceptor } from './core/interceptors/auth-interceptor'; 
import { MockBackendInterceptor } from './core/interceptors/mock-backend-interceptor';

@NgModule({
  declarations: [
    App,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule, // 4. Import AppRoutingModule to set up routing
    CommonModule,
    RouterModule // 5. Import RouterModule to enable routing functionalities

  ],
  providers: [
     { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
     { provide: HTTP_INTERCEPTORS, useClass: MockBackendInterceptor, multi: true }
  ],
  bootstrap: [App] // 6. Bootstrap the correct AppComponent
})
export class AppModule { }
