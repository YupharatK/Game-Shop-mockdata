// src/app/admin/services/game.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ConfigService } from '../../core/config'; 

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) { }

  getGames(): Observable<any[]> {
    return this.http.get<any[]>(this.config.gamesEndpoints.getAll);
  }

 createGame(gameData: FormData): Observable<any> {
  return this.http.post<any>(this.config.gamesEndpoints.create, gameData);
}
  
  updateGame(id: number, gameData: FormData): Observable<any> {
    return this.http.patch<any>(this.config.gamesEndpoints.updateById(id), gameData);
  }

  deleteGame(id: number): Observable<any> {
    return this.http.delete<any>(this.config.gamesEndpoints.deleteById(id));
  }

  getGameTypes(): Observable<any[]> {
    return this.http.get<any[]>(this.config.gameTypesEndpoints.getAll);
  }

  searchGames(query: string): Observable<any[]> {
  const normalized = query.trim().replace(/\s+/g, ' ');
  const key = normalized.toLowerCase();
  const tokens = key.split(' ').filter(Boolean);

  const params = new HttpParams().set('q', normalized);

  return this.http.get<any[]>(this.config.gamesEndpoints.search, { params }).pipe(
    switchMap((results) => {
      if (Array.isArray(results) && results.length > 0) {
        return of(results);
      }
      return this.getGames().pipe(map((rows) => this.filterGames(rows, tokens)));
    }),
    catchError(() => this.getGames().pipe(map((rows) => this.filterGames(rows, tokens))))
  );
  }

  private filterGames(rows: any[], tokens: string[]): any[] {
    if (!tokens.length) {
      return rows ?? [];
    }

    return (rows ?? []).filter((g) => {
      const haystack = `${g?.name ?? ''} ${g?.genre_name ?? ''} ${g?.game_type ?? ''}`
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
      return tokens.every((t) => haystack.includes(t));
    });
  }
}
