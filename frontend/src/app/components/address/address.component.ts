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
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.css']
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
