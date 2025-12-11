import { Timestamp } from '@angular/fire/firestore';

export interface Group {
  id?: string;
  name: string;
  description?: string;
  creatorId: string;
  status: boolean; // true = active, false = deleted (soft delete)
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt?: Timestamp | null;
}
