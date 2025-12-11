import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  limit,
  collectionData,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AppUser } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore = inject(Firestore);
  private usersCollection = collection(this.firestore, 'users');

  searchUsers(term: string): Observable<AppUser[]> {
    // Search by email (exact or prefix) or displayName (prefix)
    // For simplicity we will search by displayName prefix
    const q = query(
      this.usersCollection,
      where('displayName', '>=', term),
      where('displayName', '<=', term + '\uf8ff'),
      limit(5)
    );
    return collectionData(q, { idField: 'id' }) as Observable<AppUser[]>;
  }
}
