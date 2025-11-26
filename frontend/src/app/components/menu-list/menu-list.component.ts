import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem, MenuService } from '../../services/menu.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-list.component.html',
  styleUrls: ['./menu-list.component.css']
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
