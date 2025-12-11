import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  Timestamp,
  collection,
  collectionData,
  query,
  writeBatch,
  arrayUnion,
  arrayRemove,
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { GroupMember } from '../models/group.model';

@Injectable({
  providedIn: 'root',
})
export class MembershipService {
  private firestore = inject(Firestore);

  // Get members of a specific group
  getGroupMembers(groupId: string): Observable<GroupMember[]> {
    const membersCollection = collection(this.firestore, `groups/${groupId}/members`);
    const q = query(membersCollection);
    return collectionData(q) as Observable<GroupMember[]>;
  }

  // Invite a user to a group (Admin action)
  inviteUser(groupId: string, userId: string): Observable<void> {
    const memberRef = doc(this.firestore, `groups/${groupId}/members/${userId}`);
    const memberData: GroupMember = {
      userId,
      role: 'member',
      status: 'invited',
      joinedAt: Timestamp.now(),
    };
    return from(setDoc(memberRef, memberData));
  }

  // Request to join a group (User action)
  requestJoin(groupId: string, userId: string): Observable<void> {
    const memberRef = doc(this.firestore, `groups/${groupId}/members/${userId}`);
    const memberData: GroupMember = {
      userId,
      role: 'member',
      status: 'requesting',
      joinedAt: Timestamp.now(),
    };
    return from(setDoc(memberRef, memberData));
  }

  // Accept an invite (User action) or Approve a request (Admin action) -> Becomes active member
  // Accept an invite (User action) or Approve a request (Admin action) -> Becomes active member
  updateStatus(groupId: string, userId: string, status: 'active'): Observable<void> {
    const batch = writeBatch(this.firestore);

    // 1. Update Member Status
    const memberRef = doc(this.firestore, `groups/${groupId}/members/${userId}`);
    batch.update(memberRef, { status });

    // 2. Add to Group's memberIds array (so it shows in "My Groups")
    const groupRef = doc(this.firestore, `groups/${groupId}`);
    batch.update(groupRef, {
      memberIds: arrayUnion(userId),
    });

    return from(batch.commit());
  }

  // Reject request or Leave group
  removeMember(groupId: string, userId: string): Observable<void> {
    const batch = writeBatch(this.firestore);

    // 1. Delete Member document
    const memberRef = doc(this.firestore, `groups/${groupId}/members/${userId}`);
    batch.delete(memberRef);

    // 2. Remove from Group's memberIds array
    const groupRef = doc(this.firestore, `groups/${groupId}`);
    batch.update(groupRef, {
      memberIds: arrayRemove(userId),
    });

    return from(batch.commit());
  }
}
