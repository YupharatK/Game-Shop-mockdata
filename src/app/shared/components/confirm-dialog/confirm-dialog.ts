// src/app/shared/components/confirm-dialog/confirm-dialog.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: false,
  templateUrl: './confirm-dialog.html',
  styleUrls: ['./confirm-dialog.scss']
})
export class ConfirmDialogComponent {
  @Input() isOpen: boolean = false;
  @Input() message: string = 'Are you sure?'; // ข้อความที่แสดงใน Popup
  @Output() confirmed = new EventEmitter<boolean>(); // ส่งค่า true (ยืนยัน) หรือ false (ยกเลิก)

  onConfirm(): void {
    this.confirmed.emit(true);
  }

  onCancel(): void {
    this.confirmed.emit(false);
  }
}