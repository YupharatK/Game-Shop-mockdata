// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap } from 'rxjs'; // 1. Import 'tap' เพิ่ม
import { ConfigService } from '../core/config'; 
import { User } from '../models/user.model';
import { RegisterData, LoginData, LoginResponse } from '../models/auth.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private router: Router
  ) {
    // เมื่อ Service ถูกสร้าง, ให้โหลดข้อมูลผู้ใช้จาก localStorage ทันที
    this.loadCurrentUser();
  }

  // Getter สำหรับดึงค่า user ปัจจุบันแบบทันที
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // --- เมธอดหลักสำหรับจัดการ Authentication ---

  register(userData: RegisterData, profileImage: File): Observable<{ message: string, user: User }> {
    const formData = new FormData();
    formData.append('username', userData.username);
    formData.append('email', userData.email);
    if (userData.password) {
      formData.append('password', userData.password);
    }
    formData.append('profile_image', profileImage, profileImage.name);

    return this.http.post<{ message: string, user: User }>(this.config.authEndpoints.register, formData);
  }

  login(credentials: LoginData): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.config.authEndpoints.login, credentials)
      .pipe(
        // 2. ใช้ tap operator เพื่อจัดการ "Side Effect" หลังจาก API response กลับมาสำเร็จ
        tap(response => {
          if (response && response.token && response.user) {
            // 3. รวมข้อมูล user และ token เข้าด้วยกัน
            const userWithToken: User = { 
              ...response.user, 
              token: response.token 
            };
            // 4. เรียกใช้เมธอดกลางเพื่ออัปเดตสถานะและบันทึกข้อมูล
            this._setCurrentUser(userWithToken);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this._setCurrentUser(null); // เรียกใช้เมธอดกลางเพื่อเคลียร์สถานะ
    this.router.navigate(['/homepage']);
  }
  
  // --- เมธอดสำหรับจัดการสถานะภายใน Service ---

  // เมธอดนี้จะถูกเรียกใช้โดย EditProfileModalComponent หลังจากอัปเดตโปรไฟล์สำเร็จ
  public updateCurrentUser(updatedUserProperties: Partial<User>): void {
    // รวมข้อมูลเดิมกับข้อมูลใหม่ เพื่อให้แน่ใจว่า token ไม่หายไป
    const mergedUser = { ...this.currentUserValue, ...updatedUserProperties } as User;
    this._setCurrentUser(mergedUser);
  }

  // โหลดข้อมูลจาก localStorage ตอนเปิดแอป
  private loadCurrentUser(): void {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      const user: User = JSON.parse(userJson);
      this._setCurrentUser(user);
    }
  }

  // ✨ เมธอด private ที่เป็นศูนย์กลางในการอัปเดตสถานะทั้งหมด ✨
  private _setCurrentUser(user: User | null): void {
    if (user) {
      // ตรวจสอบและแก้ไข URL รูปภาพ (ถ้าจำเป็น)
      if (user.profile_image && !user.profile_image.startsWith('http')) {
        user.profile_image = `${environment.apiUrl}/${user.profile_image.replace(/\\/g, '/')}`;
      }
      // บันทึกข้อมูลลง localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      // ถ้า user เป็น null (logout) ให้ลบข้อมูลออกจาก localStorage
      localStorage.removeItem('currentUser');
    }
    // ส่งข้อมูล user ใหม่ออกไปให้ทั่วทั้งแอปรับรู้
    this.currentUserSubject.next(user);
  }

  public getToken(): string | null {
  const user = this.currentUserValue;
  return user?.token ?? null;
  }
}