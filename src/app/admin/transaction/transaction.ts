// src/app/admin/transaction/transaction.component.ts
import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admin';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-transaction',
  standalone: false,
  templateUrl: './transaction.html',
  styleUrls: ['./transaction.scss']
})
export class TransactionComponent implements OnInit {
  // ตัวแปรสำหรับเก็บค่าจากฟอร์ม
  searchText: string = '';
  selectedType: string = ''; // 'purchase', 'top-up', หรือ '' สำหรับทั้งหมด

  // ตัวแปรสำหรับเก็บข้อมูล
  allTransactions: any[] = []; // เก็บ Transaction ทั้งหมดที่ดึงมาจาก API
  filteredTransactions: any[] = []; // เก็บ Transaction ที่ผ่านการกรองแล้วเพื่อนำไปแสดงผล
  isLoadingTransactions = false;
  faSearch = faSearch;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    // 1. เมื่อหน้าโหลดเสร็จ ให้ดึง Transaction ทั้งหมด
    this.isLoadingTransactions = true;
    this.adminService.getAllTransactions().subscribe(data => {
      this.allTransactions = data;
      this.filteredTransactions = data; // ตอนเริ่มต้นให้แสดงทั้งหมด
      this.isLoadingTransactions = false;
    });
  }

  // 2. ฟังก์ชันนี้จะทำงานเมื่อมีการเปลี่ยนแปลงค่าในช่องค้นหาหรือ Dropdown
  applyFilters(): void {
    let transactions = [...this.allTransactions];

    // กรองด้วย Search Text (ค้นหาจาก username และ email)
    if (this.searchText) {
      const lowerCaseSearch = this.searchText.toLowerCase();
      transactions = transactions.filter(tx =>
        tx.username.toLowerCase().includes(lowerCaseSearch) ||
        tx.email.toLowerCase().includes(lowerCaseSearch)
      );
    }

    // กรองด้วยประเภท Transaction
    if (this.selectedType) {
     transactions = transactions.filter(tx => 
        tx.type && tx.type.toLowerCase() === this.selectedType.toLowerCase()
      );
    }

    this.filteredTransactions = transactions;
  }
}