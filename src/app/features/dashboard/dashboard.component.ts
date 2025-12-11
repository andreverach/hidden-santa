import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { GroupListComponent } from '../groups/group-list/group-list.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, GroupListComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  authService = inject(AuthService);

  logout() {
    this.authService.logout().subscribe();
  }
}
