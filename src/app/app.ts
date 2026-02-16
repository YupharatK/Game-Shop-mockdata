import { Component, signal } from '@angular/core';
import { Router } from '@angular/router'; // 1. Import Router
import { AuthService } from './auth/auth';  // 2. Import AuthService

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('game-shop');

  // 3. Inject AuthService และ Router เข้ามาใน constructor
  constructor(private authService: AuthService, private router: Router) {
    this.handleInitialRedirect();
  }

  private handleInitialRedirect(): void {
    const currentUser = this.authService.currentUserValue;

    if (currentUser) {
      // ถ้ามี user login อยู่ และผู้ใช้กำลังเข้าหน้าแรกสุด (path '/')
      // ให้ทำการ redirect ตาม role
      if (this.router.url === '/') {
        const redirectPath = currentUser.role === 'ADMIN' ? '/admin' : '/homepage';
        this.router.navigate([redirectPath]);
      }
    }
    // ถ้าไม่มี user login อยู่ ก็ไม่ต้องทำอะไร ปล่อยให้ AppRoutingModule จัดการ
  }
}