import { Timestamp } from '@angular/fire/firestore';

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  searchName?: string;
}
