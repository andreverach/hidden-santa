import { Routes } from '@angular/router';
import { redirectLoggedInTo, redirectUnauthorizedTo, canActivate } from '@angular/fire/auth-guard';
import { LoginComponent } from './features/auth/login/login.component';

// functionally guards
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/login']);
const redirectLoggedInToDashboard = () => redirectLoggedInTo(['/dashboard']);

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginComponent,
    ...canActivate(redirectLoggedInToDashboard),
  },
  {
    path: 'groups/new',
    loadComponent: () =>
      import('./features/groups/create-group/create-group.component').then(
        (m) => m.CreateGroupComponent
      ),
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'groups/:id',
    loadComponent: () =>
      import('./features/groups/group-detail/group-detail.component').then(
        (m) => m.GroupDetailComponent
      ),
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    ...canActivate(redirectUnauthorizedToLogin),
  },
];
