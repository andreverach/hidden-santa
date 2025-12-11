import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, NgClass, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap, map, forkJoin, of, take, tap } from 'rxjs';
import { GroupService } from '../../../core/services/group.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { MembershipService } from '../../../core/services/membership.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Group, GroupMember } from '../../../core/models/group.model';
import { AppUser } from '../../../core/models/user.model';

interface MemberWithProfile extends GroupMember {
  user?: AppUser;
}

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LoadingSpinnerComponent,
    NgClass,
    TitleCasePipe,
    SkeletonLoaderComponent,
  ],
  templateUrl: './group-detail.component.html',
})
export class GroupDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private groupService = inject(GroupService);
  private membershipService = inject(MembershipService);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  // Signals
  group = signal<Group | undefined>(undefined);
  members = signal<MemberWithProfile[]>([]);
  loading = signal<boolean>(true);
  membersLoading = signal<boolean>(true);

  currentUser = this.authService.currentUser;

  // Computed
  isAdmin = computed(() => {
    const user = this.currentUser();
    const groupMembers = this.members();
    if (!user || groupMembers.length === 0) return false;
    return groupMembers.some((m) => m.userId === user.id && m.role === 'admin');
  });

  ngOnInit(): void {
    const groupId$ = this.route.paramMap.pipe(map((params) => params.get('id')));

    // 1. Group Subscription
    groupId$
      .pipe(
        switchMap((id) => {
          if (!id) return of(undefined);
          this.loading.set(true);
          return this.groupService.getGroup(id);
        })
      )
      .subscribe({
        next: (group) => {
          this.group.set(group);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });

    // 2. Members Subscription
    groupId$
      .pipe(
        switchMap((id) => {
          if (!id) return of([]);
          this.membersLoading.set(true);
          return this.membershipService.getGroupMembers(id).pipe(
            switchMap((members) => {
              if (members.length === 0) return of([]);
              const requests = members.map((m) =>
                this.userService.getUser(m.userId).pipe(
                  take(1),
                  map((u) => ({ ...m, user: u } as MemberWithProfile))
                )
              );
              return forkJoin(requests);
            })
          );
        })
      )
      .subscribe({
        next: (members) => {
          this.members.set(members);
          this.membersLoading.set(false);
        },
        error: () => this.membersLoading.set(false),
      });
  }

  approveMember(member: MemberWithProfile): void {
    const groupId = this.group()?.id;
    if (!groupId) return;

    this.membershipService.updateStatus(groupId, member.userId, 'active').subscribe(() => {
      // Update local state optimistically or wait for firestore subscription update
      // Since we are subscribing to collectionData, it should update automatically?
      // GroupService.getUserGroups calls collectionData, but MembershipService.getGroupMembers
      // calls collectionData too? YES.
      // So changes should reflect automatically via the subscription.
    });
  }

  removeMember(member: MemberWithProfile): void {
    const groupId = this.group()?.id;
    if (!groupId) return;

    // Confirmation could be added here
    if (!confirm('¿Estás seguro?')) return;

    this.membershipService.removeMember(groupId, member.userId).subscribe();
  }
}
