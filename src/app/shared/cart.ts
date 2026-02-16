// src/app/shared/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // BehaviorSubject: เก็บรายการสินค้าและสถานะเปิด/ปิดตะกร้า
  private itemsSubject = new BehaviorSubject<any[]>(this.loadFromStorage());
  private isCartOpenSubject = new BehaviorSubject<boolean>(false);

  items$ = this.itemsSubject.asObservable();
  isCartOpen$ = this.isCartOpenSubject.asObservable();

  constructor() {}

  // ✅ โหลดข้อมูลจาก localStorage (กันหายเมื่อรีเฟรช)
  private loadFromStorage(): any[] {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  // ✅ บันทึกลง localStorage ทุกครั้งที่ตะกร้าเปลี่ยน
  private saveToStorage(items: any[]): void {
    localStorage.setItem('cart', JSON.stringify(items));
  }

  // ✅ เพิ่มเกมโดยตรวจว่าซ้ำหรือยัง
  addItem(item: any): void {
    const currentItems = this.itemsSubject.getValue();

    // เช็กว่ามีเกมนี้อยู่แล้วหรือไม่ (เทียบจาก id)
    const exists = currentItems.some(it => it.id === item.id);
    if (exists) {
      alert(`${item.title || item.name} is already in your cart!`);
      return;
    }

    const updatedItems = [...currentItems, item];
    this.itemsSubject.next(updatedItems);
    this.saveToStorage(updatedItems);

    // เปิดตะกร้าอัตโนมัติหลังเพิ่ม
    this.openCart();
  }

  // ✅ ลบเกมออกจากตะกร้า
  removeItem(itemToRemove: any): void {
    const currentItems = this.itemsSubject.getValue();
    const updatedItems = currentItems.filter(it => it.id !== itemToRemove.id);
    this.itemsSubject.next(updatedItems);
    this.saveToStorage(updatedItems);
  }

  // ✅ ล้างตะกร้าทั้งหมด
  clearCart(): void {
    this.itemsSubject.next([]);
    localStorage.removeItem('cart');
  }

  // ✅ เปิด/ปิดตะกร้า
  toggleCart(): void {
    this.isCartOpenSubject.next(!this.isCartOpenSubject.getValue());
  }

  openCart(): void {
    this.isCartOpenSubject.next(true);
  }

  closeCart(): void {
    this.isCartOpenSubject.next(false);
  }

  // ✅ รวมราคาทั้งหมด
  getSubtotal(): number {
    const items = this.itemsSubject.getValue();
    return items.reduce((acc, item) => {
      const price = typeof item.price === 'string'
        ? parseFloat(item.price.replace(/,/g, ''))
        : Number(item.price);
      return acc + (isNaN(price) ? 0 : price);
    }, 0);
  }

  // ✅ ดึงรายการปัจจุบัน (ใช้ใน checkout)
  getCurrentItems(): any[] {
    return this.itemsSubject.getValue();
  }
}
