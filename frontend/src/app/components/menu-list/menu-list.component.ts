import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem, MenuService } from '../../services/menu.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2>Menu Items</h2>
      <div *ngIf="menuItems.length === 0">No menu items available.</div>
      <div *ngFor="let item of menuItems" style="border: 1px solid #ccc; padding: 15px; margin: 10px 0; background: white;">
        <h3>{{ item.name }}</h3>
        <p><strong>Price:</strong> ₹{{ item.price }}</p>
        <p><strong>Type:</strong> {{ item.veg ? 'Veg' : 'Non-Veg' }}</p>
        <button (click)="onAddToCart(item)">Add to Cart</button>
      </div>
    </div>
  `,
  styles: []
})
export class MenuListComponent implements OnInit {
  @Input() restaurantId!: number;
  menuItems: MenuItem[] = [];

  constructor(
    private menuService: MenuService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    if (this.restaurantId) {
      this.loadMenuItems();
    }
  }

  loadMenuItems(): void {
    this.menuService.getMenuItemsByRestaurant(this.restaurantId).subscribe({
      next: (data) => {
        this.menuItems = data;
      },
      error: () => {
        this.menuItems = [];
      }
    });
  }

  onAddToCart(item: MenuItem): void {
    this.cartService.addToCart(item);
    alert(item.name + ' added to cart!');
  }
}
