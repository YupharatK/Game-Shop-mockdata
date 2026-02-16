import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../core/config';

export interface CheckoutPayload {
  items: any[];
  discountCode?: string | null;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private http: HttpClient, private config: ConfigService) {}

  // overloads: ใช้ได้ทั้งแบบเดิม (items[]) และแบบใหม่ (payload)
  checkout(items: any[]): Observable<any>;
  checkout(payload: CheckoutPayload): Observable<any>;
  checkout(arg: any[] | CheckoutPayload): Observable<any> {
    const payload: CheckoutPayload = Array.isArray(arg) ? { items: arg } : arg;
    return this.http.post<any>(this.config.ordersEndpoints.checkout, payload);
  }
}
