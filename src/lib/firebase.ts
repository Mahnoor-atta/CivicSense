import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  Firestore,
  getDocs,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  FirebaseStorage,
} from 'firebase/storage';
import { ComplaintSubmission, LocationData, PriorityLevel, ComplaintStatus } from '../types/civic';

/**
 * ============================================================================
 * FIREBASE CONFIGURATION PLACEHOLDERS
 * Replace the values below with your actual project credentials from the
 * Firebase Console (Project Settings > General > Your apps > Web app)
 * ============================================================================
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Checks whether live Firebase credentials have been configured via environment variables.
 */
export function isFirebaseConfigured(): boolean {
  return (
    Boolean(firebaseConfig.apiKey) &&
    Boolean(firebaseConfig.projectId) &&
    !firebaseConfig.apiKey.includes('YOUR_FIREBASE_API_KEY') &&
    !firebaseConfig.projectId.includes('your-civic-project-id')
  );
}

// Lazy initialization of Firebase instances
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

export function getFirebaseServices() {
  if (isFirebaseConfigured()) {
    try {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      db = getFirestore(app);
      storage = getStorage(app);
      return { app, db, storage, live: true };
    } catch (err) {
      console.warn('Firebase initialization failed with provided config:', err);
    }
  }
  return { app: null, db: null, storage: null, live: false };
}

export interface ComplaintUploadPayload {
  category: string;
  customCategoryDetail?: string;
  description: string;
  priority: PriorityLevel;
  location: LocationData;
  citizenName?: string;
  citizenContact?: string;
  citizenEmail?: string;
  isAnonymous: boolean;
  potentialDuplicateOf?: string;
  duplicateDistanceMeters?: number;
}

/**
 * Uploads citizen complaint image to Firebase Storage and complaint document to Firestore.
 * If Firebase placeholders are active, smoothly simulates upload and stores in local record store.
 */
export async function handleUpload(
  file: File | null,
  complaintData: ComplaintUploadPayload,
  onProgress?: (progressPct: number) => void
): Promise<ComplaintSubmission> {
  const { db: firestoreDb, storage: firestoreStorage, live } = getFirebaseServices();
  console.log('handleUpload initiated. Firebase live:', live);
  const randomTracking = `CIV-${Math.floor(1000 + Math.random() * 9000)}`;

  // PATH A: Real Firebase Storage + Firestore (when configured)
  if (live && firestoreDb && firestoreStorage) {
    let downloadUrl: string | undefined = undefined;

    if (file) {
      const storagePath = `complaints/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const storageRef = ref(firestoreStorage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      const timeoutPromise = new Promise<void>((_, reject) =>
        setTimeout(() => {
          uploadTask.cancel();
          reject(new Error('Upload timed out after 30 seconds'));
        }, 30000)
      );

      await Promise.race([
        new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              if (onProgress) onProgress(Math.round(progress));
            },
            (error) => reject(error),
            async () => {
              downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        }),
        timeoutPromise,
      ]);
    }

    const complaintsCol = collection(firestoreDb, 'complaints');
    try {
      const docRef = await addDoc(complaintsCol, {
        ...complaintData,
        trackingNumber: randomTracking,
        imageUrl: downloadUrl || null,
        imageFileName: file?.name || null,
        status: 'Received' as ComplaintStatus,
        createdAt: serverTimestamp(),
      });

      const submission: ComplaintSubmission = {
        id: docRef.id,
        firestoreDocId: docRef.id,
        trackingNumber: randomTracking,
        ...complaintData,
        imageUrl: downloadUrl,
        imageFileName: file?.name,
        status: 'Received',
        createdAt: Date.now(),
      };

      saveLocalRecord(submission);
      return submission;
    } catch (error) {
      console.error('Error submitting complaint to Firestore:', error);
      throw error;
    }
  }

  // PATH B: Seamless Preview Simulation (Placeholders active)
  if (onProgress) {
    onProgress(25);
    await new Promise((r) => setTimeout(r, 160));
    onProgress(65);
    await new Promise((r) => setTimeout(r, 180));
    onProgress(100);
  }

  let localImageUrl: string | undefined = undefined;
  if (file) {
    try {
      localImageUrl = await fileToDataUrl(file);
    } catch {
      localImageUrl = URL.createObjectURL(file);
    }
  }

  const mockSubmission: ComplaintSubmission = {
    id: `fb_mock_${Date.now()}`,
    firestoreDocId: `sim_firestore_${Math.random().toString(36).substring(2, 9)}`,
    trackingNumber: randomTracking,
    ...complaintData,
    imageUrl: localImageUrl,
    imageFileName: file?.name,
    status: 'Received',
    createdAt: Date.now(),
  };

  saveLocalRecord(mockSubmission);
  return mockSubmission;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function fetchComplaints(): Promise<ComplaintSubmission[]> {
  const { db, live } = getFirebaseServices();
  if (!live || !db) {
    console.log('Firebase not live, returning empty complaints list.');
    return [];
  }

  try {
    const complaintsCol = collection(db, 'complaints');
    const snapshot = await getDocs(complaintsCol);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      firestoreDocId: doc.id,
      ...doc.data(),
    })) as ComplaintSubmission[];
  } catch (err) {
    console.error('Failed to fetch complaints:', err);
    return [];
  }
}

/**
 * Admin action: Reject complaint with mandatory note
 */
export async function rejectComplaintRecord(
  complaintId: string,
  rejectionNote: string,
  adminEmail: string
): Promise<ComplaintSubmission | null> {
  const { db, live } = getFirebaseServices();
  if (!live || !db) return null;
  
  // Note: To make this fully functional, we'd need to update the Firestore document.
  // Given the current scope, we will implement the Firestore update here.
  
  // Implementation would go here: updateDoc(doc(db, 'complaints', complaintId), { ... })
  
  return null; // Placeholder for now, as real Firestore update implementation is pending.
}

/**
 * Admin action: Forward complaint to Faculty with deadline
 */
export async function forwardComplaintRecord(
  complaintId: string,
  deadline: string,
  facultyAssignee?: string,
  adminNotes?: string,
  adminEmail?: string
): Promise<ComplaintSubmission | null> {
  return null; // Placeholder for now.
}

/**
 * Faculty action: Mark forwarded complaint as Resolved with optional note
 */
export async function resolveComplaintRecord(
  complaintId: string,
  resolutionNote?: string,
  facultyEmail?: string,
  resolutionImageUrl?: string
): Promise<ComplaintSubmission | null> {
  return null; // Placeholder for now.
}
