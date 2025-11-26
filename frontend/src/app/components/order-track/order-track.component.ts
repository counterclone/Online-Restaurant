import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService, Order, OrderItem } from '../../services/order.service';
import { DeliveryService, DeliveryAgent } from '../../services/delivery.service';

@Component({
  selector: 'app-order-track',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-track.component.html',
  styleUrls: ['./order-track.component.css']
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
