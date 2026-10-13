import React, { useState } from 'react';
import { ComplaintSubmission, PriorityLevel, ComplaintStatus } from '../types/civic';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Eye,
  AlertTriangle,
  Calendar,
  User,
  MapPin,
  ChevronRight,
  ShieldAlert,
  Info,
  X,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import {
  DoodleCheckCircle,
  DoodleSparkle,
  DoodleHouse,
  DoodleSprout,
  DoodleMapPin,
} from './Doodles';

interface AdminReviewPanelProps {
  complaints: ComplaintSubmission[];
  onReject: (complaintId: string, rejectionNote: string) => void;
  onForward: (
    complaintId: string,
    deadline: string,
    facultyAssignee?: string,
    adminNotes?: string
  ) => void;
}

const FACULTY_LIST = [
  'Bureau of Street Lighting & Electrical Faculty',
  'Dept. of Transportation & Paving Faculty',
  'Sanitation & Solid Waste Management Faculty',
  'Municipal Water & Stormwater Authority Faculty',
  'Parks, Recreation & Urban Forestry Faculty',
  'General Municipal Maintenance Faculty',
];

export const AdminReviewPanel: React.FC<AdminReviewPanelProps> = ({
  complaints,
  onReject,
  onForward,
}) => {
  const [search, setSearch] = useState('');
  // Default to 'pending': Only complaints that need review/forward/reject show up!
  // Once forwarded, they are removed from the active pending queue.
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintSubmission | null>(null);

  // Modal Review Form state:
  // 'view' = shows decision buttons
  // 'forward' = hides top buttons, shows ONLY forward form
  // 'reject' = hides top buttons, shows ONLY reject form
  const [reviewMode, setReviewMode] = useState<'view' | 'reject' | 'forward'>('view');
  const [rejectionNote, setRejectionNote] = useState('');
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  // Forward form state
  const [forwardDeadline, setForwardDeadline] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [facultyAssignee, setFacultyAssignee] = useState<string>(FACULTY_LIST[0]);
  const [adminNotes, setAdminNotes] = useState('');
  const [deadlineError, setDeadlineError] = useState<string | null>(null);

  // Counts for each filter tab
  const pendingCount = complaints.filter(
    (c) => c.status === 'Received' || c.status === 'Under Review'
  ).length;
  const forwardedCount = complaints.filter((c) => c.status === 'Forwarded').length;
  const rejectedCount = complaints.filter((c) => c.status === 'Rejected').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;
  const activeCount = complaints.filter((c) => c.status !== 'Resolved').length;

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      (c.customCategoryDetail &&
        c.customCategoryDetail.toLowerCase().includes(search.toLowerCase())) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.location.address.toLowerCase().includes(search.toLowerCase()) ||
      (c.citizenName && c.citizenName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
        statusFilter === 'pending'
        ? c.status === 'Received' || c.status === 'Under Review'
        : c.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesPriority =
      priorityFilter === 'all' ? true : c.priority.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const openReviewModal = (complaint: ComplaintSubmission) => {
    setSelectedComplaint(complaint);
    setReviewMode('view'); // Always start in clean view state with the two action options
    setRejectionNote('');
    setRejectionError(null);
    setDeadlineError(null);
    setAdminNotes('');

    // Pre-select relevant faculty based on category
    if (complaint.category.includes('Lighting')) {
      setFacultyAssignee(FACULTY_LIST[0]);
    } else if (complaint.category.includes('Potholes') || complaint.category.includes('Road')) {
      setFacultyAssignee(FACULTY_LIST[1]);
    } else if (complaint.category.includes('Waste')) {
      setFacultyAssignee(FACULTY_LIST[2]);
    } else if (complaint.category.includes('Water') || complaint.category.includes('Drainage')) {
      setFacultyAssignee(FACULTY_LIST[3]);
    } else if (complaint.category.includes('Parks')) {
      setFacultyAssignee(FACULTY_LIST[4]);
    } else {
      setFacultyAssignee(FACULTY_LIST[5]);
    }
  };

  const handleConfirmReject = () => {
    if (!rejectionNote.trim()) {
      setRejectionError('A rejection note is mandatory to inform the citizen.');
      return;
    }
    if (!selectedComplaint) return;
    onReject(selectedComplaint.id, rejectionNote.trim());
    setSelectedComplaint(null);
  };

  const handleConfirmForward = () => {
    if (!forwardDeadline) {
      setDeadlineError('Please specify a completion deadline for the faculty.');
      return;
    }
    if (!selectedComplaint) return;
    onForward(selectedComplaint.id, forwardDeadline, facultyAssignee, adminNotes.trim());
    setSelectedComplaint(null);
  };

  const setDeadlinePreset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setForwardDeadline(d.toISOString().split('T')[0]);
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'Received':
      case 'Under Review':
        return 'bg-[#FEF3C7] text-amber-800 border-amber-200';
      case 'Forwarded':
        return 'bg-[#DBEAFE] text-blue-800 border-blue-200';
      case 'Resolved':
        return 'bg-[#EBF0ED] text-[#4A725D] border-[#8DA399]/30';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  const getPriorityBadge = (p: PriorityLevel) => {
    switch (p) {
      case 'High':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low':
        return 'bg-[#EBF0ED] text-[#557265] border-[#C4D7CE]';
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#8DA399]/20">
        <div>
          <h2 className="text-base font-bold text-[#4A4955] flex items-center gap-2">
            <span>Admin Review Panel</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#EBF0ED] text-[#6E867B] font-mono">
              {statusFilter === 'pending'
                ? `${pendingCount} Pending Triage`
                : `${filteredComplaints.length} Records`}
            </span>
          </h2>
          <p className="text-xs text-[#2D2C35]">
            {statusFilter === 'pending'
              ? 'Showing complaints awaiting review. Once you forward or reject an issue, it is automatically removed from this queue.'
              : 'Review municipal citizen reports and dispatch to faculty.'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-[#8DA399] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tracking, citizen, address..."
            className="w-full pl-9 pr-3 py-2 bg-white/90 border border-[#8DA399]/30 rounded-xl text-xs text-[#4A4955] placeholder:text-[#2D2C35] focus:outline-none focus:ring-2 focus:ring-[#8DA399]/40"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-white/70 border border-[#8DA399]/20 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-semibold text-[#4A4955] pr-1">Queue:</span>
          {[
            {
              id: 'pending',
              label: 'Pending Review',
              count: pendingCount,
              highlight: pendingCount > 0,
            },
            { id: 'forwarded', label: 'Forwarded to Faculty', count: forwardedCount },
            { id: 'rejected', label: 'Rejected', count: rejectedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs flex items-center gap-1.5
                ${
                  statusFilter === tab.id
                    ? 'bg-[#8DA399] text-white shadow-2xs font-semibold'
                    : 'text-[#6B6A75] hover:bg-[#EBF0ED]'
                }
              `}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold
                  ${
                    statusFilter === tab.id
                      ? 'bg-white/25 text-white'
                      : tab.id === 'pending' && tab.count > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-[#F4EFEB] text-[#6B6A75]'
                  }
                `}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-[#4A4955]">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1 bg-[#FDFBF7] border border-[#8DA399]/25 rounded-lg text-xs text-[#4A4955] focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Helpful queue banner for admin */}
      {statusFilter === 'pending' && (
        <div className="p-2.5 rounded-xl bg-[#EBF0ED]/70 border border-[#8DA399]/30 text-xs text-[#4A4955] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8DA399] animate-pulse"></span>
            <span>
              <strong>Active Triage Queue:</strong> Only incoming complaints awaiting action are shown. Once forwarded or rejected, they automatically leave this queue.
            </span>
          </div>
          <span className="text-[11px] text-[#6E867B] font-semibold hidden sm:inline">
            {pendingCount} waiting
          </span>
        </div>
      )}

      {/* Complaints Table */}
      <div className="rounded-[1.2rem] border border-[#8DA399]/25 bg-white/80 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4EFEB] border-b border-[#8DA399]/20 text-[#4A4955] font-semibold">
              <tr>
                <th className="py-3 px-4">Tracking ID</th>
                <th className="py-3 px-4">Category & Details</th>
                <th className="py-3 px-4">Citizen</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8DA399]/15">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#9C9BA8]">
                    <div className="max-w-sm mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-full bg-[#EBF0ED] text-[#8DA399] flex items-center justify-center mx-auto">
                        <DoodleCheckCircle className="w-8 h-8 text-[#8DA399]" />
                      </div>
                      <p className="text-xs font-bold text-[#4A4955]">
                        {statusFilter === 'pending'
                          ? 'All Caught Up! No pending complaints.'
                          : 'No complaints match your active filter.'}
                      </p>
                      <p className="text-[11px] text-[#9C9BA8]">
                        {statusFilter === 'pending'
                          ? 'All submitted issues have already been forwarded to faculty or resolved.'
                          : 'Try changing your search query or switching tabs above.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => {
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-[#FDFBF7] transition-colors group cursor-pointer"
                      onClick={() => openReviewModal(c)}
                    >
                      {/* Tracking ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-[#8DA399]">{c.trackingNumber}</span>
                        {c.potentialDuplicateOf && (
                          <span className="block text-[9px] font-mono font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 mt-0.5">
                            ⚠️ Dup of #{c.potentialDuplicateOf}
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <p className="font-semibold text-[#4A4955] truncate">{c.category}</p>
                        {c.customCategoryDetail ? (
                          <p className="text-[11px] text-[#8DA399] truncate font-medium">
                            ↳ {c.customCategoryDetail}
                          </p>
                        ) : (
                          <p className="text-[11px] text-[#9C9BA8] truncate">{c.description}</p>
                        )}
                      </td>

                      {/* Citizen */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[#6B6A75]">
                        <p className="font-medium text-[#4A4955]">{c.citizenName || 'Anonymous'}</p>
                        <p className="text-[10px] text-[#9C9BA8]">{c.citizenEmail || 'No email'}</p>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                            c.priority
                          )}`}
                        >
                          {c.priority}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 max-w-[160px] truncate text-[#6B6A75]">
                        {c.location.address}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(
                            c.status
                          )}`}
                        >
                          {c.status}
                        </span>
                        {c.status === 'Forwarded' && c.forwardDeadline && (
                          <p className="text-[10px] text-[#8DA399] font-mono mt-0.5">
                            Due: {c.forwardDeadline}
                          </p>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {(c.status === 'Received' || c.status === 'Under Review') ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openReviewModal(c);
                            }}
                            className="px-3 py-1.5 bg-[#8DA399] hover:bg-[#7D9489] text-white rounded-xl text-xs font-semibold shadow-2xs hover:scale-105 transition-all inline-flex items-center gap-1"
                          >
                            <span>Review</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openReviewModal(c);
                            }}
                            className="px-3 py-1.5 bg-[#EBF0ED] hover:bg-[#D1DBD6] text-[#6B6A75] rounded-xl text-xs font-semibold shadow-2xs transition-all inline-flex items-center gap-1"
                          >
                            <span>View</span>
                            <Eye className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REVIEW MODAL */}
      {selectedComplaint && (
        <div
          onClick={() => setSelectedComplaint(null)}
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FDFBF7] rounded-[1.3rem] border border-[#8DA399]/40 max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#8DA399]/20">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#8DA399] bg-[#EBF0ED] px-2.5 py-0.5 rounded-full">
                    {selectedComplaint.trackingNumber}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(
                      selectedComplaint.status
                    )}`}
                  >
                    {selectedComplaint.status}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                      selectedComplaint.priority
                    )}`}
                  >
                    {selectedComplaint.priority} Priority
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#4A4955] mt-1">
                  {selectedComplaint.category}
                </h3>
                {selectedComplaint.customCategoryDetail && (
                  <p className="text-xs text-[#8DA399] font-medium">
                    Specified: {selectedComplaint.customCategoryDetail}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="w-8 h-8 rounded-full bg-[#EBF0ED] hover:bg-[#8DA399]/20 text-[#6B6A75] hover:text-[#4A4955] flex items-center justify-center transition-colors"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Complaint Overview Card */}
            <div className="p-3.5 rounded-xl bg-white/90 border border-[#8DA399]/20 space-y-2.5 text-xs shadow-2xs">
              <div>
                <span className="font-semibold text-[#4A4955]">Citizen Description:</span>
                <p className="text-[#6B6A75] italic mt-0.5 bg-[#FDFBF7] p-2.5 rounded-lg border border-[#8DA399]/15 leading-relaxed">
                  "{selectedComplaint.description}"
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#6B6A75]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#8DA399] shrink-0" />
                  <span className="truncate">{selectedComplaint.location.address}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#8DA399] shrink-0" />
                  <span>
                    {selectedComplaint.citizenName || 'Anonymous'} (
                    {selectedComplaint.citizenEmail || 'No email'})
                  </span>
                </div>
              </div>

              {/* Visual Evidence: Reported vs Resolution Proof */}
              {(selectedComplaint.imageUrl || selectedComplaint.resolutionImageUrl) && (
                <div className="pt-1 space-y-1.5">
                  <span className="font-semibold text-[#4A4955] block">Visual Proof & Evidence:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedComplaint.imageUrl && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-[#9C9BA8] font-medium">Incident Reported Photo:</span>
                        <div className="w-full h-28 rounded-xl overflow-hidden border border-[#8DA399]/25 bg-[#F4EFEB]">
                          <img
                            src={selectedComplaint.imageUrl}
                            alt="Incident Evidence"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    {selectedComplaint.resolutionImageUrl && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-[#4A725D] font-bold">✓ Official Resolution Proof:</span>
                        <div className="w-full h-28 rounded-xl overflow-hidden border border-[#4A725D]/30 bg-[#EBF0ED]">
                          <img
                            src={selectedComplaint.resolutionImageUrl}
                            alt="Resolution Proof"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* If previously rejected or resolved */}
              {selectedComplaint.rejectedReason && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                  <strong>Current Rejection Notice:</strong> {selectedComplaint.rejectedReason}
                </div>
              )}
              {selectedComplaint.resolutionNote && (
                <div className="p-2.5 rounded-lg bg-[#EBF0ED] border border-[#8DA399]/30 text-[#4A725D] text-[11px]">
                  <strong>Faculty Resolution Note:</strong> {selectedComplaint.resolutionNote}
                </div>
              )}
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* VIEW STATE 1: SELECTION BUTTONS (ONLY SHOWN WHEN reviewMode === 'view') */}
            {/* ----------------------------------------------------------------- */}
            {reviewMode === 'view' && (selectedComplaint.status === 'Received' || selectedComplaint.status === 'Under Review') && (
              <div className="space-y-2 pt-1 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#4A4955]">
                    Select Administrative Action:
                  </span>
                  <span className="text-[10px] text-[#9C9BA8]">
                    Choose to dispatch to faculty or reject report
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewMode('forward')}
                    className="py-3 px-3 rounded-xl text-xs font-bold bg-[#8DA399] hover:bg-[#7D9489] text-white flex items-center justify-center gap-2 shadow-xs hover:scale-102 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Forward to Faculty</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewMode('reject')}
                    className="py-3 px-3 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center gap-2 hover:scale-102 transition-all cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Complaint</span>
                  </button>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* VIEW STATE 2: DEDICATED FORWARD PANEL (UPPER BUTTONS REMOVED!) */}
            {/* ----------------------------------------------------------------- */}
            {reviewMode === 'forward' && (
              <div className="p-4 rounded-xl bg-[#EBF0ED]/80 border border-[#8DA399]/35 space-y-3.5 animate-in fade-in">
                {/* Header with back button */}
                <div className="flex items-center justify-between pb-2 border-b border-[#8DA399]/20">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#8DA399] text-white flex items-center justify-center text-xs">
                      <Send className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#4A4955]">
                        Dispatch Complaint to Faculty
                      </h4>
                      <p className="text-[10px] text-[#6E867B]">
                        Assign responsible team and set completion deadline
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setReviewMode('view')}
                    className="text-[11px] text-[#6E867B] hover:text-[#4A4955] font-semibold bg-white px-2.5 py-1 rounded-lg border border-[#8DA399]/25 transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Change Action</span>
                  </button>
                </div>

                {/* Faculty Assignee */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#4A4955] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#8DA399]" />
                    <span>Assign to Faculty Team</span>
                  </label>
                  <select
                    value={facultyAssignee}
                    onChange={(e) => setFacultyAssignee(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#8DA399]/35 rounded-xl text-xs text-[#4A4955] font-medium focus:outline-none focus:ring-2 focus:ring-[#8DA399]/40"
                  >
                    {FACULTY_LIST.map((f, i) => (
                      <option key={i} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Deadline Selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#4A4955] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#8DA399]" />
                      <span>Resolution Deadline</span>
                      <span className="text-xs text-rose-500 font-bold">*</span>
                    </label>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="text-[#9C9BA8]">Quick Presets:</span>
                      <button
                        type="button"
                        onClick={() => setDeadlinePreset(3)}
                        className="px-2 py-0.5 rounded bg-white text-[#8DA399] border border-[#8DA399]/30 hover:bg-[#8DA399] hover:text-white transition-colors font-medium"
                      >
                        +3d
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeadlinePreset(7)}
                        className="px-2 py-0.5 rounded bg-white text-[#8DA399] border border-[#8DA399]/30 hover:bg-[#8DA399] hover:text-white transition-colors font-medium"
                      >
                        +1w
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeadlinePreset(14)}
                        className="px-2 py-0.5 rounded bg-white text-[#8DA399] border border-[#8DA399]/30 hover:bg-[#8DA399] hover:text-white transition-colors font-medium"
                      >
                        +2w
                      </button>
                    </div>
                  </div>

                  <input
                    type="date"
                    required
                    value={forwardDeadline}
                    onChange={(e) => {
                      setForwardDeadline(e.target.value);
                      setDeadlineError(null);
                    }}
                    className="w-full px-3 py-2.5 bg-white border border-[#8DA399]/35 rounded-xl text-xs text-[#4A4955] font-medium focus:outline-none focus:ring-2 focus:ring-[#8DA399]/40"
                  />
                  {deadlineError && (
                    <p className="text-[11px] text-rose-500 font-medium">{deadlineError}</p>
                  )}
                </div>

                {/* Optional Admin Dispatch Note */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#4A4955]">
                    Administrative Notes for Faculty (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="e.g. Expedited priority due to school zone proximity or main road traffic..."
                    className="w-full px-3 py-2 bg-white border border-[#8DA399]/35 rounded-xl text-xs text-[#4A4955] focus:outline-none focus:ring-2 focus:ring-[#8DA399]/40 resize-none"
                  />
                </div>

                {/* Action buttons at bottom */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#8DA399]/20">
                  <button
                    type="button"
                    onClick={() => setReviewMode('view')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B6A75] hover:bg-white border border-transparent hover:border-[#8DA399]/20 transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmForward}
                    className="px-5 py-2.5 bg-[#8DA399] hover:bg-[#7D9489] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 hover:scale-102 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Forward to Faculty</span>
                  </button>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* VIEW STATE 3: DEDICATED REJECT PANEL (UPPER BUTTONS REMOVED!) */}
            {/* ----------------------------------------------------------------- */}
            {reviewMode === 'reject' && (
              <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 space-y-3.5 animate-in fade-in">
                {/* Header with back button */}
                <div className="flex items-center justify-between pb-2 border-b border-rose-200">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs">
                      <XCircle className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-rose-800">Reject Complaint</h4>
                      <p className="text-[10px] text-rose-600">
                        Citizen will be notified with mandatory reason
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setReviewMode('view')}
                    className="text-[11px] text-rose-700 hover:text-rose-900 font-semibold bg-white px-2.5 py-1 rounded-lg border border-rose-200 transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Change Action</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-rose-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Rejection Reason Notice</span>
                    <span className="text-xs text-rose-600 font-bold">* Mandatory</span>
                  </label>



                  <textarea
                    rows={3}
                    required
                    value={rejectionNote}
                    onChange={(e) => {
                      setRejectionNote(e.target.value);
                      setRejectionError(null);
                    }}
                    placeholder="Explain clearly to the citizen why this report is rejected (e.g. Duplicate issue already under repair, private property jurisdiction, insufficient location details)..."
                    className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs text-[#4A4955] focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
                  />
                  {rejectionError && (
                    <p className="text-[11px] text-rose-600 font-medium">{rejectionError}</p>
                  )}
                  <p className="text-[10px] text-[#9C9BA8] italic">
                    This note will be recorded permanently and displayed in the citizen's tracked reports.
                  </p>
                </div>

                {/* Action buttons at bottom */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-rose-200">
                  <button
                    type="button"
                    onClick={() => setReviewMode('view')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B6A75] hover:bg-white transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReject}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 hover:scale-102 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Confirm & Reject Complaint</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
