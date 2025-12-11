import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  authService = inject(AuthService);
  isLoggingIn = false;

  login() {
    this.isLoggingIn = true;
    this.authService.loginWithGoogle().subscribe({
      error: (err) => {
        console.error('Error signing in', err);
        this.isLoggingIn = false;
      },
    });
  }
}
