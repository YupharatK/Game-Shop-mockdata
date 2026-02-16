// src/app/core/config.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development'; // เรายังสามารถใช้ environment สำหรับ baseUrl ได้

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly baseUrl = environment.apiUrl; // URL หลักของ API

  // Endpoint สำหรับส่วน Auth
  public readonly authEndpoints = {
    register: `${this.baseUrl}/api/auth/register`,
    login: `${this.baseUrl}/api/auth/login`
  };

  // Endpoint สำหรับส่วน Games (ตัวอย่าง)
  public readonly gamesEndpoints = {
    getAll: `${this.baseUrl}/api/games`,
    create: `${this.baseUrl}/api/games`,
    getById: (id: string | number) => `${this.baseUrl}/api/games/${id}`,
    updateById: (id: string | number) => `${this.baseUrl}/api/games/${id}`,
    deleteById: (id: string | number) => `${this.baseUrl}/api/games/${id}`,
     search: `${this.baseUrl}/api/games/search`

    
  };

   public readonly gameTypesEndpoints = {
    getAll: `${this.baseUrl}/api/gametypes`
  };


  // Endpoint สำหรับส่วน Users (ตัวอย่าง)
  public readonly usersEndpoints = {
    getAll: `${this.baseUrl}/api/users`,
    updateProfile: `${this.baseUrl}/api/users/profile`
  };

  // Endpoint สำหรับส่วน Wallet (ตัวอย่าง)
  public readonly walletEndpoints = {
    getWallet: `${this.baseUrl}/api/wallet`,
    topup: `${this.baseUrl}/api/wallet/topup`
  };

 public readonly ordersEndpoints = {
    checkout: `${this.baseUrl}/api/orders/checkout`
  };

public readonly libraryEndpoints = {
    get: `${this.baseUrl}/api/library`
  };


  public readonly adminEndpoints = {
    getAllUsers: `${this.baseUrl}/api/admin/users`,
    getAllTransactions: `${this.baseUrl}/api/admin/transactions`, 
    getUserTransactions: (userId: number) => `${this.baseUrl}/api/admin/users/${userId}/transactions`
  };

  constructor() { }
}