import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="padding: 20px;">
      <h1>My Orders</h1>
      
      <div *ngIf="loading">Loading orders...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      
      <div *ngIf="!loading && !error">
        <div *ngIf="orders.length === 0">
          <p>You have no orders yet.</p>
          <button routerLink="/restaurants">Browse Restaurants</button>
        </div>
        
        <div *ngFor="let order of orders" style="border: 1px solid #ccc; padding: 15px; margin: 10px 0; background: white;">
          <h3>Order #{{ order.id }}</h3>
          <p><strong>Date:</strong> {{ order.orderDate | date:'short' }}</p>
          <p><strong>Status:</strong> {{ order.status }}</p>
          <p><strong>Delivery Address:</strong> {{ order.deliveryAddress }}</p>
          <p *ngIf="order.deliveryAgentId"><strong>Assigned Delivery Agent ID:</strong> #{{ order.deliveryAgentId }}</p>
          <p><strong>Total Amount:</strong> ₹{{ order.finalAmount }}</p>
          <button (click)="viewOrder(order.id)">View Details</button>
          <button (click)="trackOrder(order.id)">Track Order</button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class OrderHistoryComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  error = '';

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getMyOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load orders';
        this.loading = false;
      }
    });
  }

  viewOrder(id: number): void {
    this.router.navigate(['/orders', id]);
  }

  trackOrder(id: number): void {
    this.router.navigate(['/orders', id, 'track']);
  }
}
