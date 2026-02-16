import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Observable, from } from 'rxjs';

import { User } from '../../models/user.model';

type UserRole = 'USER' | 'ADMIN';
type TxType = 'purchase' | 'topup';

interface MockUserRecord {
  id: number;
  username: string;
  email: string;
  password: string;
  profile_image: string;
  role: UserRole;
  wallet_balance: number;
  created_at: string;
}

interface MockGameTypeRecord {
  id: number;
  name: string;
}

interface MockGameRecord {
  id: number;
  name: string;
  price: number;
  image_url: string;
  description: string;
  release_date: string;
  created_at: string;
  type_id: number;
  qty_sold: number;
  rank_position?: number;
}

interface MockLibraryRecord {
  user_id: number;
  game_id: number;
  purchase_date: string;
}

interface MockDiscountRecord {
  id: number;
  code: string;
  discount_percent: number;
  max_usage: number;
  used_count: number;
  created_at: string;
  expiration_date?: string;
}

interface MockTransactionRecord {
  id: number;
  user_id: number;
  type: TxType;
  amount: number;
  description: string;
  created_at: string;
  discount_code?: string | null;
  item_ids?: number[];
}

interface MockDatabase {
  users: MockUserRecord[];
  gameTypes: MockGameTypeRecord[];
  games: MockGameRecord[];
  library: MockLibraryRecord[];
  discounts: MockDiscountRecord[];
  transactions: MockTransactionRecord[];
  nextIds: {
    user: number;
    game: number;
    discount: number;
    transaction: number;
  };
}

@Injectable()
export class MockBackendInterceptor implements HttpInterceptor {
  private readonly storageKey = 'game-shop.mockdb.v1';
  private readonly storageVersionKey = 'game-shop.mockdb.v1.version';
  private db: MockDatabase | null = null;
  private dbPromise: Promise<MockDatabase> | null = null;

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const url = new URL(req.url, window.location.origin);
    if (!url.pathname.includes('/api/')) {
      return next.handle(req);
    }

    return from(this.handleRequest(req, url));
  }

  private async handleRequest(req: HttpRequest<unknown>, url: URL): Promise<HttpResponse<unknown>> {
    const db = await this.getDb();
    const method = req.method.toUpperCase();
    const path = this.normalizePath(url.pathname);

    if (path === '/api/auth/login' && method === 'POST') {
      return this.handleLogin(req, db);
    }

    if (path === '/api/auth/register' && method === 'POST') {
      return this.handleRegister(req, db);
    }

    if (path === '/api/users/profile' && method === 'PATCH') {
      return this.handleUpdateProfile(req, db);
    }

    if (path === '/api/games' && method === 'GET') {
      return this.ok(db.games.map(game => this.toGameDto(game, db)));
    }

    if (path === '/api/games' && method === 'POST') {
      return this.handleCreateGame(req, db);
    }

    if (path === '/api/games/search' && method === 'GET') {
      const query = (url.searchParams.get('q') ?? '').trim();
      const normalizedQuery = this.normalizeSearchText(query);
      const queryTokens = this.tokenizeSearch(query);

      if (!normalizedQuery) {
        return this.ok([]);
      }

      const scored = db.games
        .map(game => {
          const dto = this.toGameDto(game, db);
          const score = this.scoreSearchResult(dto.name, dto.genre_name, normalizedQuery, queryTokens);
          return { dto, score };
        })
        .filter(result => result.score > 0)
        .sort((a, b) => {
          if (b.score !== a.score) {
            return b.score - a.score;
          }

          const soldA = a.dto.qty_sold ?? 0;
          const soldB = b.dto.qty_sold ?? 0;
          if (soldB !== soldA) {
            return soldB - soldA;
          }

          return a.dto.name.localeCompare(b.dto.name);
        })
        .map(result => result.dto);

      return this.ok(scored);
    }

    if (path === '/api/games/top-sellers' && method === 'GET') {
      const rows = db.games
        .slice()
        .sort((a, b) => (b.qty_sold ?? 0) - (a.qty_sold ?? 0))
        .map(game => this.toGameDto(game, db));
      return this.ok(rows);
    }

    const gamesByUserMatch = path.match(/^\/api\/games\/users\/(\d+)$/);
    if (gamesByUserMatch && method === 'GET') {
      const userId = Number(gamesByUserMatch[1]);
      const rows = db.library
        .filter(item => item.user_id === userId)
        .map(item => {
          const game = db.games.find(g => g.id === item.game_id);
          if (!game) {
            return null;
          }
          return {
            ...this.toGameDto(game, db),
            purchase_date: item.purchase_date
          };
        });
      const safeRows = rows.filter((row): row is NonNullable<typeof row> => row !== null);

      return this.ok(safeRows);
    }

    const gameByIdMatch = path.match(/^\/api\/games\/(\d+)$/);
    if (gameByIdMatch && method === 'GET') {
      const gameId = Number(gameByIdMatch[1]);
      const game = db.games.find(g => g.id === gameId);
      if (!game) {
        this.fail(404, 'Game not found');
      }
      return this.ok(this.toGameDto(game, db));
    }

    if (gameByIdMatch && method === 'PATCH') {
      const gameId = Number(gameByIdMatch[1]);
      return this.handleUpdateGame(req, db, gameId);
    }

    if (gameByIdMatch && method === 'DELETE') {
      const gameId = Number(gameByIdMatch[1]);
      const before = db.games.length;
      db.games = db.games.filter(g => g.id !== gameId);
      db.library = db.library.filter(item => item.game_id !== gameId);
      if (db.games.length === before) {
        this.fail(404, 'Game not found');
      }
      this.persist(db);
      return this.ok({ message: 'Game deleted' });
    }

    if (path === '/api/gametypes' && method === 'GET') {
      return this.ok(db.gameTypes.slice());
    }

    if (path === '/api/library' && method === 'GET') {
      const userId = this.getCurrentUserId(req);
      if (!userId) {
        return this.ok([]);
      }
      const ownedIds = db.library
        .filter(item => item.user_id === userId)
        .map(item => item.game_id);
      return this.ok(ownedIds);
    }

    if (path === '/api/wallet' && method === 'GET') {
      const userId = this.requireCurrentUserId(req);
      const user = this.findUserOrFail(db, userId);
      const transaction_history = db.transactions
        .filter(tx => tx.user_id === userId)
        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
        .map(tx => ({
          id: tx.id,
          type: tx.type === 'topup' ? 'Top-up' : 'Purchase',
          description: tx.description,
          amount: tx.amount,
          created_at: tx.created_at
        }));

      return this.ok({
        wallet_balance: user.wallet_balance,
        transaction_history
      });
    }

    if (path === '/api/wallet/topup' && method === 'POST') {
      const userId = this.requireCurrentUserId(req);
      const user = this.findUserOrFail(db, userId);
      const body = this.readBody(req.body);
      const amount = this.toNumber(body.amount);
      if (!amount || amount <= 0) {
        this.fail(400, 'Top-up amount must be greater than 0');
      }

      user.wallet_balance += amount;
      const tx: MockTransactionRecord = {
        id: db.nextIds.transaction++,
        user_id: userId,
        type: 'topup',
        amount,
        description: 'Top up wallet',
        created_at: this.nowIso()
      };
      db.transactions.push(tx);

      this.persist(db);

      return this.ok({
        message: 'Top-up successful',
        new_balance: user.wallet_balance,
        transaction: tx
      });
    }

    if (path === '/api/orders/checkout' && method === 'POST') {
      const userId = this.requireCurrentUserId(req);
      const user = this.findUserOrFail(db, userId);
      const body = this.readBody(req.body);
      const items: unknown[] = Array.isArray(body.items) ? body.items : [];

      if (!items.length) {
        this.fail(400, 'Your cart is empty');
      }

      const itemIds = items
        .map((item: unknown) => this.toNumber((item as { id?: unknown }).id))
        .filter((id: number) => Number.isFinite(id) && id > 0);

      const uniqueIds = Array.from(new Set(itemIds));
      const purchasableGames = db.games.filter(game => uniqueIds.includes(game.id));

      if (!purchasableGames.length) {
        this.fail(400, 'No valid items in cart');
      }

      const subtotal = purchasableGames.reduce((sum, game) => sum + game.price, 0);

      const discountCode = typeof body.discountCode === 'string' ? body.discountCode.trim() : '';
      let discountAmount = 0;
      let appliedDiscount: MockDiscountRecord | undefined;

      if (discountCode) {
        appliedDiscount = db.discounts.find(d => d.code.toLowerCase() === discountCode.toLowerCase());
        if (!appliedDiscount) {
          this.fail(400, 'Invalid discount code');
        }
        if (!this.isDiscountActive(appliedDiscount)) {
          this.fail(400, 'Invalid discount / maximum usage reached');
        }

        discountAmount = Math.round(((subtotal * appliedDiscount.discount_percent) / 100) * 100) / 100;
      }

      const total = Math.max(0, subtotal - discountAmount);

      if (user.wallet_balance < total) {
        this.fail(400, 'Insufficient funds');
      }

      user.wallet_balance -= total;

      for (const game of purchasableGames) {
        const alreadyOwned = db.library.some(entry => entry.user_id === userId && entry.game_id === game.id);
        if (!alreadyOwned) {
          db.library.push({
            user_id: userId,
            game_id: game.id,
            purchase_date: this.nowIso()
          });
        }
        game.qty_sold = (game.qty_sold ?? 0) + 1;
      }

      if (appliedDiscount) {
        appliedDiscount.used_count += 1;
      }

      const tx: MockTransactionRecord = {
        id: db.nextIds.transaction++,
        user_id: userId,
        type: 'purchase',
        amount: -total,
        description: `Purchase ${purchasableGames.length} game(s)`,
        created_at: this.nowIso(),
        discount_code: appliedDiscount?.code ?? null,
        item_ids: purchasableGames.map(game => game.id)
      };

      db.transactions.push(tx);
      this.persist(db);

      return this.ok({
        message: 'Checkout successful',
        subtotal,
        discount: discountAmount,
        total,
        new_balance: user.wallet_balance,
        purchased_game_ids: purchasableGames.map(game => game.id)
      });
    }

    if (path === '/api/admin/users' && method === 'GET') {
      const rows = db.users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        wallet_balance: user.wallet_balance,
        registrationDate: user.created_at.slice(0, 10)
      }));
      return this.ok(rows);
    }

    if (path === '/api/admin/transactions' && method === 'GET') {
      const rows = db.transactions
        .slice()
        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
        .map(tx => {
          const owner = db.users.find(user => user.id === tx.user_id);
          return {
            id: tx.id,
            username: owner?.username ?? 'Unknown',
            email: owner?.email ?? '-',
            type: tx.type,
            amount: tx.amount,
            date: tx.created_at.slice(0, 10),
            created_at: tx.created_at,
            description: tx.description
          };
        });
      return this.ok(rows);
    }

    const adminUserTxMatch = path.match(/^\/api\/admin\/users\/(\d+)\/transactions$/);
    if (adminUserTxMatch && method === 'GET') {
      const userId = Number(adminUserTxMatch[1]);
      const owner = db.users.find(user => user.id === userId);
      const rows = db.transactions
        .filter(tx => tx.user_id === userId)
        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
        .map(tx => ({
          id: tx.id,
          username: owner?.username ?? 'Unknown',
          email: owner?.email ?? '-',
          type: tx.type,
          amount: tx.amount,
          date: tx.created_at.slice(0, 10),
          created_at: tx.created_at,
          description: tx.description
        }));
      return this.ok(rows);
    }

    if (path === '/api/discounts/active' && method === 'GET') {
      const active = db.discounts.filter(discount => this.isDiscountActive(discount));
      return this.ok(active);
    }

    if (path === '/api/discounts' && method === 'GET') {
      const rows = db.discounts
        .slice()
        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
      return this.ok(rows);
    }

    if (path === '/api/discounts' && method === 'POST') {
      const body = this.readBody(req.body);
      const code = String(body.code ?? '').trim().toUpperCase();
      const discountPercent = this.toNumber(body.discount_percent);
      const maxUsage = this.toNumber(body.max_usage);
      const expirationDate = String(body.expiration_date ?? '').trim();

      if (!code || !discountPercent || !maxUsage) {
        this.fail(400, 'Invalid discount payload');
      }

      const already = db.discounts.some(d => d.code.toLowerCase() === code.toLowerCase());
      if (already) {
        this.fail(400, 'Discount code already exists');
      }

      const discount: MockDiscountRecord = {
        id: db.nextIds.discount++,
        code,
        discount_percent: discountPercent,
        max_usage: maxUsage,
        used_count: 0,
        created_at: this.nowIso(),
        expiration_date: expirationDate || undefined
      };

      db.discounts.push(discount);
      this.persist(db);
      return this.ok(discount, 201);
    }

    const discountByIdMatch = path.match(/^\/api\/discounts\/(\d+)$/);
    if (discountByIdMatch && method === 'PUT') {
      const discountId = Number(discountByIdMatch[1]);
      const discount = db.discounts.find(item => item.id === discountId);
      if (!discount) {
        this.fail(404, 'Discount not found');
      }

      const body = this.readBody(req.body);
      if (body.code !== undefined) {
        discount.code = String(body.code).trim().toUpperCase();
      }
      if (body.discount_percent !== undefined) {
        discount.discount_percent = this.toNumber(body.discount_percent);
      }
      if (body.max_usage !== undefined) {
        discount.max_usage = this.toNumber(body.max_usage);
      }
      if (body.expiration_date !== undefined) {
        discount.expiration_date = String(body.expiration_date || '').trim() || undefined;
      }

      this.persist(db);
      return this.ok(discount);
    }

    if (discountByIdMatch && method === 'DELETE') {
      const discountId = Number(discountByIdMatch[1]);
      const before = db.discounts.length;
      db.discounts = db.discounts.filter(item => item.id !== discountId);
      if (db.discounts.length === before) {
        this.fail(404, 'Discount not found');
      }
      this.persist(db);
      return this.ok({ message: 'Discount deleted' });
    }

    this.fail(404, `Mock endpoint not found: ${method} ${path}`);
  }

  private async handleLogin(req: HttpRequest<unknown>, db: MockDatabase): Promise<HttpResponse<unknown>> {
    const body = this.readBody(req.body);
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '').trim();

    const user = db.users.find(u => u.email.toLowerCase() === email && u.password === password);
    if (!user) {
      this.fail(401, 'Invalid email or password');
    }

    const token = `mock-token-${user.id}`;
    const redirectTo = user.role === 'ADMIN' ? '/admin/dashboard' : '/homepage';

    return this.ok({
      message: 'Login successful',
      token,
      redirectTo,
      user: this.toPublicUser(user)
    });
  }

  private async handleRegister(req: HttpRequest<unknown>, db: MockDatabase): Promise<HttpResponse<unknown>> {
    const body = this.readBody(req.body);
    const username = String(body.username ?? '').trim();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '').trim();

    if (!username || !email || !password) {
      this.fail(400, 'Invalid registration payload');
    }

    const duplicate = db.users.some(user => user.email.toLowerCase() === email);
    if (duplicate) {
      this.fail(400, 'Email already in use');
    }

    const newUser: MockUserRecord = {
      id: db.nextIds.user++,
      username,
      email,
      password,
      profile_image: this.generateAvatarUrl(username),
      role: 'USER',
      wallet_balance: 0,
      created_at: this.nowIso()
    };

    db.users.push(newUser);
    this.persist(db);

    return this.ok({ message: 'Registration successful', user: this.toPublicUser(newUser) }, 201);
  }

  private async handleUpdateProfile(req: HttpRequest<unknown>, db: MockDatabase): Promise<HttpResponse<unknown>> {
    const userId = this.requireCurrentUserId(req);
    const user = this.findUserOrFail(db, userId);
    const body = this.readBody(req.body);

    const nextUsername = body.username !== undefined ? String(body.username).trim() : user.username;
    const nextEmail = body.email !== undefined ? String(body.email).trim().toLowerCase() : user.email;

    if (!nextUsername || !nextEmail) {
      this.fail(400, 'Username and email are required');
    }

    const duplicatedEmail = db.users.some(u => u.id !== user.id && u.email.toLowerCase() === nextEmail.toLowerCase());
    if (duplicatedEmail) {
      this.fail(400, 'Email already in use');
    }

    user.username = nextUsername;
    user.email = nextEmail;

    if (body.profile_image !== undefined) {
      user.profile_image = this.generateAvatarUrl(nextUsername);
    }

    this.persist(db);

    return this.ok({ message: 'Profile updated', user: this.toPublicUser(user) });
  }

  private async handleCreateGame(req: HttpRequest<unknown>, db: MockDatabase): Promise<HttpResponse<unknown>> {
    const body = this.readBody(req.body);
    const name = String(body.name ?? '').trim();
    const price = this.toNumber(body.price);
    const typeId = this.toNumber(body.type_id);
    const description = String(body.description ?? '').trim();

    if (!name || !price || !typeId) {
      this.fail(400, 'Invalid game payload');
    }

    const game: MockGameRecord = {
      id: db.nextIds.game++,
      name,
      price,
      type_id: typeId,
      description,
      image_url: this.generateGameImageUrl(name),
      release_date: this.todayIsoDate(),
      created_at: this.nowIso(),
      qty_sold: 0
    };

    db.games.push(game);
    this.persist(db);

    return this.ok(this.toGameDto(game, db), 201);
  }

  private async handleUpdateGame(
    req: HttpRequest<unknown>,
    db: MockDatabase,
    gameId: number
  ): Promise<HttpResponse<unknown>> {
    const game = db.games.find(item => item.id === gameId);
    if (!game) {
      this.fail(404, 'Game not found');
    }

    const body = this.readBody(req.body);

    if (body.name !== undefined) {
      game.name = String(body.name).trim();
    }
    if (body.price !== undefined) {
      game.price = this.toNumber(body.price);
    }
    if (body.type_id !== undefined) {
      game.type_id = this.toNumber(body.type_id);
    }
    if (body.description !== undefined) {
      game.description = String(body.description ?? '').trim();
    }
    if (body.game_image !== undefined) {
      game.image_url = this.generateGameImageUrl(game.name);
    }

    this.persist(db);
    return this.ok(this.toGameDto(game, db));
  }

  private readBody(raw: unknown): any {
    if (!raw) {
      return {};
    }

    if (raw instanceof FormData) {
      const obj: any = {};
      raw.forEach((value, key) => {
        obj[key] = value;
      });
      return obj;
    }

    if (typeof raw === 'object') {
      return raw as any;
    }

    return {};
  }

  private toGameDto(game: MockGameRecord, db: MockDatabase) {
    const gameType = db.gameTypes.find(type => type.id === game.type_id);
    const genreName = gameType?.name ?? 'Unknown';

    return {
      id: game.id,
      name: game.name,
      price: game.price,
      image_url: game.image_url,
      description: game.description,
      release_date: game.release_date,
      created_at: game.created_at,
      type_id: game.type_id,
      genre_name: genreName,
      game_type: genreName,
      qty_sold: game.qty_sold,
      rank_position: game.rank_position
    };
  }

  private toPublicUser(user: MockUserRecord): User {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      profile_image: user.profile_image,
      role: user.role,
      wallet_balance: user.wallet_balance,
      created_at: user.created_at
    };
  }

  private isDiscountActive(discount: MockDiscountRecord): boolean {
    const usageOk = discount.used_count < discount.max_usage;
    if (!usageOk) {
      return false;
    }

    if (!discount.expiration_date) {
      return true;
    }

    const today = this.todayIsoDate();
    return discount.expiration_date >= today;
  }

  private findUserOrFail(db: MockDatabase, userId: number): MockUserRecord {
    const user = db.users.find(item => item.id === userId);
    if (!user) {
      this.fail(404, 'User not found');
    }
    return user;
  }

  private getCurrentUserId(req: HttpRequest<unknown>): number | null {
    const authHeader = req.headers.get('Authorization') ?? '';
    const tokenMatch = authHeader.match(/Bearer\s+mock-token-(\d+)/i);
    if (tokenMatch) {
      return Number(tokenMatch[1]);
    }

    const currentUserRaw = localStorage.getItem('currentUser');
    if (!currentUserRaw) {
      return null;
    }

    try {
      const parsed = JSON.parse(currentUserRaw) as { id?: unknown };
      const id = this.toNumber(parsed.id);
      return id || null;
    } catch {
      return null;
    }
  }

  private requireCurrentUserId(req: HttpRequest<unknown>): number {
    const userId = this.getCurrentUserId(req);
    if (!userId) {
      this.fail(401, 'Unauthorized');
    }
    return userId;
  }

  private normalizePath(pathname: string): string {
    return pathname.replace(/\/+$/, '') || '/';
  }

  private normalizeSearchText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private tokenizeSearch(value: string): string[] {
    const normalized = this.normalizeSearchText(value);
    if (!normalized) {
      return [];
    }
    return Array.from(new Set(normalized.split(' ').filter(Boolean)));
  }

  private scoreSearchResult(
    name: string,
    genre: string,
    normalizedQuery: string,
    queryTokens: string[]
  ): number {
    const normalizedName = this.normalizeSearchText(name);
    const normalizedGenre = this.normalizeSearchText(genre);
    const haystack = `${normalizedName} ${normalizedGenre}`.trim();
    const nameWords = normalizedName.split(' ').filter(Boolean);
    const genreWords = normalizedGenre.split(' ').filter(Boolean);

    if (!haystack) {
      return 0;
    }

    let score = 0;

    if (normalizedName === normalizedQuery) {
      score += 120;
    } else if (normalizedName.startsWith(normalizedQuery)) {
      score += 80;
    } else if (normalizedName.includes(normalizedQuery)) {
      score += 50;
    }

    if (normalizedGenre === normalizedQuery) {
      score += 40;
    } else if (normalizedGenre.startsWith(normalizedQuery)) {
      score += 20;
    }

    let matchedTokens = 0;
    for (const token of queryTokens) {
      if (nameWords.includes(token)) {
        score += 18;
        matchedTokens += 1;
      } else if (nameWords.some(word => word.startsWith(token))) {
        score += 12;
        matchedTokens += 1;
      } else if (genreWords.includes(token)) {
        score += 10;
        matchedTokens += 1;
      } else if (haystack.includes(token)) {
        score += 6;
        matchedTokens += 1;
      }
    }

    if (queryTokens.length > 0 && matchedTokens !== queryTokens.length) {
      score -= 40;
    }

    return Math.max(0, score);
  }

  private toNumber(value: unknown): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const num = Number(value);
      return Number.isFinite(num) ? num : 0;
    }

    return 0;
  }

  private nowIso(): string {
    return new Date().toISOString();
  }

  private todayIsoDate(): string {
    return this.nowIso().slice(0, 10);
  }

  private generateAvatarUrl(seed: string): string {
    const safe = encodeURIComponent(seed || 'user');
    return `https://api.dicebear.com/9.x/adventurer/svg?seed=${safe}`;
  }

  private generateGameImageUrl(seed: string): string {
    const safe = encodeURIComponent(seed || 'game');
    return `https://picsum.photos/seed/${safe}/1200/675`;
  }

  private ok<T>(body: T, status = 200): HttpResponse<T> {
    return new HttpResponse<T>({ status, body });
  }

  private fail(status: number, message: string): never {
    throw new HttpErrorResponse({
      status,
      statusText: 'Mock API Error',
      error: { message }
    });
  }

  private async getDb(): Promise<MockDatabase> {
    if (this.db) {
      return this.db;
    }

    if (!this.dbPromise) {
      this.dbPromise = this.loadDb();
    }

    this.db = await this.dbPromise;
    return this.db;
  }

  private async loadDb(): Promise<MockDatabase> {
    const cached = localStorage.getItem(this.storageKey);
    const cachedVersion = localStorage.getItem(this.storageVersionKey);

    const response = await fetch('/mock-data.json', { cache: 'no-store' });
    if (!response.ok) {
      this.fail(500, 'Cannot load mock-data.json');
    }

    const json = (await response.json()) as unknown;
    const source: any = (json && typeof json === 'object') ? json : {};
    const sourceVersion = source.mock_version !== undefined && source.mock_version !== null
      ? String(source.mock_version)
      : null;

    if (cached) {
      try {
        if (!sourceVersion || cachedVersion === sourceVersion) {
          return this.normalizeDb(JSON.parse(cached));
        }
      } catch {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.storageVersionKey);
      }
    }

    const db = this.normalizeDb(json);
    this.persist(db);
    if (sourceVersion) {
      localStorage.setItem(this.storageVersionKey, sourceVersion);
    } else {
      localStorage.removeItem(this.storageVersionKey);
    }
    return db;
  }

  private normalizeDb(raw: unknown): MockDatabase {
    const source: any = (raw && typeof raw === 'object') ? raw : {};

    const users = Array.isArray(source.users) ? source.users as MockUserRecord[] : [];
    const gameTypes = Array.isArray(source.gameTypes) ? source.gameTypes as MockGameTypeRecord[] : [];
    const games = Array.isArray(source.games) ? source.games as MockGameRecord[] : [];
    const library = Array.isArray(source.library) ? source.library as MockLibraryRecord[] : [];
    const discounts = Array.isArray(source.discounts) ? source.discounts as MockDiscountRecord[] : [];
    const transactions = Array.isArray(source.transactions) ? source.transactions as MockTransactionRecord[] : [];

    const nextIdsRaw: any = (source.nextIds && typeof source.nextIds === 'object')
      ? source.nextIds
      : {};

    const nextIds = {
      user: this.toNumber(nextIdsRaw.user) || (users.length ? Math.max(...users.map(u => u.id)) + 1 : 1),
      game: this.toNumber(nextIdsRaw.game) || (games.length ? Math.max(...games.map(g => g.id)) + 1 : 1),
      discount: this.toNumber(nextIdsRaw.discount) || (discounts.length ? Math.max(...discounts.map(d => d.id)) + 1 : 1),
      transaction: this.toNumber(nextIdsRaw.transaction) || (transactions.length ? Math.max(...transactions.map(t => t.id)) + 1 : 1)
    };

    return {
      users,
      gameTypes,
      games,
      library,
      discounts,
      transactions,
      nextIds
    };
  }

  private persist(db: MockDatabase): void {
    this.db = db;
    localStorage.setItem(this.storageKey, JSON.stringify(db));
  }
}
