import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div style="max-width: 500px; margin: 50px auto; padding: 20px; background: white; border: 1px solid #ccc;">
      <h2>Register</h2>
      <form (ngSubmit)="onSubmit()">
        <div>
          <label>Username:</label>
          <input type="text" [(ngModel)]="userData.username" name="username" required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" [(ngModel)]="userData.email" name="email" required />
        </div>
        <div>
          <label>First Name:</label>
          <input type="text" [(ngModel)]="userData.firstName" name="firstName" required />
        </div>
        <div>
          <label>Last Name:</label>
          <input type="text" [(ngModel)]="userData.lastName" name="lastName" required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" [(ngModel)]="userData.password" name="password" required minlength="6" />
        </div>
        <div>
          <label>Role:</label>
          <select [(ngModel)]="userData.role" name="role">
            <option value="CUSTOMER">Customer</option>
            <option value="ADMIN">Admin</option>
            <option value="DELIVERY_AGENT">Delivery Agent</option>
          </select>
        </div>
        <div *ngIf="error" class="error">{{ error }}</div>
        <button type="submit" [disabled]="loading">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
      </form>
      <p>Already have an account? <a routerLink="/login">Login here</a></p>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  userData = {
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'CUSTOMER'
  };
  error = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.error = '';
    this.loading = true;

    this.authService.register(this.userData).subscribe({
      next: (response) => {
        this.loading = false;
        const role = response.user.role;
        if (role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else if (role === 'DELIVERY_AGENT') {
          this.router.navigate(['/delivery/dashboard']);
        } else {
          this.router.navigate(['/restaurants']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Registration failed';
      }
    });
  }
}
