// src/app/models/auth.model.ts

import { User } from "./user.model";

export interface RegisterData {
  username: string;
  email: string;
  password?: string; // ใช้เป็น optional เพราะเราอาจจะไม่ส่ง password กลับมา
  confirmPassword?: string;
}

// ข้อมูลที่ส่งไปตอน Login
export interface LoginData {
  email: string;
  password?: string;
}

// ข้อมูลที่ได้รับกลับมาหลัง Login สำเร็จ
export interface LoginResponse {
  message: string;
  token: string;
  redirectTo: string; // <-- ตัวนี้ที่เคยเป็นปัญหา
  user: User;
}