import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MenuItem } from './menu.service';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartSubject.asObservable();

  constructor() {
    this.loadCartFromStorage();
  }

  // Add item to cart
  addToCart(menuItem: MenuItem, quantity: number = 1): void {
    const existingItem = this.cartItems.find(item => item.menuItem.id === menuItem.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cartItems.push({ menuItem, quantity });
    }
    
    this.updateCart();
  }

  // Remove item from cart
  removeItem(menuItemId: number): void {
    this.cartItems = this.cartItems.filter(item => item.menuItem.id !== menuItemId);
    this.updateCart();
  }

  // Update quantity
  updateQuantity(menuItemId: number, quantity: number): void {
    const item = this.cartItems.find(item => item.menuItem.id === menuItemId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(menuItemId);
      } else {
        item.quantity = quantity;
        this.updateCart();
      }
    }
  }

  // Get all cart items
  getCartItems(): CartItem[] {
    return [...this.cartItems];
  }

  // Get total price
  getTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  }

  // Get tax (18% GST)
  getTax(): number {
    return this.getTotal() * 0.18;
  }

  // Get discount (10% if total > 500)
  getDiscount(): number {
    const total = this.getTotal();
    return total > 500 ? total * 0.10 : 0;
  }

  // Get final total
  getFinalTotal(): number {
    return this.getTotal() + this.getTax() - this.getDiscount();
  }

  // Clear cart
  clearCart(): void {
    this.cartItems = [];
    this.updateCart();
  }

  // Get item count
  getItemCount(): number {
    return this.cartItems.reduce((count, item) => count + item.quantity, 0);
  }

  private updateCart(): void {
    this.cartSubject.next([...this.cartItems]);
    this.saveCartToStorage();
  }

  private saveCartToStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  private loadCartFromStorage(): void {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        this.cartItems = JSON.parse(saved);
        this.updateCart();
      } catch (e) {
        this.cartItems = [];
      }
    }
  }
}

