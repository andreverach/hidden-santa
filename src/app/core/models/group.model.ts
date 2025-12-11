import { Timestamp } from '@angular/fire/firestore';

export interface Group {
  id: string;
  name: string;
  description?: string;
  creatorId: string;
  isOpen: boolean; // Defines if group is open to join requests
  memberIds: string[]; // Array of user IDs for efficient querying 'my groups'
  status: boolean; // Active vs Soft Deleted
  searchName?: string; // Normalized name for search
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt: Timestamp | null;
}

export interface WishlistItem {
  id: string;
  name: string;
  url?: string;
  createdAt: Timestamp;
}

export interface GroupMember {
  userId: string;
  role: 'admin' | 'member';
  status: 'active' | 'invited' | 'requesting';
  joinedAt: Timestamp;
  wishlist?: WishlistItem[];
}
