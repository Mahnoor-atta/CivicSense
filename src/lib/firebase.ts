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
import { compressImage } from './imageUtils';

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
        base64Image = await compressImage(file);
      } catch (err) {
        console.error('Failed to compress image:', err);
        // Fallback to original if compression fails
        base64Image = await fileToDataUrl(file);
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

const INITIAL_SAMPLE_COMPLAINTS: ComplaintSubmission[] = [
  {
    id: 'mock_1',
    firestoreDocId: 'mock_1',
    trackingNumber: 'CIV-1024',
    category: 'Potholes & Road Damage',
    description: 'Deep pothole near commercial market causing traffic slowdown and vehicle damage risks.',
    priority: 'High',
    status: 'Received',
    createdAt: Date.now() - 3600000 * 4,
    citizenName: 'Noor (Citizen)',
    citizenEmail: 'noor@gmail.com',
    location: {
      address: 'Main Boulevard, Gulberg III, Lahore',
      country: 'Pakistan',
      province: 'Punjab',
      city: 'Lahore',
      streetAddress: 'Gulberg III',
      lat: 31.5204,
      lng: 74.3587,
    },
  },
  {
    id: 'mock_2',
    firestoreDocId: 'mock_2',
    trackingNumber: 'CIV-4819',
    category: 'Streetlight & Electrical Hazards',
    description: 'Streetlight pole wire exposed near children park pathway.',
    priority: 'High',
    status: 'Forwarded',
    createdAt: Date.now() - 3600000 * 24,
    citizenName: 'Ali Khan',
    citizenEmail: 'ali@gmail.com',
    facultyAssignee: 'Bureau of Street Lighting & Electrical Faculty',
    forwardDeadline: '2026-10-20',
    location: {
      address: 'Block H, Phase 2, Johar Town, Lahore',
      country: 'Pakistan',
      province: 'Punjab',
      city: 'Lahore',
      streetAddress: 'Johar Town',
      lat: 31.4697,
      lng: 74.2728,
    },
  },
  {
    id: 'mock_3',
    firestoreDocId: 'mock_3',
    trackingNumber: 'CIV-7291',
    category: 'Sanitation & Solid Waste',
    description: 'Garbage bin overflowing near residential corner.',
    priority: 'Medium',
    status: 'Resolved',
    createdAt: Date.now() - 3600000 * 48,
    resolvedAt: Date.now() - 3600000 * 12,
    citizenName: 'Noor (Citizen)',
    citizenEmail: 'noor@gmail.com',
    facultyAssignee: 'Sanitation & Solid Waste Management Faculty',
    resolutionNote: 'Garbage cleared and container disinfected by sanitation squad.',
    resolvedBy: 'faculty@gmail.com',
    location: {
      address: 'F-7/2, Islamabad Capital Territory',
      country: 'Pakistan',
      province: 'ICT',
      city: 'Islamabad',
      streetAddress: 'F-7/2',
      lat: 33.7215,
      lng: 73.0433,
    },
  },
];

export async function fetchComplaints(): Promise<ComplaintSubmission[]> {
  const { db, live } = getFirebaseServices();
  let firebaseRecords: ComplaintSubmission[] = [];

  if (live && db) {
    try {
      const complaintsCol = collection(db, 'complaints');
      const snapshot = await getDocs(complaintsCol);
      firebaseRecords = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          firestoreDocId: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().getTime() : data.createdAt,
        };
      }) as ComplaintSubmission[];
    } catch (err) {
      console.warn('Failed to fetch from Firestore, relying on local storage:', err);
    }
  }

  try {
    const existing = localStorage.getItem('civic_complaints');
    let localRecords: ComplaintSubmission[] = existing ? JSON.parse(existing) : [];
    if (localRecords.length === 0 && firebaseRecords.length === 0) {
      localRecords = INITIAL_SAMPLE_COMPLAINTS;
      localStorage.setItem('civic_complaints', JSON.stringify(localRecords));
    }

    const combinedMap = new Map<string, ComplaintSubmission>();
    [...localRecords, ...firebaseRecords].forEach((item) => {
      combinedMap.set(item.id || item.trackingNumber, item);
    });
    return Array.from(combinedMap.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (err) {
    console.error('Failed to load local complaints:', err);
    return firebaseRecords.length > 0 ? firebaseRecords : INITIAL_SAMPLE_COMPLAINTS;
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

  updateLocalRecordById(complaintId, {
    status: 'Rejected',
    rejectedReason: rejectionNote,
    rejectedBy: adminEmail,
  });

  if (live && db) {
    try {
      const docRef = doc(db, 'complaints', complaintId);
      await updateDoc(docRef, {
        status: 'Rejected',
        rejectedReason: rejectionNote,
        rejectedBy: adminEmail,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Firestore update failed, updated locally:', err);
    }
  }

  return { id: complaintId } as ComplaintSubmission;
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

  updateLocalRecordById(complaintId, {
    status: 'Forwarded',
    forwardDeadline: deadline,
    facultyAssignee: facultyAssignee || null,
    adminNotes: adminNotes || null,
    forwardedBy: adminEmail || null,
  });

  if (live && db) {
    try {
      const docRef = doc(db, 'complaints', complaintId);
      const updateData: any = {
        status: 'Forwarded',
        forwardDeadline: deadline,
        facultyAssignee: facultyAssignee || null,
        adminNotes: adminNotes || null,
        forwardedBy: adminEmail || null,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(docRef, updateData);
    } catch (err) {
      console.warn('Firestore update failed, updated locally:', err);
    }
  }

  return { id: complaintId, trackingNumber: '' } as ComplaintSubmission;
}

/**
 * Faculty action: Mark forwarded complaint as Resolved with optional note
 */
export async function resolveComplaintRecord(
  complaintId: string,
  resolutionNote?: string,
  facultyEmail?: string,
  file?: File
): Promise<ComplaintSubmission | null> {
  const { db, live } = getFirebaseServices();

  let resolutionImageUrl: string | undefined = undefined;
  if (file) {
    try {
      resolutionImageUrl = await compressImage(file);
    } catch (err) {
      console.error('Failed to compress resolution image:', err);
    }
  }

  updateLocalRecordById(complaintId, {
    status: 'Resolved',
    resolutionNote: resolutionNote || null,
    resolvedBy: facultyEmail || null,
    resolutionImageUrl: resolutionImageUrl || null,
    resolvedAt: Date.now(),
  });

  if (live && db) {
    try {
      const docRef = doc(db, 'complaints', complaintId);
      const updateData: any = {
        status: 'Resolved',
        resolutionNote: resolutionNote || null,
        resolvedBy: facultyEmail || null,
        resolutionImageUrl: resolutionImageUrl || null,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(docRef, updateData);
    } catch (err) {
      console.warn('Firestore update failed, updated locally:', err);
    }
  }

  return { id: complaintId, trackingNumber: '' } as ComplaintSubmission;
}

/**
 * Saves a complaint submission to localStorage.
 */
function saveLocalRecord(submission: ComplaintSubmission) {
  try {
    const existing = localStorage.getItem('civic_complaints');
    const records = existing ? JSON.parse(existing) : [];
    records.unshift(submission);
    localStorage.setItem('civic_complaints', JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save complaint locally:', err);
  }
}

function updateLocalRecordById(complaintId: string, updates: Partial<ComplaintSubmission>) {
  try {
    const existing = localStorage.getItem('civic_complaints');
    if (!existing) return;
    let records: ComplaintSubmission[] = JSON.parse(existing);
    records = records.map((r) =>
      r.id === complaintId || r.firestoreDocId === complaintId || r.trackingNumber === complaintId
        ? { ...r, ...updates }
        : r
    );
    localStorage.setItem('civic_complaints', JSON.stringify(records));
  } catch (err) {
    console.error('Failed to update local record:', err);
  }
}
