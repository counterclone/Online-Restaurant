import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from './order.service';

export interface AdminDashboard {
  totalOrders: number;
  totalRevenue: number;
  totalRestaurants: number;
  topRestaurants: Array<{
    id: number;
    name: string;
    orderCount: number;
  }>;
}

export interface CustomerDashboard {
  totalOrders: number;
  totalSpent: number;
  recentOrders: Order[];
}

export interface DeliveryDashboard {
  assignedOrders: number;
  completedOrders: number;
  pendingOrders: Order[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8080/api/dashboard';

  constructor(private http: HttpClient) {}

  // GET /api/dashboard/admin
  // Response: AdminDashboard
  getAdminDashboard(): Observable<AdminDashboard> {
    return this.http.get<AdminDashboard>(`${this.apiUrl}/admin`);
  }

  // GET /api/dashboard/customer
  // Response: CustomerDashboard
  getCustomerDashboard(): Observable<CustomerDashboard> {
    return this.http.get<CustomerDashboard>(`${this.apiUrl}/customer`);
  }

  // GET /api/dashboard/delivery
  // Response: DeliveryDashboard
  getDeliveryDashboard(): Observable<DeliveryDashboard> {
    return this.http.get<DeliveryDashboard>(`${this.apiUrl}/delivery`);
  }
}

