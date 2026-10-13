import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  Firestore,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';
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

export function getFirebaseServices() {
  if (isFirebaseConfigured()) {
    try {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      db = getFirestore(app);
      return { app, db, live: true };
    } catch (err) {
      console.warn('Firebase initialization failed with provided config:', err);
    }
  }
  return { app: null, db: null, live: false };
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
  const { db: firestoreDb, live } = getFirebaseServices();
  console.log('handleUpload initiated. Firebase live:', live);
  const randomTracking = `CIV-${Math.floor(1000 + Math.random() * 9000)}`;

  // PATH A: Real Firebase Firestore (when configured)
  if (live && firestoreDb) {
    let base64Image: string | undefined = undefined;

    if (file) {
      try {
        base64Image = await fileToDataUrl(file);
      } catch (err) {
        console.error('Failed to convert image to Base64:', err);
      }
    }

    const complaintsCol = collection(firestoreDb, 'complaints');
    try {
      const dataToSave: any = {
        ...complaintData,
        trackingNumber: randomTracking,
        imageUrl: base64Image || null,
        imageFileName: file?.name || null,
        status: 'Received' as ComplaintStatus,
        createdAt: serverTimestamp(),
      };

      // Firestore does not allow 'undefined'. Convert all 'undefined' to 'null'.
      Object.keys(dataToSave).forEach((key) => {
        if (dataToSave[key] === undefined) {
          dataToSave[key] = null;
        }
      });

      const docRef = await addDoc(complaintsCol, dataToSave);

      const submission: ComplaintSubmission = {
        id: docRef.id,
        firestoreDocId: docRef.id,
        ...dataToSave,
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

  try {
    const docRef = doc(db, 'complaints', complaintId);
    await updateDoc(docRef, {
      status: 'Rejected',
      rejectedReason: rejectionNote,
      rejectedBy: adminEmail,
      updatedAt: serverTimestamp(),
    });

    // Return the updated data (fetching latest or constructing updated object)
    return { id: complaintId } as ComplaintSubmission;
  } catch (err) {
    console.error('Failed to reject complaint:', err);
    return null;
  }
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
  const { db, live } = getFirebaseServices();
  if (!live || !db) return null;

  try {
    const docRef = doc(db, 'complaints', complaintId);
    await updateDoc(docRef, {
      status: 'Forwarded',
      forwardDeadline: deadline,
      facultyAssignee: facultyAssignee,
      adminNotes: adminNotes,
      forwardedBy: adminEmail,
      updatedAt: serverTimestamp(),
    });

    return { id: complaintId, trackingNumber: '' } as ComplaintSubmission;
  } catch (err) {
    console.error('Failed to forward complaint:', err);
    return null;
  }
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
  const { db, live } = getFirebaseServices();
  if (!live || !db) return null;

  try {
    const docRef = doc(db, 'complaints', complaintId);
    await updateDoc(docRef, {
      status: 'Resolved',
      resolutionNote: resolutionNote,
      resolvedBy: facultyEmail,
      resolutionImageUrl: resolutionImageUrl,
      updatedAt: serverTimestamp(),
    });

    return { id: complaintId, trackingNumber: '' } as ComplaintSubmission;
  } catch (err) {
    console.error('Failed to resolve complaint:', err);
    return null;
  }
}

/**
 * Saves a complaint submission to localStorage.
 */
function saveLocalRecord(submission: ComplaintSubmission) {
  try {
    const existing = localStorage.getItem('civic_complaints');
    const records = existing ? JSON.parse(existing) : [];
    records.push(submission);
    localStorage.setItem('civic_complaints', JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save complaint locally:', err);
  }
}
