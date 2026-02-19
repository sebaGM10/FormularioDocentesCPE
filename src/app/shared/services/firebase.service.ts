import { Injectable } from '@angular/core';
import { db, storage } from './firebase.config';
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface UserRecord {
  id?: string;
  nombre: string;
  cedula: string;
  correo: string;
  enSIM: boolean;
  enDocentes: boolean;
  actaNombramientoURL?: string;
  nivel?: 'Básico' | 'Intermedio' | 'Avanzado';
  puntaje?: number;
  modalidad?: 'Virtual' | 'Presencial';
  fechaRegistro?: unknown;
}

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private simCollection = collection(db, 'SIM');
  private docentesCollection = collection(db, 'DOCENTES');
  private usersCollection = collection(db, 'users');

  async checkInSIM(cedula: string): Promise<boolean> {
    const q = query(this.simCollection, where('cedula', '==', cedula));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  async checkInDocentes(cedula: string): Promise<boolean> {
    const q = query(this.docentesCollection, where('cedula', '==', cedula));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  async uploadActa(file: File, cedula: string): Promise<string> {
    const storageRef = ref(storage, `actas/${cedula}_${Date.now()}.pdf`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }

  async saveUser(user: UserRecord): Promise<string> {
    // const docId = user.cedula; // La cédula es el nombre del documento
    const docId = `user_${user.cedula.trim()}`; // Prefijo para evitar conflictos con otras colecciones
    const docRef = doc(db, 'users', docId);
    await setDoc(docRef, {
      ...user,
      fechaRegistro: serverTimestamp(),
    });
    return docId;
  }

  async updateUser(docId: string, data: Partial<UserRecord>): Promise<void> {
    const docRef = doc(db, 'users', docId);
    await updateDoc(docRef, data);
  }

  async getUserByCedula(cedula: string): Promise<(UserRecord & { id: string }) | null> {
    const q = query(this.usersCollection, where('cedula', '==', cedula));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const d = snapshot.docs[0];
    return { id: d.id, ...d.data() } as UserRecord & { id: string };
  }

  async getAllUsers(): Promise<UserRecord[]> {
    const q = query(this.usersCollection, orderBy('fechaRegistro', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as UserRecord);
  }
}
