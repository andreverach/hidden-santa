import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { GroupService } from '../../../core/services/group.service';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './group-list.component.html',
})
export class GroupListComponent {
  private groupService = inject(GroupService);

  // Data Signal
  groups = toSignal(this.groupService.getUserGroups(), { initialValue: [] });

  // Computed Signals (Derived State)
  groupsCount = computed(() => this.groups().length);
  hasGroups = computed(() => this.groupsCount() > 0);
}
