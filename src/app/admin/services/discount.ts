// src/app/admin/services/discounts.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

// ---- Types ----
export interface Discount {
  id: number;
  code: string;
  discount_percent: number; // 0..100
  max_usage: number;        // สิทธิ์รวม
  used_count: number;       // ใช้ไปแล้ว
  created_at: string;       // ISO string (จาก DB)
}

export interface CreateDiscountDto {
  code: string;
  discount_percent: number;
  max_usage: number;
  // expires_at?: string; // ถ้ามีใน backend ค่อยเปิดใช้
}

export type UpdateDiscountDto = Partial<CreateDiscountDto>;

// ---- Service ----
@Injectable({ providedIn: 'root' })
export class DiscountsService {
  private baseUrl = `${environment.apiUrl}/api/discounts`;

  constructor(private http: HttpClient) {}

  /**
   * ลูกค้า: เอาเฉพาะโค้ดที่ยังเหลือสิทธิ์ (max_usage - used_count > 0)
   * GET /api/discounts/active
   */
  getActive(): Observable<Discount[]> {
    return this.http.get<Discount[]>(`${this.baseUrl}/active`).pipe(
      catchError(err => this.handle(err, 'โหลดส่วนลดที่ยังใช้งานได้ล้มเหลว'))
    );
    }

  /**
   * แอดมิน: ดึงทั้งหมด (รวมที่สิทธิ์หมดแล้ว)
   * GET /api/discounts
   */
  getAll(): Observable<Discount[]> {
    return this.http.get<Discount[]>(this.baseUrl).pipe(
      catchError(err => this.handle(err, 'โหลดรายการส่วนลดล้มเหลว'))
    );
  }

  /**
   * แอดมิน: สร้างโค้ดส่วนลด
   * POST /api/discounts
   */
  create(data: CreateDiscountDto): Observable<Discount> {
    return this.http.post<Discount>(this.baseUrl, data).pipe(
      catchError(err => this.handle(err, 'สร้างโค้ดส่วนลดล้มเหลว'))
    );
  }

  /**
   * แอดมิน: อัปเดตโค้ดส่วนลด
   * PUT /api/discounts/:id
   */
  update(id: number, data: UpdateDiscountDto): Observable<Discount> {
    return this.http.put<Discount>(`${this.baseUrl}/${id}`, data).pipe(
      catchError(err => this.handle(err, 'อัปเดตโค้ดส่วนลดล้มเหลว'))
    );
  }

  /**
   * แอดมิน: ลบโค้ดส่วนลด
   * DELETE /api/discounts/:id
   */
  delete(id: number): Observable<{ message?: string }> {
    return this.http.delete<{ message?: string }>(`${this.baseUrl}/${id}`).pipe(
      catchError(err => this.handle(err, 'ลบโค้ดส่วนลดล้มเหลว'))
    );
  }

  // ---- Error handler ----
  private handle(err: any, msg: string) {
    console.error('[DiscountsService]', msg, err);
    return throwError(() => err);
  }
}
