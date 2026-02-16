// src/app/user/profile/topup-modal/topup-modal.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-topup-modal',
  standalone: false,
  templateUrl: './topup-modal.html',
  styleUrls: ['./topup-modal.scss']
})
export class TopupModalComponent {
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() topupAmount = new EventEmitter<number>(); // ส่ง "จำนวนเงิน" กลับไป

  topupForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.topupForm = this.fb.group({
      // กำหนด validation ให้ต้องเป็นตัวเลขและมีค่ามากกว่า 0
      amount: ['', [Validators.required, Validators.min(1), Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]]
    });
  }

  onConfirm(): void {
    if (this.topupForm.invalid) {
      return;
    }
    const amount = this.topupForm.get('amount')?.value;
    this.topupAmount.emit(Number(amount)); // ส่งค่าที่กรอกกลับไป
    this.topupForm.reset(); // รีเซ็ตฟอร์ม
  }

  onCancel(): void {
    this.topupForm.reset(); // รีเซ็ตฟอร์ม
    this.closeModal.emit();
  }
}