// src/app/services/wallet.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../core/config';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  constructor(private http: HttpClient, private config: ConfigService) {}

  getWalletData(): Observable<any> {
    // คุณต้องไปเพิ่ม endpoint นี้ใน ConfigService ก่อน
    return this.http.get<any>(this.config.walletEndpoints.getWallet);
  }

  topup(amount: number): Observable<any> {
    // คุณต้องไปเพิ่ม endpoint นี้ใน ConfigService ก่อน
    return this.http.post<any>(this.config.walletEndpoints.topup, { amount });
  }
}