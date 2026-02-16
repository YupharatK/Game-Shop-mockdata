// src/app/core/interceptors/auth-interceptor.ts
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth'; // ตรวจสอบ Path ให้ถูกต้อง

@Injectable()
export class AuthInterceptor implements HttpInterceptor { // <-- กลับมาเป็น Class

  constructor(private authService: AuthService) {} // <-- ใช้ constructor เหมือนเดิม

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authToken = this.authService.getToken();
    console.log(`%c[AuthInterceptor] Intercepting: ${request.method} ${request.url}`, 'color: orange;');
    console.log('%c[AuthInterceptor] Token from AuthService:', 'color: orange;', authToken);

    if (authToken) {
       console.log('%c[AuthInterceptor] Token exists. Adding Authorization header.', 'color: lightgreen;');
      const authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
      return next.handle(authReq);
    }
    return next.handle(request);
  }
}