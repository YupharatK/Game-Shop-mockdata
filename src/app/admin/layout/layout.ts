// src/app/admin/layout/layout.component.ts
import { Component } from '@angular/core';
// Import ไอคอนที่ต้องการใช้จาก library
import { faTachometerAlt, faGamepad, faUsers, faCreditCard, faTag } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../auth/auth';
import { User } from '../../models/user.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class LayoutComponent { // หรือ class Layout ตามที่คุณใช้
  // สร้างตัวแปรเพื่อเก็บไอคอนแต่ละตัว
  faDashboard = faTachometerAlt;
  faGames = faGamepad;
  faUsers = faUsers;
  faTransaction = faCreditCard;
  faDiscounts = faTag;

  // 1. สร้าง Observable เพื่อรับข้อมูลผู้ใช้แบบ Real-time
  currentUser$: Observable<User | null>;

  // 2. Inject AuthService เข้ามาใช้งาน
  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  // 3. สร้างเมธอด logout ที่จะไปเรียกใช้ AuthService
  logout(): void {
    this.authService.logout();
  }
}