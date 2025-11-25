import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DeliveryService, DeliveryAgent } from '../../services/delivery.service';
import { Order } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-delivery-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div style="padding: 20px;">
      <h1>Manage Delivery Orders</h1>
      
      <div *ngIf="loading">Loading...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      
      <div *ngIf="!loading && !error">
        <h2>Pending Orders</h2>
        <div *ngIf="pendingOrders.length === 0">No pending orders.</div>
        <div *ngIf="availableAgents.length === 0 && pendingOrders.length > 0" style="background: #fff3cd; padding: 15px; margin: 10px 0; border: 1px solid #ffc107;">
          <strong>⚠️ No delivery agents available!</strong>
          <p>You need to register delivery agents first. Delivery agents can register themselves, or you can create them manually.</p>
          <p>To register a delivery agent: Go to Registration page and select "Delivery Agent" role.</p>
        </div>
        <div *ngFor="let order of pendingOrders" style="border: 1px solid #ccc; padding: 15px; margin: 10px 0; background: white;">
          <h3>Order #{{ order.id }}</h3>
          <p><strong>Delivery Address:</strong> {{ order.deliveryAddress }}</p>
          <p><strong>Total Amount:</strong> ₹{{ order.finalAmount }}</p>
          <div style="margin-top: 10px;">
            <select [(ngModel)]="selectedAgentId[order.id]" style="padding: 5px; margin-right: 10px;" [disabled]="availableAgents.length === 0">
              <option [value]="0">Select Delivery Agent</option>
              <option *ngFor="let agent of availableAgents" [value]="agent.id">
                Agent #{{ agent.id }} - {{ agent.vehicleNumber }} ({{ agent.phoneNumber }})
              </option>
            </select>
            <button 
              (click)="assignOrder(order.id)"
              [disabled]="!selectedAgentId[order.id] || selectedAgentId[order.id] === 0 || availableAgents.length === 0"
            >
              Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DeliveryOrdersComponent implements OnInit {
  pendingOrders: Order[] = [];
  availableAgents: DeliveryAgent[] = [];
  selectedAgentId: { [orderId: number]: number } = {};
  loading = false;
  error = '';

  constructor(
    private deliveryService: DeliveryService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/restaurants']);
      return;
    }
    this.loadPendingOrders();
    this.loadAvailableAgents();
  }

  loadPendingOrders(): void {
    this.loading = true;
    this.deliveryService.getPendingOrders().subscribe({
      next: (data) => {
        this.pendingOrders = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load pending orders';
        this.loading = false;
      }
    });
  }

  loadAvailableAgents(): void {
    this.deliveryService.getAvailableDeliveryAgents().subscribe({
      next: (data) => {
        this.availableAgents = data;
      },
      error: () => {
        this.availableAgents = [];
      }
    });
  }

  assignOrder(orderId: number): void {
    const agentId = this.selectedAgentId[orderId];
    if (!agentId) {
      return;
    }

    this.deliveryService.assignOrder(orderId, agentId).subscribe({
      next: () => {
        this.loadPendingOrders();
        this.selectedAgentId[orderId] = 0;
      },
      error: () => {
        this.error = 'Failed to assign order';
      }
    });
  }
}
