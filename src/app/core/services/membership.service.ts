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
  collectionGroup,
  where,
  onSnapshot,
  getDoc,
} from '@angular/fire/firestore';
import { Observable, from, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { GroupMember, Group, WishlistItem } from '../models/group.model';
import { GroupService } from './group.service';

@Injectable({
  providedIn: 'root',
})
export class MembershipService {
  private firestore = inject(Firestore);
  private groupService = inject(GroupService);

  // Get members of a specific group
  getGroupMembers(groupId: string): Observable<GroupMember[]> {
    const membersCollection = collection(this.firestore, `groups/${groupId}/members`);
    const q = query(membersCollection);
    return collectionData(q) as Observable<GroupMember[]>;
  }

  // Get pending invites for a user across all groups
  getPendingInvites(userId: string): Observable<{ group: Group; member: GroupMember }[]> {
    const membersGroup = collectionGroup(this.firestore, 'members');
    const q = query(membersGroup, where('userId', '==', userId), where('status', '==', 'invited'));

    return new Observable<any[]>((observer) => {
      return onSnapshot(
        q,
        (snapshot) => observer.next(snapshot.docs),
        (error) => observer.error(error)
      );
    }).pipe(
      switchMap((docs) => {
        if (docs.length === 0) return of([]);

        const tasks = docs.map((docSnap) => {
          const member = docSnap.data() as GroupMember;
          // groups/{groupId}/members/{userId}
          const groupRef = docSnap.ref.parent.parent;
          if (!groupRef) return of(null);

          return this.groupService
            .getGroup(groupRef.id)
            .pipe(map((group) => (group ? { group, member } : null)));
        });

        return combineLatest(tasks).pipe(
          map((results) =>
            results.filter((r): r is { group: Group; member: GroupMember } => r !== null)
          )
        );
      })
    );
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
  // Wishlist Management
  addWishlistItem(groupId: string, userId: string, item: WishlistItem): Observable<void> {
    const memberRef = doc(this.firestore, `groups/${groupId}/members/${userId}`);
    return from(
      updateDoc(memberRef, {
        wishlist: arrayUnion(item),
      })
    );
  }

  removeWishlistItem(groupId: string, userId: string, itemId: string): Observable<void> {
    const memberRef = doc(this.firestore, `groups/${groupId}/members/${userId}`);
    // Read the doc to find the exact item to remove, or filter out
    // Since we don't store the exact object reference in UI always, robust way is:
    return from(getDoc(memberRef)).pipe(
      switchMap((snap) => {
        if (!snap.exists()) throw new Error('Member not found');
        const member = snap.data() as GroupMember;
        const currentWishlist = member.wishlist || [];
        const updatedWishlist = currentWishlist.filter((i) => i.id !== itemId);
        return updateDoc(memberRef, { wishlist: updatedWishlist });
      })
    );
  }
}
