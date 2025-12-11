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
  updateStatus(groupId: string, userId: string, status: 'active'): Observable<void> {
    const memberRef = doc(this.firestore, `groups/${groupId}/members/${userId}`);

    // If becoming active, we might want to update the main Group document's memberIds array too
    // This usually requires a Cloud Function or a batch write to be atomic and safe.
    // For this prototype, we'll just update the member status here.
    // Ideally, we must also add userId to group.memberIds so "My Groups" query works.

    // We will do a batch write here in a future iteration or cloud function.
    // For now, let's just update the status.
    // NOTE: The user won't see this group in "My Groups" until their ID is in group.memberIds.
    // We should implement that update here.

    return from(updateDoc(memberRef, { status }));
  }

  // Reject request or Leave group
  removeMember(groupId: string, userId: string): Observable<void> {
    const memberRef = doc(this.firestore, `groups/${groupId}/members/${userId}`);
    return from(deleteDoc(memberRef));
  }
}
