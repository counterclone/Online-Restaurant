import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RestaurantService, Restaurant } from '../../services/restaurant.service';
import { MenuService } from '../../services/menu.service';
import { MenuItem } from '../../services/menu.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="padding: 20px;">
      <button (click)="goBack()">← Back to Restaurants</button>
      
      <div *ngIf="loading">Loading...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      
      <div *ngIf="restaurant && !loading">
        <h1>{{ restaurant.name }}</h1>
        <p><strong>Cuisine:</strong> {{ restaurant.cuisine }}</p>
        <p><strong>Address:</strong> {{ restaurant.address }}</p>
        
        <h2>Menu</h2>
        <div *ngIf="menuItems.length === 0">No menu items available.</div>
        <div *ngFor="let item of menuItems" style="border: 1px solid #ccc; padding: 15px; margin: 10px 0; background: white;">
          <h3>{{ item.name }}</h3>
          <p><strong>Price:</strong> ₹{{ item.price }}</p>
          <p><strong>Type:</strong> {{ item.veg ? 'Veg' : 'Non-Veg' }}</p>
          <button (click)="addToCart(item)">Add to Cart</button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RestaurantDetailComponent implements OnInit {
  restaurant: Restaurant | null = null;
  menuItems: MenuItem[] = [];
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private restaurantService: RestaurantService,
    private menuService: MenuService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRestaurant(Number(id));
      this.loadMenuItems(Number(id));
    }
  }

  loadRestaurant(id: number): void {
    this.loading = true;
    this.restaurantService.getRestaurantById(id).subscribe({
      next: (data) => {
        this.restaurant = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load restaurant';
        this.loading = false;
      }
    });
  }

  loadMenuItems(restaurantId: number): void {
    this.menuService.getMenuItemsByRestaurant(restaurantId).subscribe({
      next: (data) => {
        this.menuItems = data;
      },
      error: () => {
        this.menuItems = [];
      }
    });
  }

  addToCart(item: MenuItem): void {
    this.cartService.addToCart(item);
    alert(item.name + ' added to cart!');
  }

  goBack(): void {
    this.router.navigate(['/restaurants']);
  }
}
