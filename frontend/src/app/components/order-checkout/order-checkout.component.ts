import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderService, OrderRequest } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { AddressService, Address } from '../../services/profile.service';

@Component({
  selector: 'app-order-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div style="padding: 20px;">
      <h1>Checkout</h1>
      
      <div *ngIf="loading">Processing order...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      
      <div *ngIf="!loading">
        <div style="display: flex; gap: 30px;">
          <div style="flex: 2;">
            <h2>Order Summary</h2>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of cartItems">
                  <td>{{ item.menuItem.name }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>₹{{ item.menuItem.price * item.quantity }}</td>
                </tr>
              </tbody>
            </table>
            <div style="margin-top: 20px;">
              <p><strong>Subtotal:</strong> ₹{{ getTotal() }}</p>
              <p><strong>Tax (18% GST):</strong> ₹{{ getTax() }}</p>
              <p *ngIf="getDiscount() > 0"><strong>Discount (10%):</strong> -₹{{ getDiscount() }}</p>
              <p><strong>Total:</strong> ₹{{ getFinalTotal() }}</p>
            </div>
          </div>
          
          <div style="flex: 1;">
            <h2>Delivery Address</h2>
            <div *ngIf="addresses.length > 0">
              <select [(ngModel)]="selectedAddressId" name="address" style="width: 100%; padding: 8px; margin: 10px 0;">
                <option [ngValue]="0">Select an address</option>
                <option *ngFor="let addr of addresses" [ngValue]="addr.id">
                  {{ addr.street }}, {{ addr.city }}, {{ addr.state }} - {{ addr.pincode }}
                </option>
              </select>
            </div>
            <div *ngIf="addresses.length === 0">
              <p>No addresses found. Please add an address.</p>
              <button routerLink="/profile/address">Add Address</button>
            </div>
            <div *ngIf="showNewAddress" style="border: 1px solid #ccc; padding: 15px; margin: 10px 0;">
              <div>
                <label>Street:</label>
                <input type="text" [(ngModel)]="newAddress.street" />
              </div>
              <div>
                <label>City:</label>
                <input type="text" [(ngModel)]="newAddress.city" />
              </div>
              <div>
                <label>State:</label>
                <input type="text" [(ngModel)]="newAddress.state" />
              </div>
              <div>
                <label>Pincode:</label>
                <input type="text" [(ngModel)]="newAddress.pincode" />
              </div>
              <button (click)="addNewAddress()">Add Address</button>
              <button (click)="showNewAddress = false">Cancel</button>
            </div>
            <button *ngIf="!showNewAddress" (click)="showNewAddress = true">Add New Address</button>
          </div>
        </div>
        
        <div style="margin-top: 20px;">
          <button routerLink="/cart">Back to Cart</button>
          <button (click)="placeOrder()" [disabled]="!canPlaceOrder()">Place Order</button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class OrderCheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  addresses: Address[] = [];
  selectedAddressId: number = 0;
  showNewAddress = false;
  newAddress: Omit<Address, 'id' | 'userId'> = {
    street: '',
    city: '',
    state: '',
    pincode: ''
  };
  loading = false;
  error = '';
  restaurantId: number = 0;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private addressService: AddressService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      if (items.length > 0) {
        this.restaurantId = items[0].menuItem.restaurantId;
      }
    });
    
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.addressService.getAddresses().subscribe({
      next: (data) => {
        this.addresses = data;
        // Auto-select first address if available
        if (data.length > 0 && this.selectedAddressId === 0) {
          this.selectedAddressId = data[0].id;
        }
      },
      error: () => {
        this.addresses = [];
      }
    });
  }

  addNewAddress(): void {
    this.addressService.createAddress(this.newAddress).subscribe({
      next: (addr) => {
        this.addresses.push(addr);
        this.selectedAddressId = addr.id;
        this.showNewAddress = false;
        this.newAddress = { street: '', city: '', state: '', pincode: '' };
      },
      error: () => {
        this.error = 'Failed to add address';
      }
    });
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

  canPlaceOrder(): boolean {
    return this.cartItems.length > 0 && this.selectedAddressId > 0 && this.selectedAddressId !== 0;
  }

  placeOrder(): void {
    if (this.cartItems.length === 0) {
      this.error = 'Your cart is empty';
      return;
    }

    if (!this.selectedAddressId || this.selectedAddressId === 0) {
      this.error = 'Please select a delivery address';
      return;
    }

    const selectedAddress = this.addresses.find(a => a.id === this.selectedAddressId);
    if (!selectedAddress) {
      this.error = 'Selected address not found. Please select a valid address.';
      return;
    }

    const deliveryAddress = `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`;
    
    // Validate cart items
    if (this.cartItems.length === 0) {
      this.error = 'Your cart is empty';
      return;
    }

    // Validate restaurant ID - get from first cart item if not set
    if (!this.restaurantId || this.restaurantId === 0) {
      if (this.cartItems.length > 0 && this.cartItems[0].menuItem.restaurantId) {
        this.restaurantId = this.cartItems[0].menuItem.restaurantId;
      } else {
        this.error = 'Invalid restaurant. Please try again.';
        return;
      }
    }

    // Validate all cart items have valid menu item IDs
    const invalidItems = this.cartItems.filter(item => !item.menuItem || !item.menuItem.id || item.quantity <= 0);
    if (invalidItems.length > 0) {
      this.error = 'Some items in your cart are invalid. Please refresh and try again.';
      return;
    }

    const orderRequest: OrderRequest = {
      restaurantId: this.restaurantId,
      deliveryAddress: deliveryAddress,
      orderItems: this.cartItems.map(item => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity
      }))
    };

    console.log('Placing order with request:', JSON.stringify(orderRequest, null, 2));

    this.loading = true;
    this.error = '';

    this.orderService.createOrder(orderRequest).subscribe({
      next: (order) => {
        this.loading = false;
        // Only clear cart after successful order creation
        this.cartService.clearCart();
        // Navigate to order history instead of specific order to avoid access issues
        this.router.navigate(['/orders']).then(() => {
          // Optional: Show success message
          console.log('Order placed successfully:', order.id);
        }).catch(err => {
          console.error('Navigation error:', err);
          // If navigation fails, still show success
          this.router.navigate(['/orders']);
        });
      },
      error: (err) => {
        this.loading = false;
        console.error('Order creation error:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        
        if (err.status === 0) {
          this.error = 'Cannot connect to server. Please check if the backend is running.';
        } else if (err.status === 401 || err.status === 403) {
          this.error = 'Authentication failed. Please login again.';
          this.router.navigate(['/login']);
        } else if (err.error) {
          if (typeof err.error === 'string') {
            this.error = err.error;
          } else if (err.error.error) {
            this.error = err.error.error;
          } else if (err.error.message) {
            this.error = err.error.message;
          } else {
            this.error = `Failed to place order (Status: ${err.status}). Please try again.`;
          }
        } else if (err.message) {
          this.error = err.message;
        } else {
          this.error = `Failed to place order (Status: ${err.status || 'Unknown'}). Please try again.`;
        }
      }
    });
  }
}
