import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from './order.service';

export interface DeliveryAgent {
  id: number;
  userId: number;
  vehicleNumber: string;
  phoneNumber: string;
  available: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private apiUrl = 'http://localhost:8080/api/delivery';

  constructor(private http: HttpClient) {}

  getAllDeliveryAgents(): Observable<DeliveryAgent[]> {
    return this.http.get<DeliveryAgent[]>(`${this.apiUrl}/agents`);
  }

  getAvailableDeliveryAgents(): Observable<DeliveryAgent[]> {
    return this.http.get<DeliveryAgent[]>(`${this.apiUrl}/agents/available`);
  }

  createDeliveryAgent(agent: Omit<DeliveryAgent, 'id'>): Observable<DeliveryAgent> {
    return this.http.post<DeliveryAgent>(`${this.apiUrl}/agents`, agent);
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/my-orders`);
  }

  getPendingOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/pending-orders`);
  }

  assignOrder(orderId: number, deliveryAgentId: number): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/assign-order`, { orderId, deliveryAgentId });
  }

  getDeliveryAgentById(id: number): Observable<DeliveryAgent> {
    return this.http.get<DeliveryAgent>(`${this.apiUrl}/agents/${id}`);
  }
}

