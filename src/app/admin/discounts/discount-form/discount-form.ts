// ✅ src/app/admin/discounts/discount-form/discount-form.ts
import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// import { faCalendar } from '@fortawesome/free-solid-svg-icons'; // <-- ลบแล้ว
import { firstValueFrom } from 'rxjs';
import { DiscountsService } from '../../services/discount';

@Component({
  selector: 'app-discount-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './discount-form.html',
  styleUrls: ['./discount-form.scss']
})
export class DiscountForm implements OnChanges {
  @Input() isOpen = false;
  @Input() discountToEdit: any = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  // faCalendar = faCalendar; // <-- ลบแล้ว
  discountForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private api: DiscountsService) {
    this.discountForm = this.fb.group({
      codeName: ['', Validators.required],
      value: [0, [Validators.required, Validators.min(1)]],
      totalUses: [1, [Validators.required, Validators.min(1)]],
      expirationDate: ['', Validators.required]
    });
  }

  // ✅ เพิ่มฟังก์ชันนี้
  /**
   * แปลงค่าวันที่ (เช่น ISO string) ให้เป็น 'yyyy-mm-dd'
   * เพื่อใช้กับ <input type="date">
   */
  private formatDateForInput(dateStr: string | null): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      // ชดเชย Timezone offset เพื่อให้ได้วันที่ที่ถูกต้องตาม local
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      return date.toISOString().split('T')[0]; // คืนค่า 'yyyy-mm-dd'
    } catch (e) {
      return ''; // ถ้าแปลงไม่สำเร็จ
    }
  }

  // ✅ แก้ไข ngOnChanges
  ngOnChanges(): void {
    if (this.discountToEdit) {
      this.discountForm.patchValue({
        codeName: this.discountToEdit.code,
        value: this.discountToEdit.discount_percent,
        totalUses: this.discountToEdit.max_usage,
        expirationDate: this.formatDateForInput(this.discountToEdit.expiration_date)
      });
    } else {
      // แก้ไข reset ให้ใส่ค่าเริ่มต้น ไม่ใช่ null
      this.discountForm.reset({
        codeName: '',
        value: 0,
        totalUses: 1,
        expirationDate: ''
      });
    }
  }

  mapFormToCreateDto(formValue: any) {
    return {
      code: formValue.codeName,
      discount_percent: formValue.value,
      max_usage: formValue.totalUses,
      expiration_date: formValue.expirationDate // ค่า "yyyy-mm-dd" จาก form
    };
  }

  // ✅ แก้ไข onSave
  async onSave(): Promise<void> {
    if (this.discountForm.invalid || this.isSubmitting) return;
    this.isSubmitting = true;

    const payload = this.mapFormToCreateDto(this.discountForm.value);
    try {
      if (this.discountToEdit?.id) {
        await firstValueFrom(this.api.update(this.discountToEdit.id, payload));
      } else {
        await firstValueFrom(this.api.create(payload));
      }
      this.saved.emit();
      // this.closeModal.emit(); // <-- ลบออก
    } catch (e) {
      console.error('Save discount failed:', e);
      alert('Save failed.');
    } finally {
      this.isSubmitting = false;
    }
  }

  // ✅ แก้ไข onDelete
  async onDelete(): Promise<void> {
    if (!this.discountToEdit?.id || this.isSubmitting) return;
    const confirmed = confirm('Delete this discount code?');
    if (!confirmed) return;

    this.isSubmitting = true;
    try {
      await firstValueFrom(this.api.delete(this.discountToEdit.id));
      this.deleted.emit();
      // this.closeModal.emit(); // <-- ลบออก
    } catch (e) {
      console.error('Delete failed:', e);
      alert('Delete failed.');
    } finally {
      this.isSubmitting = false;
    }
  }

  onCancel(): void {
    this.closeModal.emit();
  }
}