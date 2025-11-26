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
  templateUrl: './manage-restaurants.component.html',
  styleUrls: ['./manage-restaurants.component.css']
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

