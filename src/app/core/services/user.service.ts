import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  limit,
  collectionData,
  doc,
  docData,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AppUser } from '../models/user.model';
import { normalizeString } from '../../shared/utils/text.utils';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore = inject(Firestore);
  private usersCollection = collection(this.firestore, 'users');

  searchUsers(term: string): Observable<AppUser[]> {
    // Search by normalized name
    const normalizedTerm = normalizeString(term);

    // Note: This requires users to have 'searchName' field populated.
    // Existing users without this field won't be found until they log in again (triggering update).
    const q = query(
      this.usersCollection,
      where('searchName', '>=', normalizedTerm),
      where('searchName', '<=', normalizedTerm + '\uf8ff'),
      limit(5)
    );
    return collectionData(q, { idField: 'id' }) as Observable<AppUser[]>;
  }

  getUser(userId: string): Observable<AppUser | undefined> {
    const docRef = doc(this.firestore, 'users', userId);
    return docData(docRef, { idField: 'id' }) as Observable<AppUser | undefined>;
  }
}
