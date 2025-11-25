import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DeliveryService } from '../../services/delivery.service';
import { OrderService, Order } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-delivery-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="padding: 20px;">
      <h1>Delivery Dashboard</h1>
      <button (click)="logout()">Logout</button>
      
      <div *ngIf="loading">Loading orders...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      
      <div *ngIf="!loading && !error">
        <h2>My Assigned Orders</h2>
        <div *ngIf="orders.length === 0">
          <p>No orders assigned to you.</p>
        </div>
        <div *ngFor="let order of orders" style="border: 1px solid #ccc; padding: 15px; margin: 10px 0; background: white;">
          <h3>Order #{{ order.id }}</h3>
          <p><strong>Status:</strong> {{ order.status }}</p>
          <p><strong>Delivery Address:</strong> {{ order.deliveryAddress }}</p>
          <p><strong>Total Amount:</strong> ₹{{ order.finalAmount }}</p>
          <p><strong>Order Date:</strong> {{ order.orderDate | date:'short' }}</p>
          <button 
            *ngIf="order.status === 'CONFIRMED' || order.status === 'PREPARING'"
            (click)="updateStatus(order.id, 'OUT_FOR_DELIVERY')"
          >
            Mark Out for Delivery
          </button>
          <button 
            *ngIf="order.status === 'OUT_FOR_DELIVERY'"
            (click)="updateStatus(order.id, 'DELIVERED')"
          >
            Mark as Delivered
          </button>
          <button (click)="viewOrder(order.id)">View Details</button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DeliveryDashboardComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  error = '';

  constructor(
    private deliveryService: DeliveryService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isDeliveryAgent()) {
      this.router.navigate(['/restaurants']);
      return;
    }
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = '';
    this.deliveryService.getMyOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.loading = false;
        if (err.error && err.error.error) {
          this.error = err.error.error;
        } else if (err.status === 401 || err.status === 403) {
          this.error = 'Access denied. Please login again.';
          this.router.navigate(['/login']);
        } else {
          this.error = 'Failed to load orders. Please try again.';
        }
      }
    });
  }

  updateStatus(orderId: number, status: string): void {
    this.orderService.updateOrderStatus(orderId, status).subscribe({
      next: () => {
        this.loadOrders();
      },
      error: () => {
        this.error = 'Failed to update order status';
      }
    });
  }

  viewOrder(id: number): void {
    this.router.navigate(['/orders', id]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
