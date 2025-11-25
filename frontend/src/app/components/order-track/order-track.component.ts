import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService, Order, OrderItem } from '../../services/order.service';
import { DeliveryService, DeliveryAgent } from '../../services/delivery.service';

@Component({
  selector: 'app-order-track',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="padding: 20px;">
      <button (click)="goBack()">← Back</button>
      
      <div *ngIf="loading">Loading order details...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      
      <div *ngIf="order && !loading">
        <h1>Order #{{ order.id }}</h1>
        
        <div style="margin: 20px 0;">
          <h3>Order Status: {{ order.status }}</h3>
          <p><strong>Order Date:</strong> {{ order.orderDate | date:'short' }}</p>
          <p><strong>Delivery Address:</strong> {{ order.deliveryAddress }}</p>
          <div *ngIf="order.deliveryAgentId">
            <p><strong>Assigned Delivery Agent:</strong></p>
            <div *ngIf="deliveryAgent" style="margin-left: 20px; padding: 10px; background: #f0f0f0; border-radius: 4px;">
              <p><strong>Agent ID:</strong> #{{ deliveryAgent.id }}</p>
              <p><strong>Vehicle Number:</strong> {{ deliveryAgent.vehicleNumber }}</p>
              <p><strong>Phone:</strong> {{ deliveryAgent.phoneNumber }}</p>
            </div>
            <div *ngIf="!deliveryAgent" style="margin-left: 20px;">
              <p>Loading agent details...</p>
            </div>
          </div>
          <p *ngIf="!order.deliveryAgentId && (order.status === 'OUT_FOR_DELIVERY' || order.status === 'DELIVERED')" style="color: orange;">
            <strong>⚠️ Delivery agent assignment pending</strong>
          </p>
          <p><strong>Total Amount:</strong> ₹{{ order.finalAmount }}</p>
        </div>
        
        <div *ngIf="orderItems.length > 0" style="margin: 20px 0;">
          <h3>Order Items</h3>
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of orderItems">
                <td>{{ item.menuItemName }}</td>
                <td>{{ item.quantity }}</td>
                <td>₹{{ item.price }}</td>
                <td>₹{{ item.price * item.quantity }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class OrderTrackComponent implements OnInit {
  order: Order | null = null;
  orderItems: OrderItem[] = [];
  deliveryAgent: DeliveryAgent | null = null;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private deliveryService: DeliveryService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(Number(id));
      this.loadOrderItems(Number(id));
    }
  }

  loadOrder(id: number): void {
    this.loading = true;
    this.orderService.getOrderById(id).subscribe({
      next: (data) => {
        this.order = data;
        this.loading = false;
        // Load delivery agent details if assigned
        if (data.deliveryAgentId) {
          this.loadDeliveryAgent(data.deliveryAgentId);
        }
      },
      error: () => {
        this.error = 'Failed to load order';
        this.loading = false;
      }
    });
  }

  loadDeliveryAgent(agentId: number): void {
    this.deliveryService.getDeliveryAgentById(agentId).subscribe({
      next: (data) => {
        this.deliveryAgent = data;
      },
      error: () => {
        // Silently fail - delivery agent might not exist
        this.deliveryAgent = null;
      }
    });
  }

  loadOrderItems(id: number): void {
    this.orderService.getOrderItems(id).subscribe({
      next: (data) => {
        this.orderItems = data;
      },
      error: () => {
        this.orderItems = [];
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }
}
