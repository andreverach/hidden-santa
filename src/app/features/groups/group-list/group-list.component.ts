import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { GroupService } from '../../../core/services/group.service';
import { Group } from '../../../core/models/group.model';

import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [CommonModule, RouterLink, SkeletonLoaderComponent],
  templateUrl: './group-list.component.html',
})
export class GroupListComponent implements OnInit {
  private groupService = inject(GroupService);

  // Data Signal
  groups = signal<Group[]>([]);
  loading = signal<boolean>(true);

  // Computed Signals (Derived State)
  hasGroups = computed(() => this.groups().length > 0);

  ngOnInit(): void {
    this.groupService.getUserGroups().subscribe({
      next: (groups) => {
        this.groups.set(groups);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
