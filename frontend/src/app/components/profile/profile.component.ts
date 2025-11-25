import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProfileService, Profile } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div style="padding: 20px; max-width: 600px;">
      <h1>My Profile</h1>
      
      <div *ngIf="loading">Loading profile...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      
      <div *ngIf="!loading && !error">
        <form (ngSubmit)="updateProfile()">
          <div>
            <label>First Name:</label>
            <input type="text" [(ngModel)]="profile.firstName" name="firstName" />
          </div>
          <div>
            <label>Last Name:</label>
            <input type="text" [(ngModel)]="profile.lastName" name="lastName" />
          </div>
          <div>
            <label>Email:</label>
            <input type="email" [(ngModel)]="profile.email" name="email" />
          </div>
          <div>
            <label>Phone Number:</label>
            <input type="text" [(ngModel)]="profile.phoneNumber" name="phoneNumber" />
          </div>
          <div>
            <label>Bio:</label>
            <textarea [(ngModel)]="profile.bio" name="bio" rows="4"></textarea>
          </div>
          <button type="submit">Update Profile</button>
          <button type="button" routerLink="/restaurants">Cancel</button>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class ProfileComponent implements OnInit {
  profile: Profile = {
    id: 0,
    userId: 0,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    bio: ''
  };
  loading = false;
  error = '';

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load profile';
        this.loading = false;
      }
    });
  }

  updateProfile(): void {
    this.profileService.updateProfile({
      firstName: this.profile.firstName,
      lastName: this.profile.lastName,
      email: this.profile.email,
      phoneNumber: this.profile.phoneNumber,
      bio: this.profile.bio
    }).subscribe({
      next: () => {
        alert('Profile updated successfully!');
        this.loadProfile();
      },
      error: () => {
        this.error = 'Failed to update profile';
      }
    });
  }
}
