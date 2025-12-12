import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  writeBatch,
  collection,
  docData,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable, from, throwError } from 'rxjs';
import { GroupMember, GroupAssignment } from '../models/group.model';

@Injectable({
  providedIn: 'root',
})
export class DrawService {
  private firestore = inject(Firestore);

  /**
   * Executes the Secret Santa Draw using a Random Shuffle algorithm.
   * 1. Shuffles the participants.
   * 2. Assignments: P[0]->P[1], P[1]->P[2], ..., P[Last]->P[0].
   * 3. Saves all assignments in a batch.
   */
  runDraw(groupId: string, members: (GroupMember & { user?: any })[]): Observable<void> {
    if (!members || members.length < 2) {
      return throwError(() => new Error('Need at least 2 members to draw'));
    }

    // 1. Filter only active members (sanity check)
    const activeMembers = members.filter((m) => m.status === 'active');
    if (activeMembers.length < 2) {
      return throwError(() => new Error('Need at least 2 active members'));
    }

    // 2. Fisher-Yates Shuffle
    const shuffled = [...activeMembers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 3. Create Assignments using Batch
    const batch = writeBatch(this.firestore);

    // Group Ref to update status
    const groupRef = doc(this.firestore, `groups/${groupId}`);
    batch.update(groupRef, { drawStatus: 'completed' });

    // Create assignments
    for (let i = 0; i < shuffled.length; i++) {
      const giver = shuffled[i];
      const receiver = shuffled[(i + 1) % shuffled.length]; // Circular next

      // Path: groups/{groupId}/assignments/{giverId}
      const assignmentRef = doc(this.firestore, `groups/${groupId}/assignments/${giver.userId}`);
      const assignmentData: GroupAssignment = {
        groupId,
        giverId: giver.userId,
        receiverId: receiver.userId,
        receiverName: receiver.user?.displayName || 'Unknown', // Storing denormalized for speed
      };
      batch.set(assignmentRef, assignmentData);
    }

    return from(batch.commit());
  }

  getMyAssignment(groupId: string, userId: string): Observable<GroupAssignment | undefined> {
    const docRef = doc(this.firestore, `groups/${groupId}/assignments/${userId}`);
    return docData(docRef) as Observable<GroupAssignment | undefined>;
  }
}
