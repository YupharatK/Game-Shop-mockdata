// frontend-user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../core/config'; // 1. Import ConfigService

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // 2. Inject ConfigService เข้าไปใน constructor
  constructor(
    private http: HttpClient, 
    private config: ConfigService 
  ) { }

  // เมธอดสำหรับอัปเดตโปรไฟล์ รับ FormData
  updateProfile(formData: FormData): Observable<any> {
    // 3. ดึง URL ที่ถูกต้องมาจาก ConfigService
    const url = this.config.usersEndpoints.updateProfile;

    // 4. ใช้ URL ที่ดึงมาในการยิง API
    return this.http.patch(url, formData);
  }

  // คุณสามารถเพิ่มเมธอดอื่นๆ ที่เกี่ยวกับ user ได้ที่นี่
  // เช่น getUserProfile(), etc.
}