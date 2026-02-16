import { Component, OnInit } from '@angular/core';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { AdminService } from '../services/admin'; 

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.html',
  styleUrls: ['./users.scss']
})
export class UsersComponent implements OnInit {
  faSearch = faSearch;

  users: any[] = [];
  filtered: any[] = [];
  loading = false;
  error: string | null = null;

  // คำค้นหา
  q = '';

  constructor(private adminApi: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;

    this.adminApi.getUsers().subscribe({
      next: (rows) => {
        this.users = rows ?? [];
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('[Users] getAll error:', err);
        this.error = 'ไม่สามารถดึงรายชื่อผู้ใช้ได้';
        this.loading = false;
      }
    });
  }

  // เรียกตอนพิมพ์ค้นหา
  applyFilter(): void {
    const key = (this.q || '').toLowerCase().trim();
    if (!key) {
      this.filtered = this.users.slice();
      return;
    }
    this.filtered = this.users.filter(u =>
      JSON.stringify(u).toLowerCase().includes(key)
    );
  }
}
