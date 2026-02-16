// src/app/user/my-games/my-games.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../auth/auth';
import { GamesService } from '../gameservice';
import { GameUi } from '../../models/game';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-games',
  standalone: false,
  templateUrl: './my-games.html',
  styleUrls: ['./my-games.scss']
})
export class MyGames implements OnInit, OnDestroy {
  allGames: GameUi[] = [];
  filtered: GameUi[] = [];
  genres: string[] = [];
  selectedGenre = '';
  loading = false;
  error: string | null = null;

  private sub?: Subscription;

  constructor(private auth: AuthService, private games: GamesService, private router: Router) {}

  ngOnInit(): void {
    console.log('[MyGames] ngOnInit');
    this.loading = true;

    this.sub = this.auth.currentUser$
      .pipe(
        tap(u => console.log('[MyGames] currentUser$', u)),
        map(u => u?.id ?? null),
        tap(id => console.log('[MyGames] extracted userId:', id)),
        filter((id): id is number => typeof id === 'number'),
        switchMap(id => this.games.getByUser(id)),
        tap(rows => {
          console.log('[MyGames] getByUser -> count:', rows?.length ?? 0);
          if (rows?.length) {
            console.log('[MyGames] sample row:', rows[0]);
            console.table(
              rows.map(({ id, title, game_type, price }) => ({ id, title, game_type, price }))
            );
          }
        })
      )
      .subscribe({
        next: (data) => {
          this.allGames = data;

          const uniq = new Set(
            data.map(g => (g.game_type ?? '').trim()).filter(v => !!v)
          );
          this.genres = Array.from(uniq).sort((a,b)=>a.localeCompare(b));
          console.log('[MyGames] genres:', this.genres);

          this.applyFilter();
          this.loading = false;
        },
        error: (err) => {
          console.error('[MyGames] getByUser error:', err);
          this.error = 'โหลดเกมของฉันไม่สำเร็จ';
          this.loading = false;
        }
      });
  }

  ngOnDestroy(): void {
    console.log('[MyGames] ngOnDestroy -> unsubscribe');
    this.sub?.unsubscribe();
  }

  onGenreChange(value: string) {
    this.selectedGenre = value || '';
    console.log('[MyGames] onGenreChange -> selectedGenre:', this.selectedGenre);
    this.applyFilter();
  }

  showAll() {
    this.selectedGenre = '';
    console.log('[MyGames] showAll -> reset filter');
    this.applyFilter();
  }

  private applyFilter() {
    const g = this.selectedGenre.trim().toLowerCase();
    if (!g) {
      this.filtered = [...this.allGames];
      console.log('[MyGames] applyFilter -> show all, count:', this.filtered.length);
      return;
    }

    this.filtered = this.allGames.filter(x => (x.game_type || '').toLowerCase() === g);
    console.log('[MyGames] applyFilter -> game_type:', this.selectedGenre, 'count:', this.filtered.length);
    if (this.filtered.length) console.log('[MyGames] filtered sample:', this.filtered[0]);
  }

    openDetails(id: number) {
    this.router.navigate(['/game', id]);
  }
  trackById(_: number, it: GameUi) { return it.id; }
}
