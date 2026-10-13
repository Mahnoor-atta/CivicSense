import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  Firestore,
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
  const randomTracking = `CIV-${Math.floor(1000 + Math.random() * 9000)}`;

  // PATH A: Real Firebase Storage + Firestore (when configured)
  if (live && firestoreDb && firestoreStorage) {
    let downloadUrl: string | undefined = undefined;

    if (file) {
      const storagePath = `complaints/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const storageRef = ref(firestoreStorage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise<void>((resolve, reject) => {
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
      });
    }

    const complaintsCol = collection(firestoreDb, 'complaints');
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

const STORAGE_KEY = 'civicsense_complaints_v4';

/**
 * Seed initial realistic complaints so Admin and Faculty have immediate demo records
 */
function getInitialSeedComplaints(): ComplaintSubmission[] {
  return [
    {
      id: 'civ_seed_101',
      trackingNumber: 'CIV-1042',
      category: 'Potholes & Road Damage',
      description: 'Deep road crater developing near crosswalk, causing cars to swerve into oncoming lane.',
      priority: 'High',
      location: {
        address: 'Main Boulevard, Gulberg III, Lahore, Punjab, Pakistan',
        country: 'Pakistan',
        province: 'Punjab',
        city: 'Lahore',
        streetAddress: 'Main Boulevard, Gulberg III',
        lat: 31.5204,
        lng: 74.3587,
        landmark: 'Liberty Roundabout',
      },
      citizenName: 'Noor',
      citizenEmail: 'noor@gmail.com',
      isAnonymous: false,
      status: 'Received',
      createdAt: Date.now() - 3600 * 1000 * 4,
      firestoreDocId: 'doc_firestore_1042',
    },
    {
      id: 'civ_seed_102',
      trackingNumber: 'CIV-2819',
      category: 'Streetlights & Traffic Signals',
      description: 'Streetlight pole buzzing loudly and completely unlit for 3 nights in front of school bus stop.',
      priority: 'High',
      location: {
        address: 'Jinnah Avenue, Blue Area, Islamabad, Islamabad Capital Territory, Pakistan',
        country: 'Pakistan',
        province: 'Islamabad Capital Territory',
        city: 'Islamabad',
        streetAddress: 'Jinnah Avenue, Blue Area',
        lat: 33.7126,
        lng: 73.0652,
        landmark: 'Metro Station 3',
      },
      citizenName: 'Noor',
      citizenEmail: 'noor@gmail.com',
      isAnonymous: false,
      status: 'Forwarded',
      createdAt: Date.now() - 3600 * 1000 * 28,
      forwardDeadline: '2026-10-18',
      facultyAssignee: 'Bureau of Street Lighting & Electrical Faculty',
      adminNotes: 'Prioritized due to pedestrian school crossing proximity.',
      reviewedBy: 'admin@gmail.com',
      reviewedAt: Date.now() - 3600 * 1000 * 12,
      firestoreDocId: 'doc_firestore_2819',
    },
    {
      id: 'civ_seed_103',
      trackingNumber: 'CIV-3375',
      category: 'Water Leakage & Drainage',
      description: 'Storm drain clogged with tree branches; standing water accumulated over 5 inches after rain.',
      priority: 'Medium',
      location: {
        address: 'Mall Road, Saddar, Rawalpindi, Punjab, Pakistan',
        country: 'Pakistan',
        province: 'Punjab',
        city: 'Rawalpindi',
        streetAddress: 'Mall Road, Saddar',
        lat: 33.5935,
        lng: 73.0549,
        landmark: 'Saddar Bazaar',
      },
      citizenName: 'Noor',
      citizenEmail: 'noor@gmail.com',
      isAnonymous: false,
      status: 'Forwarded',
      createdAt: Date.now() - 3600 * 1000 * 40,
      forwardDeadline: '2026-10-22',
      facultyAssignee: 'Municipal Drainage & Water Faculty',
      adminNotes: 'Dispatched to Faculty for pump truck clearance.',
      reviewedBy: 'admin@gmail.com',
      reviewedAt: Date.now() - 3600 * 1000 * 20,
      firestoreDocId: 'doc_firestore_3375',
    },
    {
      id: 'civ_seed_104',
      trackingNumber: 'CIV-4912',
      category: 'Waste & Illegal Dumping',
      description: 'Multiple mattresses and damaged wooden pallets abandoned beside public recycling bins.',
      priority: 'Medium',
      location: {
        address: 'Shahrah-e-Faisal, Block 6 PECHS, Karachi, Sindh, Pakistan',
        country: 'Pakistan',
        province: 'Sindh',
        city: 'Karachi',
        streetAddress: 'Shahrah-e-Faisal, Block 6 PECHS',
        lat: 24.8607,
        lng: 67.0011,
        landmark: 'Nursery Flyover',
      },
      citizenName: 'Community Resident',
      citizenEmail: 'resident@gmail.com',
      isAnonymous: true,
      status: 'Resolved',
      createdAt: Date.now() - 3600 * 1000 * 72,
      forwardDeadline: '2026-10-14',
      facultyAssignee: 'Sanitation & Solid Waste Faculty',
      imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=400&q=80',
      resolutionImageUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=400&q=80',
      resolvedBy: 'faculty@gmail.com',
      resolvedAt: Date.now() - 3600 * 1000 * 6,
      resolutionNote: 'Sanitation rapid sweep crew collected and cleared all dumped items. Sidewalk swept and sanitized.',
      firestoreDocId: 'doc_firestore_4912',
    },
    {
      id: 'civ_seed_105',
      trackingNumber: 'CIV-5108',
      category: 'Other',
      customCategoryDetail: 'Wild beehive hanging dangerously low on park walking trail',
      description: 'Swarm of bees built an active hive right above the stroller trail branch.',
      priority: 'High',
      location: {
        address: 'University Road, Old City, Peshawar, Khyber Pakhtunkhwa, Pakistan',
        country: 'Pakistan',
        province: 'Khyber Pakhtunkhwa',
        city: 'Peshawar',
        streetAddress: 'University Road, Old City',
        lat: 34.0151,
        lng: 71.5249,
      },
      citizenName: 'Noor',
      citizenEmail: 'noor@gmail.com',
      isAnonymous: false,
      status: 'Received',
      createdAt: Date.now() - 3600 * 1000 * 2,
      firestoreDocId: 'doc_firestore_5108',
    },
  ];
}

export function getStoredComplaints(): ComplaintSubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = getInitialSeedComplaints();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialSeedComplaints();
  }
}

export function saveLocalRecord(submission: ComplaintSubmission) {
  try {
    const existing = getStoredComplaints();
    const updated = [submission, ...existing.filter((item) => item.id !== submission.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }
}

/**
 * Admin action: Reject complaint with mandatory note
 */
export function rejectComplaintRecord(
  complaintId: string,
  rejectionNote: string,
  adminEmail: string
): ComplaintSubmission | null {
  const all = getStoredComplaints();
  const idx = all.findIndex((c) => c.id === complaintId);
  if (idx === -1) return null;

  const updated: ComplaintSubmission = {
    ...all[idx],
    status: 'Rejected',
    rejectedReason: rejectionNote,
    reviewedBy: adminEmail,
    reviewedAt: Date.now(),
  };

  all[idx] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return updated;
}

/**
 * Admin action: Forward complaint to Faculty with deadline
 */
export function forwardComplaintRecord(
  complaintId: string,
  deadline: string,
  facultyAssignee?: string,
  adminNotes?: string,
  adminEmail?: string
): ComplaintSubmission | null {
  const all = getStoredComplaints();
  const idx = all.findIndex((c) => c.id === complaintId);
  if (idx === -1) return null;

  const updated: ComplaintSubmission = {
    ...all[idx],
    status: 'Forwarded',
    forwardDeadline: deadline,
    facultyAssignee: facultyAssignee || 'Municipal Faculty',
    adminNotes: adminNotes || undefined,
    reviewedBy: adminEmail || 'admin@gmail.com',
    reviewedAt: Date.now(),
  };

  all[idx] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return updated;
}

/**
 * Faculty action: Mark forwarded complaint as Resolved with optional note
 */
export function resolveComplaintRecord(
  complaintId: string,
  resolutionNote?: string,
  facultyEmail?: string,
  resolutionImageUrl?: string
): ComplaintSubmission | null {
  const all = getStoredComplaints();
  const idx = all.findIndex((c) => c.id === complaintId);
  if (idx === -1) return null;

  const updated: ComplaintSubmission = {
    ...all[idx],
    status: 'Resolved',
    resolutionNote: resolutionNote || 'Issue addressed and resolved by faculty crew.',
    resolvedBy: facultyEmail || 'faculty@gmail.com',
    resolutionImageUrl: resolutionImageUrl || all[idx].resolutionImageUrl || undefined,
    resolvedAt: Date.now(),
  };

  all[idx] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return updated;
}
