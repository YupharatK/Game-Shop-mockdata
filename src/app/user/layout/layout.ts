import { Component, OnInit } from '@angular/core';
import { CartService } from '../../shared/cart';
import { AuthService } from '../../auth/auth';
import { User } from '../../models/user.model';
import { faShoppingCart, faUser } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class Layout implements OnInit {

  currentUser: User | null = null;
  faCart = faShoppingCart;
  faUser = faUser;
  

  // **สำคัญ:** รวม constructor ให้เหลือแค่อันเดียว
  // และ inject service ทั้งหมดที่ต้องใช้ที่นี่
  constructor(
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleCart(): void {
    this.cartService.toggleCart();
  }

  logout(): void {
    this.authService.logout();
  }
}