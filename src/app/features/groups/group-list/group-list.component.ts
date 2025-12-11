import { Component, computed, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { GroupService } from '../../../core/services/group.service';
import { MembershipService } from '../../../core/services/membership.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Group, GroupMember } from '../../../core/models/group.model';
import { switchMap, take } from 'rxjs/operators';
import { of } from 'rxjs';

import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [CommonModule, RouterLink, SkeletonLoaderComponent],
  templateUrl: './group-list.component.html',
})
export class GroupListComponent implements OnInit {
  private groupService = inject(GroupService);
  private membershipService = inject(MembershipService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  // Data Signal
  groups = signal<Group[]>([]);
  invites = signal<{ group: Group; member: GroupMember }[]>([]);
  loading = signal<boolean>(true);

  // Computed Signals (Derived State)
  hasGroups = computed(() => this.groups().length > 0);
  hasInvites = computed(() => this.invites().length > 0);

  ngOnInit(): void {
    // Load Groups
    this.groupService
      .getUserGroups()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (groups) => {
          this.groups.set(groups);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });

    // Load Invites
    this.authService.user$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((user) => {
          if (!user) return of([]);
          return this.membershipService.getPendingInvites(user.uid);
        })
      )
      .subscribe((invites) => {
        this.invites.set(invites);
      });
  }

  acceptInvite(groupId: string) {
    this.authService.user$.pipe(take(1)).subscribe((user) => {
      if (!user) return;
      this.membershipService.updateStatus(groupId, user.uid, 'active').subscribe({
        next: () => {
          // Toast or specific UI update if needed (auto-updates via realtime listener)
        },
        error: (err) => console.error(err),
      });
    });
  }

  rejectInvite(groupId: string) {
    this.authService.user$.pipe(take(1)).subscribe((user) => {
      if (!user) return;
      this.membershipService.removeMember(groupId, user.uid).subscribe({
        next: () => {
          // Toast or specific UI update if needed
        },
        error: (err) => console.error(err),
      });
    });
  }
}
