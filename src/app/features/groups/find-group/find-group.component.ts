import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../../../core/services/group.service';
import { MembershipService } from '../../../core/services/membership.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Group } from '../../../core/models/group.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, tap } from 'rxjs';

@Component({
  selector: 'app-find-group',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  templateUrl: './find-group.component.html',
})
export class FindGroupComponent {
  private groupService = inject(GroupService);
  private membershipService = inject(MembershipService);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;

  // State
  searchTerm = signal('');
  results = signal<Group[]>([]);
  loading = signal(false);

  // Search Stream
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.loading.set(true)),
        switchMap((term) => {
          if (!term || term.length < 2) return of([]);
          return this.groupService.searchGroups(term);
        })
      )
      .subscribe({
        next: (groups) => {
          this.results.set(groups);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.searchSubject.next(term);
  }

  joinGroup(group: Group): void {
    if (!this.currentUser()) return;

    // Optimistic UI could be added here
    this.membershipService.requestJoin(group.id, this.currentUser()!.id).subscribe({
      next: () => {
        // Navigate to group detail or show success message
        this.router.navigate(['/groups', group.id]);
      },
    });
  }
}
