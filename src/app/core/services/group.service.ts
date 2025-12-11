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
  setDoc,
  docData,
  limit,
} from '@angular/fire/firestore';
import { Observable, from, map, switchMap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Group, GroupMember } from '../models/group.model';

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
      isOpen: true,
      memberIds: [currentUser.id],
      status: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    return from(addDoc(this.groupsCollection, groupData)).pipe(
      switchMap((ref) => {
        // Add creator as admin in subcollection
        const memberRef = doc(this.firestore, `groups/${ref.id}/members/${currentUser.id}`);
        const memberData: GroupMember = {
          userId: currentUser.id,
          role: 'admin',
          status: 'active',
          joinedAt: now,
        };
        return from(setDoc(memberRef, memberData)).pipe(map(() => ref.id));
      })
    );
  }

  getUserGroups(): Observable<Group[]> {
    return this.authService.userProfile$.pipe(
      switchMap((user) => {
        if (!user) return from([]); // Return empty if no user

        const q = query(
          this.groupsCollection,
          where('memberIds', 'array-contains', user.id),
          where('status', '==', true)
        );
        // Cast the observable effectively
        return collectionData(q, { idField: 'id' }) as Observable<Group[]>;
      })
    );
  }

  getGroup(groupId: string): Observable<Group | undefined> {
    const docRef = doc(this.firestore, 'groups', groupId);
    return docData(docRef, { idField: 'id' }) as Observable<Group | undefined>;
  }

  searchGroups(term: string): Observable<Group[]> {
    const q = query(
      this.groupsCollection,
      where('isOpen', '==', true),
      where('name', '>=', term),
      where('name', '<=', term + '\uf8ff'),
      limit(10)
    );
    return collectionData(q, { idField: 'id' }) as Observable<Group[]>;
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
