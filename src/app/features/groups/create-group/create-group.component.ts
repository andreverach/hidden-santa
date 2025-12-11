import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GroupService } from '../../../core/services/group.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-create-group',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './create-group.component.html',
})
export class CreateGroupComponent {
  private groupService = inject(GroupService);
  private router = inject(Router);

  name = '';
  description = '';
  isSubmitting = false;

  onSubmit() {
    if (!this.name) return;
    this.isSubmitting = true;

    this.groupService.createGroup(this.name, this.description).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error creating group:', err);
        this.isSubmitting = false;
        // TODO: Show toast error
      },
    });
  }
}
