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
  templateUrl: './delivery-orders.component.html',
  styleUrls: ['./delivery-orders.component.css']
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
