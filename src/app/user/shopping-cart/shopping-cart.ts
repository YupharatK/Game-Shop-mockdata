import { Component } from '@angular/core';
import { CartService } from '../../shared/cart';
import { OrderService } from '../../services/order';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

// ✅ ใช้ service ส่วนลดของฝั่งแอดมิน (ต้องชี้ path ให้ถูกกับโปรเจ็กต์คุณ)
import { DiscountsService, Discount } from '../../admin/services/discount';

@Component({
  selector: 'app-shopping-cart',
  standalone: false,
  templateUrl: './shopping-cart.html',
  styleUrls: ['./shopping-cart.scss']
})
export class ShoppingCartComponent {
  items$: Observable<any[]>;

  // ส่วนลด (ฝั่ง client)
  discountCode = '';
  appliedCode: string | null = null;
  appliedPercent = 0;
  discountAmount = 0;
  discountMessage: string | null = null;
  loadingDiscount = false;

  private itemsSub?: Subscription;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private discountsApi: DiscountsService
  ) {
    this.items$ = this.cartService.items$;
    // เมื่อรายการเปลี่ยน คำนวณส่วนลดใหม่
    this.itemsSub = this.items$.subscribe(() => this.recalcDiscountAmount());
  }

  ngOnDestroy(): void {
    this.itemsSub?.unsubscribe();
  }

  get subtotal(): number {
    return this.cartService.getSubtotal();
  }

  get total(): number {
    const t = this.subtotal - this.discountAmount;
    return t < 0 ? 0 : t;
  }

  removeItem(item: any): void {
    this.cartService.removeItem(item);
  }

  // ---------- ส่วนลด (client-side preview) ----------
  applyDiscount(): void {
    const code = (this.discountCode || '').trim();
    if (!code) {
      this.discountMessage = 'Please enter a code.';
      return;
    }

    this.loadingDiscount = true;
    this.discountMessage = null;

    // ✅ ดึงจาก /api/discounts/active (ฝั่งหลังบ้านกรอง used_count < max_usage แล้ว)
    this.discountsApi.getActive().subscribe({
      next: (rows: Discount[]) => {
        const found = rows.find(r => (r.code || '').toLowerCase() === code.toLowerCase());

        if (!found) {
          this.clearApplied(); // เคลียร์สถานะเก่า
          this.discountMessage = 'Invalid or exhausted discount code.';
          this.loadingDiscount = false;
          return;
        }

        // ใช้โค้ดนี้เป็น preview (การตัดสิทธิ์จริงจะทำใน backend ตอน checkout)
        this.appliedCode = found.code;
        this.appliedPercent = Number(found.discount_percent) || 0;
        this.recalcDiscountAmount();
        this.discountMessage = `Applied ${this.appliedCode} (${this.appliedPercent}%)`;
        this.loadingDiscount = false;
      },
      error: (err) => {
        console.error('[Cart] /discounts/active error:', err);
        this.discountMessage = 'Failed to validate discount. Please try again.';
        this.loadingDiscount = false;
      }
    });
  }

  clearDiscount(): void {
    this.clearApplied();
    this.discountMessage = null;
    this.discountCode = '';
  }

  private clearApplied(): void {
    this.appliedCode = null;
    this.appliedPercent = 0;
    this.discountAmount = 0;
  }

  private recalcDiscountAmount(): void {
    if (!this.appliedPercent || !this.appliedCode) {
      this.discountAmount = 0;
      return;
    }
    const amt = (this.subtotal * this.appliedPercent) / 100;
    this.discountAmount = Math.max(0, Math.round(amt * 100) / 100);
  }

  // ---------- Checkout ----------
  proceedToCheckout(): void {
    const items = this.cartService.getCurrentItems();
    if (items.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    // ✅ ส่ง payload ตรงตาม backend: { items, discountCode }
    const payload = {
      items,
      discountCode: this.appliedCode || null
    };

    this.orderService.checkout(payload).subscribe({
      next: (response) => {
        console.log('Checkout successful!', response);
        alert('Purchase successful!');
        this.cartService.clearCart();
        this.clearDiscount();
        this.router.navigate(['/my-games']);
      },
      error: (err) => {
        console.error('Checkout failed:', err);
        // แสดงข้อความจาก backend (เช่น Invalid discount / maximum usage / insufficient funds)
        alert(err?.error?.message || 'An error occurred during checkout. Please try again.');
      }
    });
  }
}
