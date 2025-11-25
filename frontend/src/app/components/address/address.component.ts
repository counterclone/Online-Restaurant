import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AddressService, Address } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div style="padding: 20px;">
      <h1>My Addresses</h1>
      
      <div *ngIf="loading">Loading addresses...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      
      <div *ngIf="!loading && !error">
        <button *ngIf="!showAddForm && !showEditForm" (click)="showAddForm = true">Add New Address</button>
        
        <div *ngIf="showAddForm" style="border: 1px solid #ccc; padding: 20px; margin: 20px 0; background: white;">
          <h2>Add Address</h2>
          <form (ngSubmit)="addAddress()">
            <div>
              <label>Street:</label>
              <input type="text" [(ngModel)]="newAddress.street" name="street" required />
            </div>
            <div>
              <label>City:</label>
              <input type="text" [(ngModel)]="newAddress.city" name="city" required />
            </div>
            <div>
              <label>State:</label>
              <input type="text" [(ngModel)]="newAddress.state" name="state" required />
            </div>
            <div>
              <label>Pincode:</label>
              <input type="text" [(ngModel)]="newAddress.pincode" name="pincode" required />
            </div>
            <button type="submit">Add Address</button>
            <button type="button" (click)="cancelForm()">Cancel</button>
          </form>
        </div>
        
        <div *ngIf="showEditForm" style="border: 1px solid #ccc; padding: 20px; margin: 20px 0; background: white;">
          <h2>Edit Address</h2>
          <form (ngSubmit)="updateAddress()">
            <div>
              <label>Street:</label>
              <input type="text" [(ngModel)]="editAddress.street" name="street" required />
            </div>
            <div>
              <label>City:</label>
              <input type="text" [(ngModel)]="editAddress.city" name="city" required />
            </div>
            <div>
              <label>State:</label>
              <input type="text" [(ngModel)]="editAddress.state" name="state" required />
            </div>
            <div>
              <label>Pincode:</label>
              <input type="text" [(ngModel)]="editAddress.pincode" name="pincode" required />
            </div>
            <button type="submit">Update Address</button>
            <button type="button" (click)="cancelForm()">Cancel</button>
          </form>
        </div>
        
        <div *ngIf="addresses.length === 0 && !showAddForm && !showEditForm">
          <p>No addresses found. Add your first address.</p>
        </div>
        
        <ng-container *ngIf="!showAddForm && !showEditForm">
          <div *ngFor="let address of addresses" style="border: 1px solid #ccc; padding: 15px; margin: 10px 0; background: white;">
          <p><strong>{{ address.street }}</strong></p>
          <p>{{ address.city }}, {{ address.state }} - {{ address.pincode }}</p>
          <button (click)="editAddressForm(address)">Edit</button>
          <button (click)="deleteAddress(address.id)">Delete</button>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: []
})
export class AddressComponent implements OnInit {
  addresses: Address[] = [];
  loading = false;
  error = '';
  showAddForm = false;
  showEditForm = false;
  newAddress: Omit<Address, 'id' | 'userId'> = {
    street: '',
    city: '',
    state: '',
    pincode: ''
  };
  editAddress: Address = {
    id: 0,
    userId: 0,
    street: '',
    city: '',
    state: '',
    pincode: ''
  };

  constructor(
    private addressService: AddressService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.loading = true;
    this.addressService.getAddresses().subscribe({
      next: (data) => {
        this.addresses = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load addresses';
        this.loading = false;
      }
    });
  }

  addAddress(): void {
    this.addressService.createAddress(this.newAddress).subscribe({
      next: () => {
        this.showAddForm = false;
        this.newAddress = { street: '', city: '', state: '', pincode: '' };
        this.loadAddresses();
      },
      error: () => {
        this.error = 'Failed to add address';
      }
    });
  }

  editAddressForm(address: Address): void {
    this.editAddress = { ...address };
    this.showEditForm = true;
  }

  updateAddress(): void {
    this.addressService.updateAddress(this.editAddress.id, {
      street: this.editAddress.street,
      city: this.editAddress.city,
      state: this.editAddress.state,
      pincode: this.editAddress.pincode
    }).subscribe({
      next: () => {
        this.showEditForm = false;
        this.loadAddresses();
      },
      error: () => {
        this.error = 'Failed to update address';
      }
    });
  }

  deleteAddress(id: number): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.addressService.deleteAddress(id).subscribe({
        next: () => {
          this.loadAddresses();
        },
        error: () => {
          this.error = 'Failed to delete address';
        }
      });
    }
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.showEditForm = false;
    this.newAddress = { street: '', city: '', state: '', pincode: '' };
  }
}
