// src/app/core/services/modal.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private activeModalId$ = new BehaviorSubject<string | null>(null);

  // เปิด Modal โดยรับ ID ของ Modal ที่ต้องการเปิด
  open(modalId: string): void {
    this.activeModalId$.next(modalId);
  }

  // ปิด Modal ที่เปิดอยู่
  close(): void {
    this.activeModalId$.next(null);
  }

  // สร้าง Observable สำหรับให้ Component ของ Modal ตรวจสอบว่าตัวเองควรเปิดหรือไม่
  isOpen(modalId: string): Observable<boolean> {
    return this.activeModalId$.pipe(
      map(activeId => activeId === modalId)
    );
  }
}