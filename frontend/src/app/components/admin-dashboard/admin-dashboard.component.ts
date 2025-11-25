import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DashboardService, AdminDashboard } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="padding: 20px;">
      <h1>Admin Dashboard</h1>
      <div style="margin: 20px 0;">
        <button routerLink="/admin/restaurants">Manage Restaurants</button>
        <button routerLink="/admin/delivery-orders">Manage Delivery Orders</button>
        <button (click)="logout()">Logout</button>
      </div>
      
      <div *ngIf="loading">Loading dashboard...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      
      <div *ngIf="!loading && !error && dashboard">
        <div style="display: flex; gap: 20px; margin: 20px 0;">
          <div style="border: 1px solid #ccc; padding: 20px; background: white;">
            <h3>Total Orders</h3>
            <p style="font-size: 24px; font-weight: bold;">{{ dashboard.totalOrders }}</p>
          </div>
          <div style="border: 1px solid #ccc; padding: 20px; background: white;">
            <h3>Total Revenue</h3>
            <p style="font-size: 24px; font-weight: bold;">₹{{ dashboard.totalRevenue }}</p>
          </div>
          <div style="border: 1px solid #ccc; padding: 20px; background: white;">
            <h3>Total Restaurants</h3>
            <p style="font-size: 24px; font-weight: bold;">{{ dashboard.totalRestaurants }}</p>
          </div>
        </div>
        
        <div style="border: 1px solid #ccc; padding: 20px; background: white; margin-top: 20px;">
          <h2>Top Restaurants</h2>
          <div *ngIf="dashboard.topRestaurants.length === 0">No restaurant data available.</div>
          <table *ngIf="dashboard.topRestaurants.length > 0">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Restaurant Name</th>
                <th>Order Count</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let restaurant of dashboard.topRestaurants; let i = index">
                <td>#{{ i + 1 }}</td>
                <td>{{ restaurant.name }}</td>
                <td>{{ restaurant.orderCount }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminDashboardComponent implements OnInit {
  dashboard: AdminDashboard | null = null;
  loading = false;
  error = '';

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/restaurants']);
      return;
    }
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.dashboardService.getAdminDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load dashboard';
        this.loading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
