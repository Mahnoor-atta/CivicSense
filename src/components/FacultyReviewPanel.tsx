import React, { useState, useRef } from 'react';
import { ComplaintSubmission } from '../types/civic';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  FileCheck,
  Send,
  Eye,
  Info,
  X,
  Sparkles,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { DoodleCheckCircle, DoodleSprout, DoodleSparkle, DoodleCamera } from './Doodles';

interface FacultyReviewPanelProps {
  complaints: ComplaintSubmission[];
  onResolve: (complaintId: string, resolutionNote?: string, resolutionImageUrl?: string) => void;
}

export const FacultyReviewPanel: React.FC<FacultyReviewPanelProps> = ({
  complaints,
  onResolve,
}) => {
  const [activeTab, setActiveTab] = useState<'forwarded' | 'resolved'>('forwarded');
  const [resolvingComplaint, setResolvingComplaint] = useState<ComplaintSubmission | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolutionPhotoPreview, setResolutionPhotoPreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter to only forwarded complaints for the primary queue
  const forwardedComplaints = complaints.filter((c) => c.status === 'Forwarded');
  const resolvedComplaints = complaints.filter((c) => c.status === 'Resolved');

  const displayedComplaints =
    activeTab === 'forwarded' ? forwardedComplaints : resolvedComplaints;

  const handleOpenResolveModal = (c: ComplaintSubmission) => {
    setResolvingComplaint(c);
    setResolutionNote('');
    setResolutionPhotoPreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setResolutionPhotoPreview((uploadEvent.target?.result as string) || null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmResolve = () => {
    if (!resolvingComplaint) return;
    onResolve(
      resolvingComplaint.id,
      resolutionNote.trim() || undefined,
      resolutionPhotoPreview || undefined
    );
    setResolvingComplaint(null);
  };

  const getPriorityBadge = (p: ComplaintSubmission['priority']) => {
    switch (p) {
      case 'High':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low':
        return 'bg-[#EBF0ED] text-[#4A725D] border-[#8DA399]/30';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#4A4955] flex items-center gap-2">
            <span>Faculty Municipal Dispatch Queue</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {forwardedComplaints.length} Active Forwarded
            </span>
          </h2>
          <p className="text-xs text-[#9C9BA8]">
            Complaints forwarded by administrators for engineering, sanitation, and electrical crew resolution.
          </p>
        </div>

        {/* View Switcher */}
        <div className="p-1 bg-[#F4EFEB] rounded-xl border border-[#8DA399]/20 inline-flex items-center gap-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('forwarded')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
              ${
                activeTab === 'forwarded'
                  ? 'bg-white text-[#4A4955] shadow-xs'
                  : 'text-[#6B6A75] hover:text-[#4A4955]'
              }
            `}
          >
            Forwarded ({forwardedComplaints.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('resolved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
              ${
                activeTab === 'resolved'
                  ? 'bg-white text-[#4A4955] shadow-xs'
                  : 'text-[#6B6A75] hover:text-[#4A4955]'
              }
            `}
          >
            Resolved History ({resolvedComplaints.length})
          </button>
        </div>
      </div>

      {/* Main Complaints List */}
      {displayedComplaints.length === 0 ? (
        <div className="text-center py-12 px-4 space-y-3 rounded-[1.2rem] border border-[#8DA399]/25 bg-white/70">
          <div className="w-14 h-14 rounded-2xl bg-[#EBF0ED] text-[#8DA399] flex items-center justify-center mx-auto">
            <DoodleCheckCircle className="w-8 h-8 text-[#8DA399]" />
          </div>
          <h3 className="text-sm font-semibold text-[#4A4955]">
            {activeTab === 'forwarded'
              ? 'No Forwarded Complaints in Queue'
              : 'No Resolved Complaints Yet'}
          </h3>
          <p className="text-xs text-[#9C9BA8] max-w-xs mx-auto">
            {activeTab === 'forwarded'
              ? 'All municipal complaints have been attended to or are awaiting admin dispatch.'
              : 'Resolved complaints will appear here once faculty crews mark tasks complete.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedComplaints.map((c) => {
            const formattedDate = new Date(c.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={c.id}
                className="rounded-[1.2rem] border border-[#8DA399]/25 bg-white/80 p-4.5 space-y-3 shadow-2xs hover:border-[#8DA399]/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#8DA399] bg-[#EBF0ED] px-2 py-0.5 rounded-md">
                        {c.trackingNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                          c.priority
                        )}`}
                      >
                        {c.priority}
                      </span>
                    </div>

                    {c.forwardDeadline && (
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-blue-600" />
                        <span>Deadline: {c.forwardDeadline}</span>
                      </span>
                    )}
                  </div>

                  {/* Category & Title */}
                  <div>
                    <h3 className="text-sm font-bold text-[#4A4955]">{c.category}</h3>
                    {c.customCategoryDetail && (
                      <p className="text-xs font-medium text-[#8DA399] mt-0.5">
                        ↳ {c.customCategoryDetail}
                      </p>
                    )}
                  </div>

                  {/* Citizen Description */}
                  <p className="text-xs text-[#6B6A75] leading-relaxed bg-[#FDFBF7] p-2.5 rounded-xl border border-[#8DA399]/15">
                    "{c.description}"
                  </p>

                  {/* Admin Notes if forwarded */}
                  {c.adminNotes && (
                    <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px] text-amber-800">
                      <strong>Admin Dispatch Note:</strong> {c.adminNotes}
                    </div>
                  )}

                  {/* Before & After Photo Proof for Resolved Items */}
                  {c.status === 'Resolved' && (c.imageUrl || c.resolutionImageUrl) ? (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-[#4A4955] block">
                        Visual Evidence & Resolution Proof:
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {c.imageUrl && (
                          <div
                            onClick={() => setSelectedImage(c.imageUrl || null)}
                            className="relative h-24 rounded-xl overflow-hidden border border-[#8DA399]/20 bg-[#F4EFEB] cursor-pointer group"
                          >
                            <img
                              src={c.imageUrl}
                              alt="Before"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                              Before (Reported)
                            </span>
                          </div>
                        )}
                        {c.resolutionImageUrl && (
                          <div
                            onClick={() => setSelectedImage(c.resolutionImageUrl || null)}
                            className="relative h-24 rounded-xl overflow-hidden border border-[#4A725D]/30 bg-[#EBF0ED] cursor-pointer group"
                          >
                            <img
                              src={c.resolutionImageUrl}
                              alt="After"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <span className="absolute bottom-1 left-1 bg-[#4A725D] text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                              ✓ After (Resolution Proof)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    c.imageUrl && (
                      <div
                        onClick={() => setSelectedImage(c.imageUrl || null)}
                        className="relative h-28 rounded-xl overflow-hidden border border-[#8DA399]/20 bg-[#F4EFEB] cursor-pointer group"
                      >
                        <img
                          src={c.imageUrl}
                          alt="Evidence"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1">
                          <Eye className="w-4 h-4" />
                          <span>View Evidence Photo</span>
                        </div>
                      </div>
                    )
                  )}

                  {/* Location */}
                  <div className="text-[11px] text-[#6B6A75] flex items-center gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#8DA399] shrink-0" />
                    <span className="truncate">{c.location.address}</span>
                  </div>

                  {c.resolutionNote && (
                    <div className="p-2 rounded-lg bg-[#EBF0ED] border border-[#8DA399]/30 text-[#4A725D] text-[11px]">
                      <strong>Resolution Note:</strong> {c.resolutionNote}
                    </div>
                  )}
                </div>

                {/* Action Row */}
                <div className="pt-2 border-t border-[#8DA399]/15 flex items-center justify-between">
                  <span className="text-[10px] text-[#9C9BA8]">
                    Filed {formattedDate}
                  </span>

                  {c.status === 'Forwarded' ? (
                    <button
                      type="button"
                      onClick={() => handleOpenResolveModal(c)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#8DA399] hover:bg-[#7D9489] text-white text-xs font-semibold shadow-2xs hover:scale-105 transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#4A725D]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#8DA399]" />
                      <span>Completed</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RESOLUTION MODAL WITH OPTIONAL NOTE & RESOLUTION EVIDENCE PHOTO */}
      {resolvingComplaint && (
        <div
          onClick={() => setResolvingComplaint(null)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FDFBF7] rounded-[1.2rem] border border-[#8DA399]/40 max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#8DA399]/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#8DA399]" />
                <h3 className="text-base font-bold text-[#4A4955]">
                  Mark Complaint Resolved
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setResolvingComplaint(null)}
                className="w-7 h-7 rounded-full bg-[#EBF0ED] flex items-center justify-center text-[#6B6A75]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-white/80 rounded-xl border border-[#8DA399]/20 text-xs space-y-1">
              <span className="font-mono font-bold text-[#8DA399]">
                {resolvingComplaint.trackingNumber}
              </span>
              <p className="font-semibold text-[#4A4955]">{resolvingComplaint.category}</p>
              <p className="text-[11px] text-[#9C9BA8] truncate">
                📍 {resolvingComplaint.location.address}
              </p>
            </div>

            {/* Optional Resolution Note */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#4A4955]">
                  Resolution Note (Optional)
                </label>
                <span className="text-[10px] text-[#8DA399]">Visible to citizen</span>
              </div>
              <textarea
                rows={3}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="e.g. Asphalt repair crew filled and sealed the crater. Repaved surface verified and cleared for vehicle traffic."
                className="w-full px-3.5 py-2.5 bg-white border border-[#8DA399]/30 rounded-xl text-xs text-[#4A4955] placeholder:text-[#9C9BA8] focus:outline-none focus:ring-2 focus:ring-[#8DA399]/40 resize-none"
              />
            </div>

            {/* Resolution Photo Proof Upload */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#4A4955] flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#8DA399]" />
                  <span>Attach Resolution Photo Proof (Recommended)</span>
                </label>
                <span className="text-[10px] text-[#8DA399] bg-[#EBF0ED] px-2 py-0.5 rounded-full">
                  Verified Fix
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              {!resolutionPhotoPreview ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 border border-dashed border-[#8DA399]/40 hover:border-[#8DA399] rounded-xl bg-white/70 hover:bg-[#8DA399]/5 text-xs text-[#6B6A75] font-medium flex items-center justify-center gap-2 transition-all"
                >
                  <Camera className="w-4 h-4 text-[#8DA399]" />
                  <span>Take or Upload Completion Photo</span>
                </button>
              ) : (
                <div className="relative rounded-xl border border-[#8DA399]/30 bg-white p-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={resolutionPhotoPreview}
                      alt="Resolution preview"
                      className="w-14 h-14 rounded-lg object-cover border border-[#8DA399]/20"
                    />
                    <div>
                      <p className="text-xs font-semibold text-[#4A4955]">Resolution Photo Attached</p>
                      <p className="text-[10px] text-[#8DA399]">✓ Ready to verify repair completion</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResolutionPhotoPreview(null)}
                    className="p-1 rounded-full bg-[#F4EFEB] hover:bg-rose-50 text-[#6B6A75] hover:text-rose-600"
                    title="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setResolvingComplaint(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#6B6A75] hover:bg-[#F4EFEB]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResolve}
                className="px-4 py-2 bg-[#8DA399] hover:bg-[#7D9489] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Resolution</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FDFBF7] rounded-[1rem] p-3 max-w-lg w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-[#4A4955]">Attached Photographic Evidence</span>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="p-1 rounded-lg bg-[#EBF0ED] text-[#6B6A75]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-lg overflow-hidden max-h-[70vh]">
              <img
                src={selectedImage}
                alt="Enlarged evidence"
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
