import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MenuService, MenuItem } from '../../services/menu.service';
import { RestaurantService, Restaurant } from '../../services/restaurant.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-manage-menu-items',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div style="padding: 20px;">
      <h1>Manage Menu Items - {{ restaurant?.name }}</h1>
      <button (click)="goBack()">← Back to Restaurants</button>
      
      <div *ngIf="showAddForm" style="border: 1px solid #ccc; padding: 20px; margin: 20px 0; background: white;">
        <h2>Add Menu Item</h2>
        <form (ngSubmit)="onAddSubmit()">
          <div>
            <label>Item Name:</label>
            <input type="text" [(ngModel)]="newMenuItem.name" name="name" required />
          </div>
          <div>
            <label>Price (₹):</label>
            <input type="number" [(ngModel)]="newMenuItem.price" name="price" step="0.01" min="0" required />
          </div>
          <div>
            <label>Type:</label>
            <select [(ngModel)]="newMenuItem.veg" name="veg">
              <option [ngValue]="true">Vegetarian</option>
              <option [ngValue]="false">Non-Vegetarian</option>
            </select>
          </div>
          <button type="submit">Add Menu Item</button>
          <button type="button" (click)="cancelForm()">Cancel</button>
        </form>
      </div>
      
      <div *ngIf="showEditForm" style="border: 1px solid #ccc; padding: 20px; margin: 20px 0; background: white;">
        <h2>Edit Menu Item</h2>
        <form (ngSubmit)="onEditSubmit()">
          <div>
            <label>Item Name:</label>
            <input type="text" [(ngModel)]="editMenuItemData.name" name="name" required />
          </div>
          <div>
            <label>Price (₹):</label>
            <input type="number" [(ngModel)]="editMenuItemData.price" name="price" step="0.01" min="0" required />
          </div>
          <div>
            <label>Type:</label>
            <select [(ngModel)]="editMenuItemData.veg" name="veg">
              <option [ngValue]="true">Vegetarian</option>
              <option [ngValue]="false">Non-Vegetarian</option>
            </select>
          </div>
          <button type="submit">Update Menu Item</button>
          <button type="button" (click)="cancelForm()">Cancel</button>
        </form>
      </div>
      
      <div *ngIf="!showAddForm && !showEditForm">
        <button (click)="showAddForm = true">Add New Menu Item</button>
      </div>
      
      <div *ngIf="loading">Loading menu items...</div>
      <div *ngIf="error" class="error" style="color: red; padding: 10px; margin: 10px 0; border: 1px solid red; background: #ffe6e6;">
        {{ error }}
      </div>
      
      <table *ngIf="!loading && !error && !showAddForm && !showEditForm" style="margin-top: 20px;">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of menuItems">
            <td>{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>₹{{ item.price }}</td>
            <td>{{ item.veg ? 'Veg' : 'Non-Veg' }}</td>
            <td>
              <button (click)="editMenuItem(item)">Edit</button>
              <button (click)="deleteMenuItem(item.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div *ngIf="!loading && !error && menuItems.length === 0 && !showAddForm && !showEditForm">
        <p>No menu items found. Add your first menu item.</p>
      </div>
    </div>
  `,
  styles: []
})
export class ManageMenuItemsComponent implements OnInit {
  restaurantId: number = 0;
  restaurant: Restaurant | null = null;
  menuItems: MenuItem[] = [];
  loading = false;
  error = '';
  showAddForm = false;
  showEditForm = false;
  newMenuItem: Omit<MenuItem, 'id' | 'restaurantId'> = {
    name: '',
    price: 0,
    veg: true
  };
  editMenuItemData: MenuItem = {
    id: 0,
    name: '',
    price: 0,
    veg: true,
    restaurantId: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private menuService: MenuService,
    private restaurantService: RestaurantService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/restaurants']);
      return;
    }
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.restaurantId = Number(id);
      this.loadRestaurant();
      this.loadMenuItems();
    }
  }

  loadRestaurant(): void {
    this.restaurantService.getRestaurantById(this.restaurantId).subscribe({
      next: (data) => {
        this.restaurant = data;
      },
      error: () => {
        this.error = 'Failed to load restaurant';
      }
    });
  }

  loadMenuItems(): void {
    this.loading = true;
    this.menuService.getMenuItemsByRestaurant(this.restaurantId).subscribe({
      next: (data) => {
        this.menuItems = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load menu items';
        this.loading = false;
      }
    });
  }

  onAddSubmit(): void {
    this.error = '';
    this.menuService.createMenuItem(this.restaurantId, this.newMenuItem).subscribe({
      next: () => {
        this.showAddForm = false;
        this.newMenuItem = { name: '', price: 0, veg: true };
        this.loadMenuItems();
      },
      error: (err) => {
        this.error = err.error?.message || err.error?.error || 'Failed to create menu item';
      }
    });
  }

  editMenuItem(item: MenuItem): void {
    this.editMenuItemData = { ...item };
    this.showEditForm = true;
  }

  onEditSubmit(): void {
    this.error = '';
    this.menuService.updateMenuItem(this.editMenuItemData.id, {
      name: this.editMenuItemData.name,
      price: this.editMenuItemData.price,
      veg: this.editMenuItemData.veg
    }).subscribe({
      next: () => {
        this.showEditForm = false;
        this.loadMenuItems();
      },
      error: (err) => {
        this.error = err.error?.message || err.error?.error || 'Failed to update menu item';
      }
    });
  }

  deleteMenuItem(id: number): void {
    if (confirm('Are you sure you want to delete this menu item?')) {
      this.menuService.deleteMenuItem(id).subscribe({
        next: () => {
          this.loadMenuItems();
        },
        error: () => {
          this.error = 'Failed to delete menu item';
        }
      });
    }
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.showEditForm = false;
    this.newMenuItem = { name: '', price: 0, veg: true };
  }

  goBack(): void {
    this.router.navigate(['/admin/restaurants']);
  }
}

