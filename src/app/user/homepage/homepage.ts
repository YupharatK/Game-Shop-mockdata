import { Component, OnInit } from '@angular/core';
import { GamesService } from '../gameservice';
import { LibraryService } from '../../services/library';
import { of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CartService } from '../../shared/cart';
import { Router } from '@angular/router';

type CardGame = {
  id: number;
  imageUrl: string;
  title: string;
  price: number | string;
  qty_sold?: number;  // ✅ เพิ่ม field สำหรับยอดขาย
  isOwned?: boolean;
};

@Component({
  selector: 'app-homepage',
  standalone: false,
  templateUrl: './homepage.html',
  styleUrls: ['./homepage.scss']
})
export class HomepageComponent implements OnInit {
  bestSellers: CardGame[] = [];
  loadingTop = false;
  topError: string | null = null;

  newReleases: CardGame[] = [
    { id: 7, imageUrl: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=1200&q=80&auto=format&fit=crop', title: 'The Witcher 3: Wild Hunt', price: 799 },
    { id: 8, imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80&auto=format&fit=crop', title: "No Man's Sky", price: 899 }
  ];

  constructor(
    private games: GamesService,
    private libraryService: LibraryService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTopSellers();
  }

  private loadTopSellers(): void {
    this.loadingTop = true;
    this.topError = null;

    forkJoin({
      best: this.games.getTopSellers(),
      ownedIds: this.libraryService.getOwnedGameIds()
    })
      .pipe(
        map(({ best, ownedIds }: any) => {
          const ownedSet = new Set(ownedIds);
          return (best ?? [])
            .map((g: any) => ({
              id: g.id,
              imageUrl: g.image_url ?? g.imageUrl ?? '',
              title: g.name ?? g.title ?? 'Untitled',
              price: g.price,
              qty_sold: g.qty_sold ?? 0, // ✅ รองรับฟิลด์ยอดขาย
              isOwned: ownedSet.has(g.id)
            }))
            // ✅ เรียงจากยอดขายมาก → น้อย
            .sort((a: CardGame, b: CardGame) => (b.qty_sold ?? 0) - (a.qty_sold ?? 0));

        }),
        catchError(err => {
          console.error('[Homepage] loadTopSellers error:', err);
          this.topError = 'Failed to load Best Sellers';
          return of([] as CardGame[]);
        })
      )
      .subscribe(list => {
        this.bestSellers = list;
        this.loadingTop = false;
      });
  }

  addToCart(game: CardGame, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.cartService.addItem(game);
  }

  buyNow(game: CardGame, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.cartService.clearCart();
    this.cartService.addItem(game);
    this.router.navigate(['/shopping-cart']);
  }
}
