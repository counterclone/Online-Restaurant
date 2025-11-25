import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div style="padding: 20px;">
      <h1>Shopping Cart</h1>
      
      <div *ngIf="cartItems.length === 0">
        <p>Your cart is empty.</p>
        <button routerLink="/restaurants">Browse Restaurants</button>
      </div>
      
      <div *ngIf="cartItems.length > 0">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of cartItems">
              <td>{{ item.menuItem.name }} ({{ item.menuItem.veg ? 'Veg' : 'Non-Veg' }})</td>
              <td>₹{{ item.menuItem.price }}</td>
              <td>
                <button (click)="updateQuantity(item.menuItem.id, item.quantity - 1)">-</button>
                <input type="number" [(ngModel)]="item.quantity" (change)="updateQuantity(item.menuItem.id, item.quantity)" min="1" style="width: 60px; text-align: center;" />
                <button (click)="updateQuantity(item.menuItem.id, item.quantity + 1)">+</button>
              </td>
              <td>₹{{ item.menuItem.price * item.quantity }}</td>
              <td><button (click)="removeItem(item.menuItem.id)">Remove</button></td>
            </tr>
          </tbody>
        </table>
        
        <div style="margin-top: 20px; padding: 15px; background: #f0f0f0; border: 1px solid #ccc;">
          <p><strong>Subtotal:</strong> ₹{{ getTotal() }}</p>
          <p><strong>Tax (18% GST):</strong> ₹{{ getTax() }}</p>
          <p *ngIf="getDiscount() > 0"><strong>Discount (10%):</strong> -₹{{ getDiscount() }}</p>
          <p><strong>Total:</strong> ₹{{ getFinalTotal() }}</p>
          <button (click)="checkout()" [disabled]="!canCheckout()">Proceed to Checkout</button>
          <button routerLink="/restaurants">Continue Shopping</button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
    });
  }

  updateQuantity(menuItemId: number, quantity: number): void {
    this.cartService.updateQuantity(menuItemId, quantity);
  }

  removeItem(menuItemId: number): void {
    this.cartService.removeItem(menuItemId);
  }

  getTotal(): number {
    return this.cartService.getTotal();
  }

  getTax(): number {
    return this.cartService.getTax();
  }

  getDiscount(): number {
    return this.cartService.getDiscount();
  }

  getFinalTotal(): number {
    return this.cartService.getFinalTotal();
  }

  canCheckout(): boolean {
    return this.cartItems.length > 0 && this.authService.isAuthenticated();
  }

  checkout(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/checkout']);
  }
}
