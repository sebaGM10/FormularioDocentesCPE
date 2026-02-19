import { Injectable, signal } from '@angular/core';
import type { UserRecord } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class FlowService {
  readonly currentUser = signal<Partial<UserRecord> & { docId?: string }>({});

  updateUser(data: Partial<UserRecord> & { docId?: string }) {
    this.currentUser.update((prev) => ({ ...prev, ...data }));
  }

  reset() {
    this.currentUser.set({});
  }
}
