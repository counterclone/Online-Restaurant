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
  templateUrl: './restaurant-detail.component.html',
  styleUrls: ['./restaurant-detail.component.css']
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
