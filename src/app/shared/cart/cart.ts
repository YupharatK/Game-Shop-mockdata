// src/app/shared/cart/cart.component.ts
import { Component } from '@angular/core';
import { CartService} from '../cart';
import { Observable } from 'rxjs';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss']
})
export class CartComponent {
  isCartOpen$: Observable<boolean>;
  items$: Observable<any[]>;
   faTrash = faTrash;
  constructor(private cart: CartService) {
    this.isCartOpen$ = this.cart.isCartOpen$;
    this.items$ = this.cart.items$;
  }

  closeCart() {
    this.cart.closeCart();
  }

  removeItem(item: any) {
    this.cart.removeItem(item);
  }

  getSubtotal(): number {
    return this.cart.getSubtotal();
  }
}