import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Order {
  id: number;
  userId: number;
  restaurantId: number;
  status: string;
  totalAmount: number;
  tax: number;
  discount: number;
  finalAmount: number;
  deliveryAddress: string;
  deliveryAgentId?: number;
  orderDate: string;
}

export interface OrderItem {
  id: number;
  menuItemId: number;
  menuItemName: string;
  price: number;
  quantity: number;
}

export interface OrderRequest {
  restaurantId: number;
  deliveryAddress: string;
  orderItems: Array<{
    menuItemId: number;
    quantity: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  createOrder(orderRequest: OrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, orderRequest);
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/my`);
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/admin`);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  getOrderItems(id: number): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(`${this.apiUrl}/${id}/items`);
  }

  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/status`, { status });
  }
}

