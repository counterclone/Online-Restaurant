import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RestaurantService, Restaurant } from '../../services/restaurant.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-manage-restaurants',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div style="padding: 20px;">
      <h1>Manage Restaurants</h1>
      <button (click)="goBack()">Back</button>
      
      <div *ngIf="showAddForm" style="border: 1px solid #ccc; padding: 20px; margin: 20px 0; background: white;">
        <h2>Add Restaurant</h2>
        <form (ngSubmit)="onAddSubmit()">
          <div>
            <label>Name:</label>
            <input type="text" [(ngModel)]="newRestaurant.name" name="name" required />
          </div>
          <div>
            <label>Address:</label>
            <input type="text" [(ngModel)]="newRestaurant.address" name="address" required />
          </div>
          <div>
            <label>Cuisine:</label>
            <input type="text" [(ngModel)]="newRestaurant.cuisine" name="cuisine" required />
          </div>
          <div>
            <label>Image URL:</label>
            <input type="text" [(ngModel)]="newRestaurant.image" name="image" />
          </div>
          <button type="submit">Add Restaurant</button>
          <button type="button" (click)="cancelForm()">Cancel</button>
        </form>
      </div>
      
      <div *ngIf="showEditForm" style="border: 1px solid #ccc; padding: 20px; margin: 20px 0; background: white;">
        <h2>Edit Restaurant</h2>
        <form (ngSubmit)="onEditSubmit()">
          <div>
            <label>Name:</label>
            <input type="text" [(ngModel)]="editRestaurantData.name" name="name" required />
          </div>
          <div>
            <label>Address:</label>
            <input type="text" [(ngModel)]="editRestaurantData.address" name="address" required />
          </div>
          <div>
            <label>Cuisine:</label>
            <input type="text" [(ngModel)]="editRestaurantData.cuisine" name="cuisine" required />
          </div>
          <div>
            <label>Image URL:</label>
            <input type="text" [(ngModel)]="editRestaurantData.image" name="image" />
          </div>
          <button type="submit">Update Restaurant</button>
          <button type="button" (click)="cancelForm()">Cancel</button>
        </form>
      </div>
      
      <div *ngIf="!showAddForm && !showEditForm">
        <button (click)="showAddForm = true">Add New Restaurant</button>
      </div>
      
      <div *ngIf="loading">Loading restaurants...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      
      <table *ngIf="!loading && !error && !showAddForm && !showEditForm" style="margin-top: 20px;">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Address</th>
            <th>Cuisine</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let restaurant of restaurants">
            <td>{{ restaurant.id }}</td>
            <td>{{ restaurant.name }}</td>
            <td>{{ restaurant.address }}</td>
            <td>{{ restaurant.cuisine }}</td>
            <td>
              <button (click)="editRestaurant(restaurant)">Edit</button>
              <button (click)="manageMenu(restaurant.id)">Manage Menu</button>
              <button (click)="deleteRestaurant(restaurant.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: []
})
export class ManageRestaurantsComponent implements OnInit {
  restaurants: Restaurant[] = [];
  loading = false;
  error = '';
  showAddForm = false;
  showEditForm = false;
  newRestaurant: Omit<Restaurant, 'id'> = {
    name: '',
    address: '',
    cuisine: '',
    image: ''
  };
  editRestaurantData: Restaurant = {
    id: 0,
    name: '',
    address: '',
    cuisine: '',
    image: ''
  };

  constructor(
    private restaurantService: RestaurantService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/restaurants']);
      return;
    }
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.loading = true;
    this.restaurantService.getAllRestaurants().subscribe({
      next: (data) => {
        this.restaurants = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load restaurants';
        this.loading = false;
      }
    });
  }

  onAddSubmit(): void {
    this.restaurantService.createRestaurant(this.newRestaurant).subscribe({
      next: () => {
        this.showAddForm = false;
        this.newRestaurant = { name: '', address: '', cuisine: '', image: '' };
        this.loadRestaurants();
      },
      error: () => {
        this.error = 'Failed to create restaurant';
      }
    });
  }

  editRestaurant(restaurant: Restaurant): void {
    this.editRestaurantData = { ...restaurant };
    this.showEditForm = true;
  }

  onEditSubmit(): void {
    this.restaurantService.updateRestaurant(this.editRestaurantData.id, {
      name: this.editRestaurantData.name,
      address: this.editRestaurantData.address,
      cuisine: this.editRestaurantData.cuisine,
      image: this.editRestaurantData.image
    }).subscribe({
      next: () => {
        this.showEditForm = false;
        this.loadRestaurants();
      },
      error: () => {
        this.error = 'Failed to update restaurant';
      }
    });
  }

  deleteRestaurant(id: number): void {
    if (confirm('Are you sure you want to delete this restaurant?')) {
      this.restaurantService.deleteRestaurant(id).subscribe({
        next: () => {
          this.loadRestaurants();
        },
        error: () => {
          this.error = 'Failed to delete restaurant';
        }
      });
    }
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.showEditForm = false;
    this.newRestaurant = { name: '', address: '', cuisine: '', image: '' };
  }

  manageMenu(restaurantId: number): void {
    this.router.navigate(['/admin/restaurants', restaurantId, 'menu']);
  }

  goBack(): void {
    this.router.navigate(['/restaurants']);
  }
}

