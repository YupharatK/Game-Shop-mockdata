import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GamesService } from '../gameservice';
import { LibraryService } from '../../services/library';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-game-details',
  standalone: false,
  templateUrl: './game-details.html',
  styleUrls: ['./game-details.scss']
})
export class GameDetails implements OnInit {
  game$!: Observable<any>;
  isOwned = false;

  constructor(
    private route: ActivatedRoute,
    private gamesService: GamesService,
    private libraryService: LibraryService
  ) {}

  ngOnInit(): void {
    const gameId = Number(this.route.snapshot.paramMap.get('id'));
    if (!gameId) return;

    // โหลดข้อมูลเกม
    this.game$ = this.gamesService.getById(gameId);

    // ✅ ตรวจจริงว่าเกมนี้อยู่ในคลังผู้ใช้หรือไม่
    this.libraryService.getOwnedGameIds().subscribe({
      next: (ids: number[]) => {
        this.isOwned = ids.includes(gameId);
      },
      error: (err) => {
        console.error('[GameDetails] ตรวจคลังเกมผิดพลาด:', err);
        this.isOwned = false;
      }
    });
  }

  addToCart(game: any): void {
    console.log('🛒 Add to cart', game?.id);
  }

  buyNow(game: any): void {
    console.log('💳 Buy now', game?.id);
  }

  playGame(game: any): void {
    console.log('▶️ Play game', game?.id);
    alert(`Launching ${game?.name}...`);
  }
}
