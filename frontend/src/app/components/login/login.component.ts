import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div style="max-width: 400px; margin: 50px auto; padding: 20px; background: white; border: 1px solid #ccc;">
      <h2>Login</h2>
      <form (ngSubmit)="onSubmit()">
        <div>
          <label>Username:</label>
          <input type="text" [(ngModel)]="username" name="username" required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" [(ngModel)]="password" name="password" required />
        </div>
        <div *ngIf="error" class="error">{{ error }}</div>
        <button type="submit" [disabled]="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      <p>Don't have an account? <a routerLink="/register">Register here</a></p>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.error = '';
    this.loading = true;

    this.authService.login(this.username, this.password).subscribe({
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
        this.error = err.error?.error || 'Invalid credentials';
      }
    });
  }
}
