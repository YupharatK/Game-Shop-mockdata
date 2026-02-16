// src/app/admin/discounts/discounts.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DiscountsService, Discount } from '../services/discount';        // ✅ path ให้ถูก (อยู่โฟลเดอร์เดียวกัน)
import { DiscountForm } from './discount-form/discount-form'; // ✅ modal form (standalone)

@Component({
  selector: 'app-discounts',
  standalone: true,                                        // ✅ ทำให้ standalone
  imports: [CommonModule, FontAwesomeModule, DiscountForm], // ✅ ใช้ fa-icon และ modal
  templateUrl: './discounts.html',
  styleUrls: ['./discounts.scss']
})
export class DiscountsComponent implements OnInit {
  faPlus = faPlus;
  faEdit = faPenToSquare;
  faDelete = faTrash;

  discounts: Discount[] = [];
  loading = false;
  error: string | null = null;

  isDiscountFormOpen = false;
  currentDiscountForEdit: Discount | null = null;

  constructor(private discountsApi: DiscountsService) {}

  ngOnInit(): void {
    this.loadDiscounts();
  }

  loadDiscounts(): void {
    this.loading = true;
    this.error = null;
    this.discountsApi.getAll().subscribe({
      next: (rows) => {
        this.discounts = rows ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error('[Discounts] getAll error:', err);
        this.error = 'ไม่สามารถดึงรายการส่วนลดได้';
        this.loading = false;
      }
    });
  }
    onSaved() {
      this.closeDiscountForm();   // ✅ ปิดโมดัล
      this.reloadAfterChange();   // โหลดรายการใหม่
      
    }

    onDeleted() {
      this.closeDiscountForm();   // ✅ ปิดโมดัล
      this.reloadAfterChange();
      
    }

    closeDiscountForm(): void {
      this.isDiscountFormOpen = false;
      this.currentDiscountForEdit = null;
    }

  openDiscountForm(discount: Discount | null = null): void {
    this.currentDiscountForEdit = discount;
    this.isDiscountFormOpen = true;
  }

  reloadAfterChange(): void {
    this.loadDiscounts();
  }

  deleteFromList(d: Discount): void {
    if (!confirm(`ลบโค้ด "${d.code}" ใช่หรือไม่?`)) return;
    this.discountsApi.delete(d.id).subscribe({
      next: () => this.loadDiscounts(),
      error: (err) => console.error('[Discounts] delete error:', err)
    });
  }

  remainingUses(d: Discount): number {
    const remain = (d.max_usage ?? 0) - (d.used_count ?? 0);
    return remain < 0 ? 0 : remain;
  }
}

