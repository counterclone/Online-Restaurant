import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
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
