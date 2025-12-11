import { Injectable, inject, signal } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { catchError, from, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);

  // Expose user as a signal for easier usage in templates integration
  // effectively using 'user' observable from angular/fire
  user$ = user(this.auth);
  currentUser = signal<User | null>(null);

  constructor() {
    // Sync signal with observable
    this.user$.subscribe((user) => this.currentUser.set(user));
  }

  loginWithGoogle(): Observable<void> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider)).pipe(
      tap(() => this.router.navigate(['/dashboard'])),
      catchError((error) => {
        console.error('Login failed', error);
        return throwError(() => error);
      }),
      // We map to void to simplify the signature
      tap(() => {}) as any
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(tap(() => this.router.navigate(['/login'])));
  }
}
