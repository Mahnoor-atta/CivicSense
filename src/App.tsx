/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Send,
  AlertTriangle,
  CheckCircle2,
  ListOrdered,
  FileText,
  User,
  Shield,
  Sparkles,
  Smartphone,
  Monitor,
  Clock,
  Settings,
  ChevronRight,
  Info,
  Menu,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  MapPin,
  Calendar,
  Home,
} from 'lucide-react';
import {
  LocationData,
  PriorityLevel,
  ComplaintSubmission,
  UserAccount,
  UserRole,
} from './types/civic';
import { FileUpload } from './components/FileUpload';
import { LocationPicker } from './components/LocationPicker';
import { CategoryPicker } from './components/CategoryPicker';
import { AITriageWidget } from './components/AITriageWidget';
import { SubmissionsList } from './components/SubmissionsList';
import { SummaryStatCards } from './components/SummaryStatCards';
import { Sidebar, NavTab } from './components/Sidebar';
import { AuthScreen, TEST_USERS } from './components/AuthScreen';
import { LandingPage } from './components/LandingPage';
import { DuplicateAlertBanner } from './components/DuplicateAlertBanner';
import { detectDuplicates } from './lib/duplicateDetection';
import { AdminReviewPanel } from './components/AdminReviewPanel';
import { FacultyReviewPanel } from './components/FacultyReviewPanel';
import { ProfileView } from './components/ProfileView';
import {
  DoodleCivicLogo,
  DoodleHouse,
  DoodleCheckCircle,
  DoodleSparkle,
  DoodleHeart,
  DoodleSquiggleUnderline,
  DoodlePaperPlane,
} from './components/Doodles';
import {
  handleUpload,
  fetchComplaints,
  isFirebaseConfigured,
  firebaseConfig,
  rejectComplaintRecord,
  forwardComplaintRecord,
  resolveComplaintRecord,
} from './lib/firebase';

const SAMPLE_ISSUES = [
  'Broken Streetlight',
  'Clogged Drain',
  'Pothole on Main Road',
];

export default function App() {
  // ----------------------------------------------------
  // Dedicated Landing Page & Auth View State
  // The first page users see is the dedicated Home Page
  // ----------------------------------------------------
  const [viewMode, setViewMode] = useState<'landing' | 'login' | 'app'>('landing');

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ----------------------------------------------------
  // Form State:
  // Manage image file, category, custom category detail,
  // description, location, and priority
  // ----------------------------------------------------
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('Potholes & Road Damage');
  const [customCategoryDetail, setCustomCategoryDetail] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<LocationData>({
    address: '',
    country: 'Pakistan',
    province: '',
    city: '',
    streetAddress: '',
    lat: 0,
    lng: 0,
  });
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  // Submission lifecycle state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [submittedData, setSubmittedData] = useState<ComplaintSubmission | null>(null);
  const [submissionsList, setSubmissionsList] = useState<ComplaintSubmission[]>([]);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load complaints from Firebase on mount
  useEffect(() => {
    async function loadComplaints() {
      const data = await fetchComplaints();
      setSubmissionsList(data);
    }
    loadComplaints();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Role-Based Redirection on Login
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    setViewMode('app');

    // Role-based redirection after login:
    // Citizen -> complaint form ('new_complaint') or Dashboard with My Reports
    // Admin -> table-based complaint review panel ('complaints')
    // Faculty -> panel showing only forwarded complaints ('complaints')
    if (user.role === 'citizen') {
      setCurrentTab('dashboard');
      triggerToast(`Welcome ${user.name}!`);
    } else if (user.role === 'admin') {
      setCurrentTab('dashboard');
      triggerToast(`Welcome Admin.`);
    } else if (user.role === 'faculty') {
      setCurrentTab('dashboard');
      triggerToast(`Welcome Faculty.`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setViewMode('landing');
    triggerToast('Signed out of CivicSense.');
  };

  const handleSwitchUser = (user: UserAccount) => {
    handleLogin(user);
  };

  // Admin Actions
  const handleAdminReject = async (complaintId: string, rejectionNote: string) => {
    if (!currentUser) return;
    const complaint = submissionsList.find(c => c.id === complaintId);
    const updated = await rejectComplaintRecord(complaintId, rejectionNote, currentUser.email);
    if (updated) {
      setSubmissionsList(await fetchComplaints());
      triggerToast(`Complaint ${complaint?.trackingNumber || 'Record'} rejected with citizen notice.`);
    }
  };

  const handleAdminForward = async (
    complaintId: string,
    deadline: string,
    facultyAssignee?: string,
    adminNotes?: string
  ) => {
    if (!currentUser) return;
    const complaint = submissionsList.find(c => c.id === complaintId);
    const updated = await forwardComplaintRecord(
      complaintId,
      deadline,
      facultyAssignee,
      adminNotes,
      currentUser.email
    );
    if (updated) {
      setSubmissionsList(await fetchComplaints());
      triggerToast(
        `Complaint ${complaint?.trackingNumber || 'Record'} forwarded to faculty (Due: ${deadline}).`
      );
    }
  };

  // Duplicate detection state
  const [acknowledgedDuplicate, setAcknowledgedDuplicate] = useState<string | null>(null);
  const [dismissDuplicates, setDismissDuplicates] = useState<boolean>(false);

  // Automated Duplicate Detection Engine
  const detectedDuplicates = useMemo(() => {
    // Only detect if both description and location have been explicitly set
    if (
      !location.address ||
      location.address.trim() === '' ||
      !description.trim() ||
      dismissDuplicates
    )
      return [];
    return detectDuplicates(
      {
        category,
        description,
        location,
        customCategoryDetail,
      },
      submissionsList
    );
  }, [category, description, location, customCategoryDetail, submissionsList, dismissDuplicates]);

  // Faculty Actions with Resolution Photo Evidence
  const handleFacultyResolve = async (
    complaintId: string,
    resolutionNote?: string,
    resolutionImageUrl?: string
  ) => {
    if (!currentUser) return;
    console.log('Resolving complaint for user:', currentUser.email, 'complaintId:', complaintId);
    const complaint = submissionsList.find(c => c.id === complaintId);
    const updated = await resolveComplaintRecord(
      complaintId,
      resolutionNote,
      currentUser.email,
      resolutionImageUrl
    );
    console.log('Resolution result:', updated);
    if (updated) {
      setSubmissionsList(await fetchComplaints());
      triggerToast(`Complaint ${complaint?.trackingNumber || 'Record'} marked resolved with proof!`);
    } else {
      triggerToast('Failed to resolve complaint. Please check console.');
    }
  };

  // Image select handler
  const handleImageSelect = (file: File | null, previewUrl: string | null) => {
    setImageFile(file);
    setImagePreview(previewUrl);
  };

  // Quick fill sample issue
  const handleSelectSample = (sample: string) => {
    setDescription(sample);
    triggerToast('Sample description applied! Try Auto-Triage.');
  };

  // AI Triage auto-applies category & priority
  const handleApplyTriage = (triagedCategory: string, triagedPriority: PriorityLevel) => {
    setCategory(triagedCategory);
    setPriority(triagedPriority);
    triggerToast(`AI set category to "${triagedCategory}" and priority to "${triagedPriority}"`);
  };

  // Submit Complaint
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      triggerToast('Please write a brief description of the issue');
      return;
    }

    if (category === 'Other' && !customCategoryDetail.trim()) {
      triggerToast('Please specify the issue category for "Other"');
      return;
    }

    if (!location.address.trim()) {
      triggerToast('Please select or verify the location');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      const firstDup = detectedDuplicates[0];
      const submission = await handleUpload(
        imageFile,
        {
          category,
          customCategoryDetail: category === 'Other' ? (customCategoryDetail?.trim() || '') : '',
          description: description.trim(),
          priority,
          location: {
            ...location,
          },
          citizenName: isAnonymous ? 'Anonymous Citizen' : currentUser?.name || 'Citizen',
          citizenContact: currentUser?.email,
          citizenEmail: isAnonymous ? undefined : currentUser?.email,
          isAnonymous,
          potentialDuplicateOf:
            acknowledgedDuplicate ||
            (firstDup ? firstDup.existingComplaint.trackingNumber : undefined),
          duplicateDistanceMeters: firstDup ? firstDup.distanceMeters : undefined,
        },
        (pct) => setUploadProgress(pct)
      );

      setSubmittedData(submission);
      setSubmissionsList(await fetchComplaints());
      triggerToast(`Complaint ${submission.trackingNumber} successfully logged!`);
    } catch (err: any) {
      console.error('Submission failed:', err);
      triggerToast(`Submission error: ${err?.message || 'Please try again'}`);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleResetForNewComplaint = () => {
    setImageFile(null);
    setImagePreview(null);
    setCategory('Potholes & Road Damage');
    setCustomCategoryDetail('');
    setDescription('');
    setPriority('Medium');
    setSubmittedData(null);
    setLocation({
      address: '',
      country: 'Pakistan',
      province: '',
      city: '',
      streetAddress: '',
      lat: 0,
      lng: 0,
    });
    setAcknowledgedDuplicate(null);
    setDismissDuplicates(false);
    setCurrentTab('new_complaint');
  };

  // Filter complaints for citizen "My Complaints"
  const citizenComplaints = submissionsList.filter((c) => {
    if (!currentUser) return true;
    return (
      (c.citizenEmail && c.citizenEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
      c.citizenName === currentUser.name
    );
  });

  const isConfigured = isFirebaseConfigured();

  // ----------------------------------------------------
  // ROUTING VIEW 1: DEDICATED HOME / LANDING PAGE
  // ----------------------------------------------------
  if (viewMode === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => {
          setViewMode('login');
        }}
      />
    );
  }

  // ----------------------------------------------------
  // ROUTING VIEW 2: UNIFIED LOGIN SCREEN
  // ----------------------------------------------------
  if (viewMode === 'login' || !currentUser) {
    return (
      <AuthScreen
        onLogin={handleLogin}
        onBackToHome={() => setViewMode('landing')}
      />
    );
  }

  // ----------------------------------------------------
  // ROUTING VIEW 3: MAIN ROLE-BASED DASHBOARD
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#6B6A75] flex antialiased selection:bg-[#8DA399]/20 selection:text-[#3B3A45]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#4A4955] text-[#FDFBF7] text-xs font-medium px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <DoodleSparkle className="w-4 h-4 text-[#8DA399]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. CLEAN SIDEBAR NAVIGATION (Role-specific items) */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          setSubmittedData(null);
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        onMobileToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        complaintCounts={{
          total: submissionsList.length,
          pending: submissionsList.filter((c) => c.status === 'Received' || c.status === 'Under Review').length,
          forwarded: submissionsList.filter((c) => c.status === 'Forwarded').length,
        }}
      />

      {/* 2. MAIN APPLICATION CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#8DA399]/20 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger button for mobile */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-[#F4EFEB] hover:bg-[#EBF0ED] text-[#6B6A75]"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('landing')}
                  className="text-sm sm:text-base font-bold text-[#4A4955] tracking-tight hover:text-[#8DA399] transition-colors flex items-center gap-2"
                  title="Return to CivicSense Home"
                >
                  <DoodleCivicLogo className="w-5 h-5 text-[#8DA399]" />
                  <span>CivicSense</span>
                </button>
                <span
                  className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border
                    ${
                      currentUser.role === 'admin'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : currentUser.role === 'faculty'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-[#EBF0ED] text-[#6E867B] border-[#8DA399]/30'
                    }
                  `}
                >
                  {currentUser.role}
                </span>
              </div>
              <p className="text-[11px] text-[#9C9BA8] hidden sm:block">
                Active: {currentUser.name}
              </p>
            </div>
          </div>

          {/* Right Header Badges & Settings */}
          <div className="flex items-center gap-2">
            {/* Navigation Fix: 'New Complaint' option is ONLY visible to the 'Citizen' role */}
            {currentUser.role === 'citizen' && (
              <button
                type="button"
                onClick={() => setCurrentTab('new_complaint')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8DA399] hover:bg-[#7D9489] text-white text-xs font-semibold rounded-xl shadow-2xs hover:scale-102 transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>File Complaint</span>
              </button>
            )}

            {/* Link back to Home Landing Page */}
            <button
              type="button"
              onClick={() => setViewMode('landing')}
              className="p-2 rounded-xl bg-[#F4EFEB] hover:bg-[#EBF0ED] text-[#6B6A75] text-xs font-medium border border-[#8DA399]/20 flex items-center gap-1"
              title="View CivicSense Home Page"
            >
              <Home className="w-3.5 h-3.5 text-[#8DA399]" />
              <span className="hidden sm:inline">Home</span>
            </button>

            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="p-2 rounded-xl bg-[#F4EFEB] hover:bg-[#EBF0ED] text-[#6B6A75] text-xs font-medium border border-[#8DA399]/20"
              title="Firebase & Cloud Storage Settings"
            >
              <Settings className="w-3.5 h-3.5 text-[#8DA399]" />
            </button>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full space-y-6">
          {/* TAB 1: DASHBOARD VIEW */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Summary Stat Cards at the top of the dashboard */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#4A4955] uppercase tracking-wider">
                    Overview Analytics
                  </h3>
                  <span className="text-[11px] text-[#9C9BA8]">Real-time municipal registry</span>
                </div>

                <SummaryStatCards
                  complaints={submissionsList}
                  userRole={currentUser.role}
                  onFilterClick={() => setCurrentTab('complaints')}
                />
              </div>

              {/* Portal-Specific Welcome Banner */}
              <div className="rounded-[1.2rem] border border-[#8DA399]/25 bg-gradient-to-br from-white/90 via-[#FDFBF7] to-[#EBF0ED]/50 p-6 shadow-2xs relative overflow-hidden">
                <div className="absolute top-3 right-4 opacity-70 pointer-events-none">
                  <DoodleHouse className="w-16 h-16 text-[#8DA399]/30" />
                </div>

                <div className="max-w-lg space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF0ED] text-[11px] font-semibold text-[#6E867B] border border-[#8DA399]/20">
                    <DoodleHeart className="w-3.5 h-3.5 text-[#8DA399]" />
                    <span>Logged in as {currentUser.role.toUpperCase()}</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#4A4955]">
                    Welcome, {currentUser.name}
                  </h2>
                  <p className="text-xs text-[#6B6A75] leading-relaxed">
                    {currentUser.role === 'citizen' &&
                      'Report issues, upload evidence photos, pin exact map coordinates, and track repair dispatches.'}
                    {currentUser.role === 'admin' &&
                      'Review incoming citizen complaints in your review table, reject with mandatory notice, or forward to faculty with completion deadlines.'}
                    {currentUser.role === 'faculty' &&
                      'Access forwarded engineering and public works tasks, monitor completion deadlines, and mark issues resolved.'}
                  </p>

                  <div className="pt-2 flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => setCurrentTab('complaints')}
                      className="px-4 py-2 bg-[#8DA399] hover:bg-[#7D9489] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>
                        {currentUser.role === 'admin'
                          ? 'Open Review Table'
                          : currentUser.role === 'faculty'
                          ? 'View Forwarded Tasks'
                          : 'View My Complaints'}
                      </span>
                    </button>

                    {/* Navigation Fix: 'New Complaint' (Submit New Issue) is ONLY visible to Citizen */}
                    {currentUser.role === 'citizen' && (
                      <button
                        type="button"
                        onClick={() => setCurrentTab('new_complaint')}
                        className="px-4 py-2 bg-white hover:bg-[#F4EFEB] text-[#4A4955] border border-[#8DA399]/30 text-xs font-semibold rounded-xl shadow-2xs transition-all flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-[#8DA399]" />
                        <span>Submit New Issue</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#4A4955] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#8DA399]" />
                    <span>Recent Municipal Activity</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCurrentTab('complaints')}
                    className="text-xs text-[#8DA399] font-semibold hover:underline"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {submissionsList.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setCurrentTab('complaints')}
                      className="p-3.5 rounded-[1rem] bg-white/80 border border-[#8DA399]/20 hover:border-[#8DA399]/50 transition-all flex items-center justify-between gap-3 shadow-2xs cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#EBF0ED] text-[#8DA399] flex items-center justify-center font-mono text-xs font-bold shrink-0">
                          {item.trackingNumber.slice(-3)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#4A4955] truncate group-hover:text-[#8DA399] transition-colors">
                            {item.category}{' '}
                            {item.customCategoryDetail && `(${item.customCategoryDetail})`}
                          </p>
                          <p className="text-[11px] text-[#9C9BA8] truncate">
                            📍 {item.location.address} • Filed by {item.citizenName || 'Resident'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border
                            ${
                              item.status === 'Resolved'
                                ? 'bg-[#EBF0ED] text-[#4A725D] border-[#8DA399]/30'
                                : item.status === 'Forwarded'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : item.status === 'Rejected'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-[#FEF3C7] text-amber-800 border-amber-200'
                            }
                          `}
                        >
                          {item.status}
                        </span>
                        {item.forwardDeadline && (
                          <p className="text-[10px] text-[#8DA399] font-mono mt-0.5">
                            Due: {item.forwardDeadline}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROLE-BASED COMPLAINTS PORTAL */}
          {currentTab === 'complaints' && (
            <div className="animate-in fade-in space-y-4">
              {/* ADMIN: Table-based complaint review panel */}
              {currentUser.role === 'admin' && (
                <AdminReviewPanel
                  complaints={submissionsList}
                  onReject={handleAdminReject}
                  onForward={handleAdminForward}
                />
              )}

              {/* FACULTY: Panel showing only forwarded complaints */}
              {currentUser.role === 'faculty' && (
                <FacultyReviewPanel
                  complaints={submissionsList}
                  onResolve={handleFacultyResolve}
                />
              )}

              {/* CITIZEN: My Reports list */}
              {currentUser.role === 'citizen' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <div>
                      <h2 className="text-base font-bold text-[#4A4955]">
                        My Submitted Reports
                      </h2>
                      <p className="text-xs text-[#9C9BA8]">
                        Track live status, faculty assignments, and resolution notes for complaints filed under {currentUser.email}.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentTab('new_complaint')}
                      className="px-3.5 py-1.5 bg-[#8DA399] text-white text-xs font-semibold rounded-xl hover:bg-[#7D9489] transition-all flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>New Report</span>
                    </button>
                  </div>

                  <SubmissionsList
                    submissions={citizenComplaints.length > 0 ? citizenComplaints : submissionsList}
                    onNewComplaint={() => setCurrentTab('new_complaint')}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NEW COMPLAINT FORM (Only accessible to Citizen) */}
          {currentTab === 'new_complaint' && currentUser.role === 'citizen' && (
            <div className="w-full space-y-4 animate-in fade-in">
              {/* Submission Success State */}
              {submittedData ? (
                <div className="rounded-[1.2rem] border border-[#8DA399]/30 bg-white/90 p-6 text-center space-y-4 shadow-xs animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-full bg-[#EBF0ED] text-[#8DA399] flex items-center justify-center mx-auto shadow-inner">
                    <DoodleCheckCircle className="w-10 h-10 text-[#8DA399]" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-[#8DA399] bg-[#EBF0ED] px-2.5 py-1 rounded-full">
                      {submittedData.trackingNumber}
                    </span>
                    <h3 className="text-xl font-bold text-[#4A4955] pt-1">
                      Complaint Logged Successfully!
                    </h3>
                    <p className="text-xs text-[#6B6A75] max-w-sm mx-auto leading-relaxed">
                      Your report has been queued for administrative review. You can monitor its dispatch progress in your portal.
                    </p>
                  </div>

                  {/* Summary Card */}
                  <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#8DA399]/25 text-left text-xs space-y-2 max-w-md mx-auto">
                    <div className="flex justify-between items-center pb-2 border-b border-[#8DA399]/20">
                      <span className="font-semibold text-[#4A4955]">
                        {submittedData.category}
                        {submittedData.customCategoryDetail && ` (${submittedData.customCategoryDetail})`}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF0ED] text-[#6E867B]">
                        Priority: {submittedData.priority}
                      </span>
                    </div>
                    <p className="text-[#6B6A75] italic">"{submittedData.description}"</p>
                    <p className="text-[#9C9BA8] text-[11px]">📍 {submittedData.location.address}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentTab('complaints')}
                      className="px-4 py-2.5 rounded-xl border border-[#8DA399]/40 bg-white text-xs font-semibold text-[#4A4955] hover:bg-[#F4EFEB] transition-colors"
                    >
                      View in My Reports
                    </button>
                    <button
                      type="button"
                      onClick={handleResetForNewComplaint}
                      className="px-5 py-2.5 rounded-xl bg-[#8DA399] hover:bg-[#7D9489] text-white text-xs font-semibold shadow-xs transition-all hover:scale-102"
                    >
                      File Another Complaint
                    </button>
                  </div>
                </div>
              ) : (
                /* Complaint Form */
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6 rounded-[1.2rem] border border-[#8DA399]/25 bg-white/80 backdrop-blur-xs p-5 sm:p-7 shadow-xs"
                >
                  <div className="border-b border-[#8DA399]/20 pb-3">
                    <h2 className="text-lg font-bold text-[#4A4955]">
                      Smart Complaint Assistant
                    </h2>
                    <p className="text-xs text-[#9C9BA8]">
                      Report hazards, road damage, outages, or sanitation issues directly to city dispatch.
                    </p>
                  </div>

                  {/* 1. DESCRIPTION & AI AUTO-TRIAGE */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="issue-description"
                        className="text-sm font-semibold text-[#4A4955] flex items-center gap-1.5"
                      >
                        <span>Describe the Civic Issue</span>
                        <span className="text-xs text-rose-500 font-bold">*</span>
                      </label>
                      <span className="text-xs text-[#9C9BA8]">
                        {description.length} / 500
                      </span>
                    </div>

                    <textarea
                      id="issue-description"
                      rows={3}
                      maxLength={500}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="e.g. Deep pothole right on the north crosswalk, causing cars to swerve..."
                      className="w-full p-3.5 bg-white/90 border border-[#8DA399]/30 rounded-[1rem] text-sm text-[#4A4955] placeholder:text-[#9C9BA8] focus:outline-none focus:ring-2 focus:ring-[#8DA399]/40 focus:border-[#8DA399] transition-all resize-none"
                    />

                    {/* Quick sample chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[11px] text-[#9C9BA8]">Quick examples:</span>
                      {SAMPLE_ISSUES.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectSample(sample)}
                          disabled={isSubmitting}
                          className="text-[11px] text-[#6E867B] bg-[#EBF0ED] hover:bg-[#8DA399]/25 px-2.5 py-0.5 rounded-full border border-[#8DA399]/20 transition-colors truncate max-w-[200px]"
                          title={sample}
                        >
                          {sample}
                        </button>
                      ))}
                    </div>

                    {/* AI Triaging Widget Component */}
                    <AITriageWidget
                      description={description}
                      imagePreview={imagePreview}
                      currentCategory={category}
                      currentPriority={priority}
                      onApplyTriage={handleApplyTriage}
                      disabled={isSubmitting}
                    />

                    {/* Automated Duplicate Detection Banner */}
                    <DuplicateAlertBanner
                      duplicates={detectedDuplicates}
                      onAcknowledgeDuplicate={(dupCode) => setAcknowledgedDuplicate(dupCode)}
                      onDismiss={() => setDismissDuplicates(true)}
                    />
                  </div>

                  {/* 2. CATEGORY PICKER (Includes 'Other' + conditional text input) */}
                  <CategoryPicker
                    selectedCategory={category}
                    onSelectCategory={(cat) => setCategory(cat)}
                    customCategoryDetail={customCategoryDetail}
                    onChangeCustomCategory={(detail) => setCustomCategoryDetail(detail)}
                    disabled={isSubmitting}
                  />

                  {/* 3. PRIORITY LEVEL */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#4A4955] flex items-center gap-1.5">
                      <span>Safety Urgency / Priority</span>
                    </label>

                    <div className="grid grid-cols-3 gap-2.5">
                      {(['Low', 'Medium', 'High'] as PriorityLevel[]).map((p) => {
                        const isSelected = priority === p;
                        const badgeStyles = {
                          Low: isSelected
                            ? 'bg-[#EBF0ED] border-[#8DA399] text-[#4A725D] ring-1 ring-[#8DA399]/40'
                            : 'bg-white/80 border-[#8DA399]/20 text-[#6B6A75] hover:bg-[#FDFBF7]',
                          Medium: isSelected
                            ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#92400E] ring-1 ring-[#F59E0B]/40'
                            : 'bg-white/80 border-[#8DA399]/20 text-[#6B6A75] hover:bg-[#FDFBF7]',
                          High: isSelected
                            ? 'bg-[#FEE2E2] border-[#EF4444] text-[#991B1B] ring-1 ring-[#EF4444]/40'
                            : 'bg-white/80 border-[#8DA399]/20 text-[#6B6A75] hover:bg-[#FDFBF7]',
                        };

                        return (
                          <button
                            key={p}
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => setPriority(p)}
                            className={`py-2 px-3 rounded-[1rem] border text-xs font-semibold text-center transition-all duration-200
                              ${badgeStyles[p]}
                            `}
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              {p === 'High' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                              {p === 'Medium' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                              {p === 'Low' && <CheckCircle2 className="w-3.5 h-3.5 text-[#8DA399]" />}
                              <span>{p} Priority</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. EVIDENCE PHOTO UPLOAD */}
                  <FileUpload
                    imageFile={imageFile}
                    imagePreview={imagePreview}
                    onImageSelect={handleImageSelect}
                    disabled={isSubmitting}
                  />

                  {/* 5. LOCATION PICKER */}
                  <LocationPicker
                    location={location}
                    onChange={(loc) => setLocation(loc)}
                    disabled={isSubmitting}
                  />

                  {/* 6. CITIZEN NOTIFICATION & ANONYMITY */}
                  <div className="pt-2 border-t border-[#8DA399]/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#4A4955] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#8DA399]" />
                        <span>Citizen Notification</span>
                      </span>
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[#6B6A75]">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="rounded text-[#8DA399] focus:ring-[#8DA399] accent-[#8DA399]"
                        />
                        <span>Submit Anonymously</span>
                      </label>
                    </div>

                    {!isAnonymous && (
                      <div className="p-3 rounded-xl bg-[#F4EFEB] border border-[#8DA399]/20 flex items-center justify-between text-xs">
                        <div className="truncate">
                          <span className="font-semibold text-[#4A4955]">{currentUser.name}</span>
                          <span className="text-[#9C9BA8] ml-1.5">({currentUser.email})</span>
                        </div>
                        <span className="text-[10px] text-[#8DA399] font-medium shrink-0">
                          Account Linked
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Upload Progress Bar */}
                  {isSubmitting && (
                    <div className="space-y-1 animate-in fade-in">
                      <div className="flex justify-between text-xs text-[#6E867B] font-medium">
                        <span>Submitting your report...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#EBF0ED] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#8DA399] rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 7. SUBMIT BUTTON WITH TACTILE HOVER */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-3.5 px-6 rounded-[1rem] text-sm font-semibold text-white shadow-md
                        transition-all duration-300 transform
                        flex items-center justify-center gap-2.5
                        ${
                          isSubmitting
                            ? 'bg-[#A3B8AF] cursor-wait'
                            : 'bg-[#8DA399] hover:bg-[#7A9187] hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                        }
                      `}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <DoodlePaperPlane className="w-5 h-5 text-white" color="#FFFFFF" />
                          <span>Submit Civic Complaint</span>
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-[#9C9BA8] text-center mt-2.5">
                      Submissions are logged into the central city database and assigned tracking numbers.
                    </p>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: PROFILE VIEW */}
          {currentTab === 'profile' && (
            <ProfileView
              currentUser={currentUser}
              onLogout={handleLogout}
              onSwitchUser={handleSwitchUser}
              userComplaints={citizenComplaints}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="py-4 border-t border-[#8DA399]/20 text-center text-xs text-[#9C9BA8] bg-[#FDFBF7] mt-auto">
          <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <DoodleHouse className="w-4 h-4 text-[#8DA399]" />
              <span>CivicSense • Smart Civic Complaint & Resolution System</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <button
                type="button"
                onClick={() => setViewMode('landing')}
                className="hover:underline text-[#8DA399]"
              >
                CivicSense Home
              </button>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <button
                type="button"
                onClick={handleLogout}
                className="hover:underline text-rose-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Firebase Configuration Modal */}
      {showConfigModal && (
        <div
          onClick={() => setShowConfigModal(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FDFBF7] rounded-[1.2rem] border border-[#8DA399]/40 max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#8DA399]/20">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#8DA399]" />
                <h3 className="text-base font-bold text-[#4A4955]">
                  Firebase Integration Settings
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="w-7 h-7 rounded-full bg-[#EBF0ED] flex items-center justify-center text-[#6B6A75] hover:text-[#4A4955]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#6B6A75] leading-relaxed">
              <p>
                This form includes full, modular <strong>Firebase Storage</strong> and <strong>Cloud Firestore</strong> integration inside <code className="bg-[#EBF0ED] px-1.5 py-0.5 rounded text-[#4A4955]">src/lib/firebase.ts</code>.
              </p>

              <div className="p-3 rounded-xl bg-white border border-[#8DA399]/25 font-mono text-[11px] space-y-1">
                <p className="text-[#8DA399] font-semibold">// Configured in src/lib/firebase.ts:</p>
                <p>apiKey: "{firebaseConfig.apiKey.substring(0, 15)}..."</p>
                <p>projectId: "{firebaseConfig.projectId}"</p>
                <p>storageBucket: "{firebaseConfig.storageBucket}"</p>
              </div>

              <div className="p-3 rounded-xl bg-[#EBF0ED]/80 border border-[#8DA399]/20 text-[11px] space-y-1">
                <p className="font-semibold text-[#4A4955]">⚡ Zero-Setup Seamless Mode Active:</p>
                <p>
                  While placeholder credentials are in place, the application runs on local record persistence with pre-seeded test data for Admin and Faculty workflows.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 bg-[#8DA399] text-white rounded-xl text-xs font-semibold hover:bg-[#7D9489]"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
