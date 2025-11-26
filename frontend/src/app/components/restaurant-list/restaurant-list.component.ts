import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RestaurantService, Restaurant } from '../../services/restaurant.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div style="padding: 20px;">
      <h1>Restaurants</h1>
      <div style="margin: 20px 0;">
        <input type="text" [(ngModel)]="searchTerm" (input)="onSearch()" placeholder="Search restaurants..." style="width: 300px; padding: 8px;" />
        <button routerLink="/cart">View Cart</button>
        <button *ngIf="isAdmin()" (click)="navigateToManage()">Manage Restaurants</button>
        <button (click)="logout()">Logout</button>
      </div>
      
      <div *ngIf="loading">Loading restaurants...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      
      <div *ngIf="!loading && !error">
        <div *ngFor="let restaurant of restaurants" style="border: 1px solid #ccc; padding: 15px; margin: 10px 0; background: white; display: flex; gap: 20px;">
          <div *ngIf="restaurant.image" style="flex-shrink: 0;">
            <img [src]="restaurant.image" [alt]="restaurant.name" 
                 style="width: 200px; height: 150px; object-fit: cover; border-radius: 8px;"
                 (error)="hideImage($event)">
          </div>
          <div style="flex: 1;">
            <h3>{{ restaurant.name }}</h3>
            <p><strong>Cuisine:</strong> {{ restaurant.cuisine }}</p>
            <p><strong>Address:</strong> {{ restaurant.address }}</p>
            <button (click)="viewRestaurant(restaurant.id)">View Menu</button>
          </div>
        </div>
      </div>
      
      <div *ngIf="!loading && !error && restaurants.length === 0">
        <p>No restaurants found.</p>
      </div>
    </div>
  `,
  styles: []
})
export class RestaurantListComponent implements OnInit {
  restaurants: Restaurant[] = [];
  loading = false;
  error = '';
  searchTerm = '';

  constructor(
    private restaurantService: RestaurantService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.loading = true;
    this.error = '';
    this.restaurantService.getAllRestaurants().subscribe({
      next: (data) => {
        this.restaurants = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load restaurants';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.restaurantService.searchRestaurants(this.searchTerm).subscribe({
        next: (data) => {
          this.restaurants = data;
        },
        error: () => {
          this.restaurants = [];
        }
      });
    } else {
      this.loadRestaurants();
    }
  }

  viewRestaurant(id: number): void {
    this.router.navigate(['/restaurants', id]);
  }

  navigateToManage(): void {
    this.router.navigate(['/admin/restaurants']);
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  hideImage(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
    }
  }
}
