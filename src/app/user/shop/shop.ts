// src/app/user/shop/shop.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameUi } from '../../models/game';
import { GamesService } from '../gameservice';
import { CartService } from '../../shared/cart';
import { LibraryService } from '../../services/library';
import { forkJoin } from 'rxjs';    
@Component({
  selector: 'app-shop',
  standalone: false,
  templateUrl: './shop.html',
  styleUrls: ['./shop.scss']
})
export class Shop implements OnInit {
  allGames: GameUi[] = [];
  filtered: GameUi[] = [];
  genres: string[] = [];
  loading = false;
  error: string | null = null;

  // '', 'Action', 'Open-World', ...
  selectedGenre = '';

   constructor(
    private games: GamesService,
    private cartService: CartService,
    private router: Router,
    private libraryService: LibraryService 
  ) {}

  ngOnInit(): void {
    console.log('[Shop] ngOnInit');
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.error = null;

    // ใช้ forkJoin เพื่อดึงข้อมูลเกมทั้งหมด และข้อมูลเกมในคลัง มาพร้อมๆ กัน
    forkJoin({
      games: this.games.getAll(),
      ownedIds: this.libraryService.getOwnedGameIds()
    }).subscribe({
      next: ({ games, ownedIds }) => {
        // แปลง array of owned IDs ให้เป็น Set เพื่อให้ค้นหาได้เร็วขึ้น
        const ownedIdSet = new Set(ownedIds);

        // เพิ่ม property 'isOwned' เข้าไปใน object ของเกมแต่ละชิ้น
        this.allGames = games.map(game => ({
          ...game,
          isOwned: ownedIdSet.has(game.id)
        }));

        // (ส่วนที่เหลือของโค้ดเหมือนเดิม)
        const uniq = new Set(this.allGames.map(g => (g.game_type ?? '').trim()).filter(v => !!v));
        this.genres = Array.from(uniq).sort((a, b) => a.localeCompare(b));
        
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('[Shop] fetch error:', err);
        this.error = 'โหลดข้อมูลเกมไม่สำเร็จ';
        this.loading = false;
      }
    });
  }

  onGenreChange(value: string): void {
    this.selectedGenre = value || '';
    console.log('[Shop] onGenreChange -> selectedGenre:', this.selectedGenre);
    this.applyFilter();
  }

  showAll(): void {
    this.selectedGenre = '';
    console.log('[Shop] showAll -> reset selectedGenre');
    this.applyFilter();
  }

  private applyFilter(): void {
    const g = this.selectedGenre.trim().toLowerCase();
    if (!g) {
      this.filtered = [...this.allGames];
      console.log('[Shop] applyFilter -> show all, count:', this.filtered.length);
      return;
    }

    this.filtered = this.allGames.filter(x => (x.game_type || '').toLowerCase() === g);
    console.log('[Shop] applyFilter -> genre:', this.selectedGenre, 'count:', this.filtered.length);

    // ดูตัวอย่าง 1 แถวหลังกรอง
    if (this.filtered.length) {
      console.log('[Shop] filtered sample:', this.filtered[0]);
    }
  }

  trackById(_: number, it: GameUi) {
    return it.id;
  }



  // 4. สร้างเมธอดสำหรับปุ่ม "ADD"
  addToCart(game: any, event: MouseEvent): void {
    // ป้องกันไม่ให้ event click ลามไปถึง <a> ที่ครอบอยู่
    event.preventDefault();
    event.stopPropagation(); 
    this.cartService.addItem(game);
    // (Optional) อาจจะแสดง Notification ว่า "Added to cart!"
    console.log(`${game.title} added to cart!`);
  }

  // 5. สร้างเมธอดสำหรับปุ่ม "BUY"
  buyNow(game: any, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.cartService.clearCart(); // (Optional) ล้างตะกร้าก่อนเพิ่มของชิ้นใหม่
    this.cartService.addItem(game);
    this.router.navigate(['/shopping-cart']); // นำทางไปหน้าตะกร้า
  }
}
