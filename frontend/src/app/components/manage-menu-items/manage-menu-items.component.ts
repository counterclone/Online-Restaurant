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
  templateUrl: './manage-menu-items.component.html',
  styleUrls: ['./manage-menu-items.component.css']
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

