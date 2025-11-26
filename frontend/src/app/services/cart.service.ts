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

  addToCart(menuItem: MenuItem, quantity: number = 1): void {
    const existingItem = this.cartItems.find(item => item.menuItem.id === menuItem.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cartItems.push({ menuItem, quantity });
    }
    
    this.updateCart();
  }

  removeItem(menuItemId: number): void {
    this.cartItems = this.cartItems.filter(item => item.menuItem.id !== menuItemId);
    this.updateCart();
  }

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

  getCartItems(): CartItem[] {
    return [...this.cartItems];
  }

  getTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  }

  getFinalTotal(): number {
    return this.getTotal();
  }

  clearCart(): void {
    this.cartItems = [];
    this.updateCart();
  }

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

