// edit-profile-modal.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ModalService } from '../../core/services/modal'; 
import { User } from '../../models/user.model';
import { UserService } from '../user.service';  // <-- 1. Import UserService (Frontend)
import { AuthService } from '../../auth/auth';   // <-- 2. Import AuthService

@Component({
  selector: 'app-edit-profile-modal',
  standalone: false,
  templateUrl: './edit-profile-modal.html',
  styleUrls: ['./edit-profile-modal.scss']
})
export class EditProfileModalComponent implements OnInit {
  @Input() user: User | null = null;
  
  isOpen$: Observable<boolean>;
  editForm: FormGroup;
  private selectedFile: File | null = null; // ตัวแปรสำหรับเก็บไฟล์ที่เลือก

  constructor(
    private modalService: ModalService,
    private fb: FormBuilder,
    private userService: UserService, // <-- 3. Inject UserService
    private authService: AuthService  // <-- 4. Inject AuthService
  ) {
    this.editForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
    this.isOpen$ = this.modalService.isOpen('editProfileModal');
  }

  ngOnInit(): void {
    if (this.user) {
      this.editForm.patchValue({
        username: this.user.username,
        email: this.user.email
      });
    }
  }

  // เมธอดสำหรับจัดการเมื่อผู้ใช้เลือกไฟล์
  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
      console.log('Selected file:', this.selectedFile.name);
    }
  }

  // เมธอดหลักสำหรับบันทึกการเปลี่ยนแปลง
  saveChanges(): void {
    if (this.editForm.invalid) {
      return; // ถ้าฟอร์มไม่ถูกต้อง ให้ออกจากฟังก์ชัน
    }

    // 1. สร้าง FormData object
    const formData = new FormData();

    // 2. เพิ่มข้อมูลจากฟอร์มเข้าไป
    formData.append('username', this.editForm.get('username')?.value);
    formData.append('email', this.editForm.get('email')?.value);

    // 3. ตรวจสอบว่ามีไฟล์ใหม่ถูกเลือกหรือไม่
    if (this.selectedFile) {
      // ชื่อ 'profile_image' ต้องตรงกับที่ Backend (Multer) คาดหวัง
      formData.append('profile_image', this.selectedFile);
    }

    // 4. เรียกใช้ Service เพื่อส่งข้อมูลไปอัปเดต
    this.userService.updateProfile(formData).subscribe({
      next: (response) => {
        console.log('Profile updated successfully!', response);
        
        // 5. อัปเดตข้อมูลผู้ใช้ใน AuthService เพื่อให้ UI ทั้งหมด (เช่น Navbar) อัปเดตตาม
        this.authService.updateCurrentUser(response.user);

        this.closeModal(); // ปิด Modal เมื่อสำเร็จ
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        // TODO: แสดงข้อความแจ้งเตือนผู้ใช้ว่าเกิดข้อผิดพลาด
      }
    });
  }

  closeModal(): void {
    this.modalService.close();
  }
}