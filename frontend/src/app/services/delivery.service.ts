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

  // GET /api/delivery/agents
  // Response: DeliveryAgent[]
  getAllDeliveryAgents(): Observable<DeliveryAgent[]> {
    return this.http.get<DeliveryAgent[]>(`${this.apiUrl}/agents`);
  }

  // GET /api/delivery/agents/available
  // Response: DeliveryAgent[]
  getAvailableDeliveryAgents(): Observable<DeliveryAgent[]> {
    return this.http.get<DeliveryAgent[]>(`${this.apiUrl}/agents/available`);
  }

  // POST /api/delivery/agents
  // Request: DeliveryAgent (without id)
  // Response: DeliveryAgent
  createDeliveryAgent(agent: Omit<DeliveryAgent, 'id'>): Observable<DeliveryAgent> {
    return this.http.post<DeliveryAgent>(`${this.apiUrl}/agents`, agent);
  }

  // GET /api/delivery/my-orders
  // Response: Order[]
  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/my-orders`);
  }

  // GET /api/delivery/pending-orders
  // Response: Order[]
  getPendingOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/pending-orders`);
  }

  // POST /api/delivery/assign-order
  // Request: { orderId: number, deliveryAgentId: number }
  // Response: Order
  assignOrder(orderId: number, deliveryAgentId: number): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/assign-order`, { orderId, deliveryAgentId });
  }

  // GET /api/delivery/agents/{id}
  // Response: DeliveryAgent
  getDeliveryAgentById(id: number): Observable<DeliveryAgent> {
    return this.http.get<DeliveryAgent>(`${this.apiUrl}/agents/${id}`);
  }
}

