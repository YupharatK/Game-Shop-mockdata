// src/app/auth/register/register.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// 1. แก้ไข Path การ import AuthService ให้ถูกต้อง
import { AuthService } from '../auth'; 
import { User } from '../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: false, 
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  selectedFile: File | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onSubmit(): void {
    // เพิ่ม console.log เพื่อตรวจสอบว่าฟังก์ชันถูกเรียกหรือไม่
     console.log('--- Step 1: onSubmit function was called! ---');
    console.log('onSubmit function called!'); 

    console.log('--- Step 2: Checking form status ---');
    console.log('Form Status:', this.registerForm.status); // ควรจะเป็น 'VALID'
    console.log('Form Errors:', this.registerForm.errors); // ควรจะเป็น null
    
    this.errorMessage = null;

    if (this.registerForm.invalid) {
      console.log('Form is invalid:', this.registerForm.errors);
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a profile picture.';
      return;
    }
    
    console.log('Form is valid. Submitting...');

    this.authService.register(this.registerForm.value, this.selectedFile)
      .subscribe({
        next: (response: { message: string, user: User }) => {
          console.log('Registration successful!', response);
          alert(`Welcome, ${response.user.username}! Please log in.`);
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          console.error('Registration failed:', err);
          this.errorMessage = err.error?.message || 'An unknown error occurred during registration.';
        }
      });
  }
}