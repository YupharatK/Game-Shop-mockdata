// src/app/admin/dashboard/dashboard.component.ts
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model'; 
import { AuthService } from '../../auth/auth';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent {
  summaryCards = [
    { title: 'Total Games', value: 50 },
    { title: 'Total Orders', value: 50, active: true },
    { title: 'Total Users', value: 50 }
  ];

  bestSellers = [
    { rank: '#1', title: 'Red Dead Redemption 2', sales: 1200 },
    { rank: '#2', title: 'Marvel\'s Spider-Man', sales: 980 },
    { rank: '#3', title: 'God of War PC', sales: 850 },
    { rank: '#4', title: 'Grand Theft Auto 5', sales: 845 },
    { rank: '#5', title: 'Forza Horizon 5', sales: 760 },
    { rank: '#6', title: 'Minecraft', sales: 650 },
    { rank: '#7', title: 'Battlefield 6', sales: 540 },
    { rank: '#8', title: 'Grounded', sales: 430 },
    { rank: '#9', title: 'House Flipper 2', sales: 320 },
    { rank: '#10', title: 'EA SPORTS FC 26', sales: 210 }
  ];
// 1. สร้าง Observable เพื่อรับข้อมูลผู้ใช้
  currentUser$: Observable<User | null>;

// 2. Inject AuthService เข้ามาใน constructor
  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

   logout(): void {
    this.authService.logout();
  }
}