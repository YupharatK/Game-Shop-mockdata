// src/app/admin/games/games.component.ts
import { Component, OnInit } from '@angular/core'; // Import OnInit
import { faPlus, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { GameService } from '../services/game'; // 1. Import GameService

@Component({
  selector: 'app-games',
  standalone: false,
  templateUrl: './games.html',
  styleUrls: ['./games.scss'],
})
export class GamesComponent implements OnInit { // 2. Implement OnInit
  faPlus = faPlus;
  faEdit = faPenToSquare;
  faDelete = faTrash;
  games: any[] = []; // 3. เริ่มต้นด้วย array ว่าง

  isGameFormOpen = false;
  currentGameForEdit: any | null = null;
  isConfirmDialogOpen = false;
  gameToDelete: any | null = null;

  // 4. Inject GameService
  constructor(private gameService: GameService) {}
  
  // 5. เมื่อ Component โหลดเสร็จ ให้ดึงข้อมูลเกมจาก API
  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.gameService.getGames().subscribe(data => {
      this.games = data.map(game => ({
        ...game,
        genre: game.genre_name // แมพชื่อ genre มาใส่
      }));
    });
  }

  openGameForm(game: any | null = null): void {
    this.currentGameForEdit = game;
    this.isGameFormOpen = true;
  }

  closeGameForm(): void {
    this.isGameFormOpen = false;
    this.currentGameForEdit = null;
  }

  handleFormSave(formData: FormData): void {
    if (this.currentGameForEdit) {
      // โหมดแก้ไข
      this.gameService.updateGame(this.currentGameForEdit.id, formData).subscribe(() => {
        this.loadGames(); // โหลดข้อมูลใหม่หลังอัปเดต
        this.closeGameForm();
      });
    } else {
      // โหมดเพิ่ม
      this.gameService.createGame(formData).subscribe(() => {
        this.loadGames(); // โหลดข้อมูลใหม่หลังเพิ่ม
        this.closeGameForm();
      });
    }
  }

  openConfirmDialog(game: any): void {
    this.gameToDelete = game;
    this.isConfirmDialogOpen = true;
  }

  handleConfirmation(isConfirmed: boolean): void {
    if (isConfirmed && this.gameToDelete) {
      this.gameService.deleteGame(this.gameToDelete.id).subscribe(() => {
        this.loadGames(); // โหลดข้อมูลใหม่หลังลบ
        this.isConfirmDialogOpen = false;
        this.gameToDelete = null;
      });
    } else {
      this.isConfirmDialogOpen = false;
      this.gameToDelete = null;
    }
  }
}