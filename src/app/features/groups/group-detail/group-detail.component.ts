import { Component, inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { GroupService } from '../../../core/services/group.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, NgClass],
  templateUrl: './group-detail.component.html',
})
export class GroupDetailComponent {
  private route = inject(ActivatedRoute);
  private groupService = inject(GroupService);

  group = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id');
        return id ? this.groupService.getGroup(id) : [];
      })
    )
  );
}
