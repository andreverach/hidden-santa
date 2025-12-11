import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { GroupService } from '../../../core/services/group.service';
import { Group } from '../../../core/models/group.model';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './group-list.component.html',
})
export class GroupListComponent implements OnInit {
  private groupService = inject(GroupService);

  // Data Signal
  groups = signal<Group[]>([]);

  // Computed Signals (Derived State)
  hasGroups = computed(() => this.groups().length > 0);

  ngOnInit(): void {
    this.groupService.getUserGroups().subscribe((groups) => this.groups.set(groups));
  }
}
