import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  collectionData,
  doc,
  updateDoc,
  Timestamp,
} from '@angular/fire/firestore';
import { Observable, from, map, switchMap, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Group } from '../models/group.model';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private groupsCollection = collection(this.firestore, 'groups');

  createGroup(name: string, description: string = ''): Observable<string> {
    const currentUser = this.authService.currentUser();
    if (!currentUser) throw new Error('User must be logged in to create a group');

    const now = Timestamp.now();
    const groupData: Omit<Group, 'id'> = {
      name,
      description,
      creatorId: currentUser.id,
      status: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    return from(addDoc(this.groupsCollection, groupData)).pipe(map((ref) => ref.id));
  }

  getUserGroups(): Observable<Group[]> {
    return this.authService.userProfile$.pipe(
      switchMap((user) => {
        if (!user) return from([]); // Return empty if no user

        const q = query(
          this.groupsCollection,
          where('creatorId', '==', user.id),
          where('status', '==', true)
        );
        // Cast the observable effectively
        return collectionData(q, { idField: 'id' }) as Observable<Group[]>;
      })
    );
  }

  softDeleteGroup(groupId: string): Observable<void> {
    const docRef = doc(this.firestore, 'groups', groupId);
    return from(
      updateDoc(docRef, {
        status: false,
        deletedAt: Timestamp.now(),
      })
    );
  }
}
