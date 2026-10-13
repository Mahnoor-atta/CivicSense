export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type ComplaintStatus = 'Received' | 'Under Review' | 'Forwarded' | 'Rejected' | 'Resolved';
export type UserRole = 'citizen' | 'admin' | 'faculty';

export interface UserAccount {
  email: string;
  name: string;
  role: UserRole;
  department?: string;
}

export interface LocationData {
  address: string; // Full formatted address
  country?: string; // "Pakistan"
  province?: string; // e.g. "Punjab", "Sindh", "Khyber Pakhtunkhwa"
  city?: string; // e.g. "Lahore", "Karachi", "Islamabad"
  streetAddress?: string; // specific typed street/area e.g. "Main Boulevard, Block B"
  lat: number;
  lng: number;
  landmark?: string;
}

export interface ComplaintCategory {
  id: string;
  label: string;
  iconName: string;
  description: string;
  suggestedDepartment: string;
}

export interface TriageResult {
  category: string;
  priority: PriorityLevel;
  department: string;
  reasoning: string;
  confidence?: number;
}

export interface DuplicateMatch {
  existingComplaint: ComplaintSubmission;
  distanceMeters: number;
  similarityScore: number;
  matchReason: string;
}

export interface ComplaintSubmission {
  id: string;
  trackingNumber: string;
  category: string;
  customCategoryDetail?: string; // When 'Other' category is selected
  description: string;
  priority: PriorityLevel;
  location: LocationData;
  imageUrl?: string;
  imageFileName?: string;
  citizenName?: string;
  citizenContact?: string;
  citizenEmail?: string;
  isAnonymous: boolean;
  status: ComplaintStatus;
  createdAt: string | number;
  firestoreDocId?: string;

  // Duplicate detection flags
  potentialDuplicateOf?: string; // Tracking ID of matching complaint
  duplicateDistanceMeters?: number;

  // Admin Review & Forwarding fields
  reviewedBy?: string;
  reviewedAt?: string | number;
  rejectedReason?: string; // Mandatory when admin rejects
  forwardDeadline?: string; // Deadline selector when forwarded
  facultyAssignee?: string;
  adminNotes?: string;

  // Faculty Resolution fields with Evidence Photo
  resolvedAt?: string | number;
  resolvedBy?: string;
  resolutionNote?: string; // Resolution explanation note
  resolutionImageUrl?: string; // Photo evidence of repair
  resolutionImageFileName?: string;
}
