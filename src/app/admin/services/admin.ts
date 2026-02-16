// src/app/admin/services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../core/config';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private http: HttpClient, private config: ConfigService) {}

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.config.adminEndpoints.getAllUsers);
  }

  // เมธอดใหม่สำหรับดึง Transaction ทั้งหมด
  getAllTransactions(): Observable<any[]> {
    return this.http.get<any[]>(this.config.adminEndpoints.getAllTransactions);
  }

  getUserTransactions(userId: number): Observable<any[]> {
    return this.http.get<any[]>(this.config.adminEndpoints.getUserTransactions(userId));
  }
}