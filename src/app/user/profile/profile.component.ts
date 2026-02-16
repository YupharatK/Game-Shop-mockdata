// src/app/user/profile/profile.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth';
import { User } from '../../models/user.model';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { ModalService } from '../../core/services/modal';
import { WalletService } from '../../services/wallet'; // <-- 1. Import WalletService

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {

  user: User | null = null;
  faPencilAlt = faPencilAlt;
  private userSubscription: Subscription | undefined;

  // 2. สร้างตัวแปรใหม่สำหรับเก็บข้อมูล Wallet และ Transaction
  walletBalance: number = 0;
  transactionHistory: any[] = []; // เริ่มต้นด้วย array ว่าง
  isTopupModalOpen = false;

  constructor(
    private authService: AuthService,
    private modalService: ModalService,
    private walletService: WalletService // <-- 3. Inject WalletService
  ) {}

  ngOnInit(): void {
    // ดึงข้อมูลผู้ใช้จาก AuthService (เหมือนเดิม)
    this.userSubscription = this.authService.currentUser$.subscribe(currentUser => {
      this.user = currentUser;
    });

    // 4. เรียกใช้ฟังก์ชันเพื่อดึงข้อมูล Wallet จาก API
    this.loadWalletData();
  }

  // 5. สร้างฟังก์ชันสำหรับดึงข้อมูล Wallet และ Transaction
  loadWalletData(): void {
    this.walletService.getWalletData().subscribe({
      next: (data) => {
        this.walletBalance = data.wallet_balance;
        this.transactionHistory = data.transaction_history;
        console.log('Wallet data loaded:', data);
      },
      error: (err) => {
        console.error('Failed to load wallet data:', err);
        // (Optional) แสดงข้อความ Error ให้ผู้ใช้เห็น
      }
    });
  }

  // 6. สร้างฟังก์ชันสำหรับเติมเงิน
  addFunds(amount: number): void {
    this.walletService.topup(amount).subscribe({
      next: (response) => {
        console.log('Top-up successful!', response);
        // อัปเดตยอดเงินในหน้าเว็บทันที
        this.walletBalance = response.new_balance;
        
        // (Optional) โหลดประวัติ Transaction ใหม่อีกครั้งเพื่อให้แสดงรายการล่าสุด
        this.loadWalletData();
      },
      error: (err) => {
        console.error('Top-up failed:', err);
        // (Optional) แสดงข้อความ Error ให้ผู้ใช้เห็น
      }
    });
  }

  editProfile(): void {
    this.modalService.open('editProfileModal');
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }


  openTopupModal(): void {
    this.isTopupModalOpen = true;
  }

  // ฟังก์ชันสำหรับปิด Topup Modal
  closeTopupModal(): void {
    this.isTopupModalOpen = false;
  }

  // ฟังก์ชันสำหรับรับค่าจาก Modal แล้วส่งไปเติมเงิน
  handleTopupConfirmation(amount: number): void {
    this.addFunds(amount);
    this.closeTopupModal(); // ปิด Modal หลังยืนยัน
  }
}