import { Timestamp } from '@angular/fire/firestore';

export interface Group {
  id: string;
  name: string;
  description?: string;
  creatorId: string;
  isOpen: boolean; // Defines if group is open to join requests
  memberIds: string[]; // Array of user IDs for efficient querying 'my groups'
  status: boolean; // Active vs Soft Deleted
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt: Timestamp | null;
}

export interface GroupMember {
  userId: string;
  role: 'admin' | 'member';
  status: 'active' | 'invited' | 'requesting';
  joinedAt: Timestamp;
}
