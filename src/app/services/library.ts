// src/app/services/library.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { shareReplay, catchError } from 'rxjs/operators'; // ลบ delay ออกเพราะไม่จำเป็นแล้ว
import { ConfigService } from '../core/config';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  private ownedGameIds$: Observable<number[]> | null = null;

  constructor(private http: HttpClient, private config: ConfigService) {}

  getOwnedGameIds(): Observable<number[]> {
    if (!this.ownedGameIds$) {
      
      // --- โค้ดสำหรับเรียก API จริง ---
      // 1. ดึง URL ของ endpoint จาก ConfigService ที่เราเพิ่งแก้ไขไป
      const libraryEndpoint = this.config.libraryEndpoints.get;

      console.log('LibraryService is using REAL API endpoint:', libraryEndpoint);

      // 2. ยิง HTTP GET request ไปยัง Backend
      this.ownedGameIds$ = this.http.get<number[]>(libraryEndpoint).pipe(
        shareReplay(1), // Cache ผลลัพธ์ไว้เหมือนเดิม
        catchError(err => {
          // หากเกิดข้อผิดพลาด (เช่น user ยังไม่ login) 
          console.error('Could not fetch user library', err);
          return of([]); 
        })
      );
    }
    return this.ownedGameIds$;
  }

  // เมธอดสำหรับล้างข้อมูลเก่า (เผื่อใช้ตอน logout หรือซื้อเกมสำเร็จ)
  clearCache(): void {
    this.ownedGameIds$ = null;
  }
}