// src/app/admin/games/game-form/game-form.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core'; // 1. เพิ่ม OnInit
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faCloudUpload } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs'; // 2. Import Observable
import { GameService } from '../../services/game'; // 3. Import GameService

@Component({
  selector: 'app-game-form',
  standalone: false,
  templateUrl: './game-form.html',
  styleUrls: ['./game-form.scss']
})
export class GameFormComponent implements OnChanges, OnInit { // 4. Implement OnInit
  @Input() isOpen: boolean = false;
  @Input() gameToEdit: any | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveGame = new EventEmitter<FormData>();

  gameForm: FormGroup;
  faCloudUpload = faCloudUpload;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  gameTypes$!: Observable<any[]>; // 5. ตัวแปรสำหรับเก็บรายการประเภทเกม

  constructor(
    private fb: FormBuilder,
    private gameService: GameService // 6. Inject GameService
  ) {
    this.gameForm = this.fb.group({
      // เปลี่ยนชื่อ control จาก 'title' เป็น 'name' ให้ตรงกับ Database
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]],
      // เปลี่ยนชื่อ control จาก 'genre' เป็น 'type_id' ให้ตรงกับ Database
      type_id: ['', Validators.required],
      description: [''],
      image: [null] // Control นี้ใช้สำหรับ Validation และ Preview เท่านั้น
    });
  }
  
  // 7. เมื่อ Component เริ่มทำงาน ให้ดึงรายการประเภทเกม
  ngOnInit(): void {
    this.gameTypes$ = this.gameService.getGameTypes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.imagePreview = null; // รีเซ็ตพรีวิวทุกครั้งที่เปิด
    this.selectedFile = null; // รีเซ็ตไฟล์ทุกครั้งที่เปิด

    if (changes['gameToEdit'] && this.gameToEdit) {
      this.gameForm.patchValue({
        name: this.gameToEdit.name,
        price: this.gameToEdit.price,
        type_id: this.gameToEdit.type_id,
        description: this.gameToEdit.description
      });
      // ถ้ามีรูปเก่าอยู่ ให้แสดงเป็นพรีวิวเริ่มต้น
      this.imagePreview = this.gameToEdit.image_url;
      this.gameForm.get('image')?.clearValidators();
    } else {
      this.gameForm.reset();
      this.gameForm.get('image')?.setValidators([Validators.required]);
    }
    this.gameForm.get('image')?.updateValueAndValidity();
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.handleFile(element.files[0]);
    }
  }

  private handleFile(file: File): void {
    this.selectedFile = file;
    this.gameForm.patchValue({ image: file.name });
    const reader = new FileReader();
    reader.onload = () => { this.imagePreview = reader.result; };
    reader.readAsDataURL(file);
  }

  onSave(): void {
    if (this.gameForm.invalid) { return; }

    const formData = new FormData();
    // 8. ส่งข้อมูลด้วย Key ที่ตรงกับ Backend
    formData.append('name', this.gameForm.get('name')?.value);
    formData.append('price', this.gameForm.get('price')?.value);
    formData.append('type_id', this.gameForm.get('type_id')?.value);
    formData.append('description', this.gameForm.get('description')?.value);

    if (this.selectedFile) {
      // 9. ชื่อ field ของไฟล์ต้องเป็น 'game_image' ให้ตรงกับ Multer middleware
      formData.append('game_image', this.selectedFile);
    }
    
    this.saveGame.emit(formData);
  }

  onCancel(): void {
    this.closeModal.emit();
  }
}