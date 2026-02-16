// src/app/auth/login/login.ts (โค้ดใหม่ที่ถูกต้อง)
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth'; 

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void { }

  // เมธอด login ที่อัปเดตแล้ว
  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        // ไม่ต้องเรียก setCurrentUser แล้ว เพราะ AuthService จัดการให้เอง
        console.log('Login successful, navigating to:', response.redirectTo);
        
        // สั่ง navigate ไปยัง path ที่ได้จาก API response
        this.router.navigate([response.redirectTo]);
      },
      error: (err) => {
        console.error('Login failed:', err);
        // TODO: แสดงข้อความ error ให้ผู้ใช้เห็น
      }
    });
  }
}