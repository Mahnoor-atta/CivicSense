import React, { useState } from 'react';
import { ComplaintSubmission, ComplaintStatus } from '../types/civic';
import {
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  FolderOpen,
  Calendar,
  XCircle,
  Send,
  Eye,
  Camera,
  X,
  AlertCircle,
} from 'lucide-react';
import { DoodleCheckCircle, DoodleHouse, DoodleSprout } from './Doodles';

interface SubmissionsListProps {
  submissions: ComplaintSubmission[];
  onSelectSubmission?: (item: ComplaintSubmission) => void;
  onNewComplaint: () => void;
}

export const SubmissionsList: React.FC<SubmissionsListProps> = ({
  submissions,
  onNewComplaint,
}) => {
  const [selectedEnlargedImage, setSelectedEnlargedImage] = useState<{
    url: string;
    label: string;
  } | null>(null);

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

  const getPriorityBadge = (priority: ComplaintSubmission['priority']) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low':
        return 'bg-[#EBF0ED] text-[#557265] border-[#C4D7CE]';
    }
  };

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12 px-4 space-y-4 rounded-[1rem] border border-[#8DA399]/25 bg-white/60">
        <div className="w-16 h-16 rounded-2xl bg-[#EBF0ED] text-[#8DA399] flex items-center justify-center mx-auto">
          <DoodleSprout className="w-8 h-8 text-[#8DA399]" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-[#4A4955]">
            No Civic Reports Submitted Yet
          </h3>
          <p className="text-xs text-[#9C9BA8] max-w-xs mx-auto">
            Your neighborhood submissions and live repair statuses will appear here once you file a complaint.
          </p>
        </div>
        <button
          type="button"
          onClick={onNewComplaint}
          className="px-4 py-2 bg-[#8DA399] text-white text-xs font-semibold rounded-xl hover:bg-[#7D9489] transition-all shadow-xs"
        >
          Submit First Complaint
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-sm font-semibold text-[#4A4955] flex items-center gap-1.5">
          <span>Tracked Submissions</span>
          <span className="text-xs font-normal text-[#8DA399] bg-[#EBF0ED] px-2 py-0.5 rounded-full">
            {submissions.length} reports
          </span>
        </h3>
        <button
          type="button"
          onClick={onNewComplaint}
          className="text-xs text-[#8DA399] font-medium hover:underline flex items-center gap-1"
        >
          + File Another
        </button>
      </div>

      <div className="space-y-2.5">
        {submissions.map((sub) => {
          const formattedDate = new Date(sub.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={sub.id}
              className="p-3.5 rounded-[1rem] bg-white/80 border border-[#8DA399]/25 shadow-xs hover:border-[#8DA399]/60 transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-[#8DA399]">
                      {sub.trackingNumber}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(
                        sub.status
                      )}`}
                    >
                      {sub.status}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.2 rounded-full border ${getPriorityBadge(
                        sub.priority
                      )}`}
                    >
                      {sub.priority}
                    </span>
                    {sub.potentialDuplicateOf && (
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        <span>Duplicate of #{sub.potentialDuplicateOf}</span>
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-[#4A4955] pt-0.5">
                    {sub.category}
                  </h4>
                  {sub.customCategoryDetail && (
                    <p className="text-[11px] text-[#8DA399] font-medium">
                      ↳ {sub.customCategoryDetail}
                    </p>
                  )}
                </div>

                {/* Single image thumbnail if not resolved */}
                {sub.imageUrl && !sub.resolutionImageUrl && (
                  <div
                    onClick={() =>
                      setSelectedEnlargedImage({
                        url: sub.imageUrl!,
                        label: 'Citizen Reported Incident Evidence',
                      })
                    }
                    className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-[#8DA399]/20 bg-[#F4EFEB] cursor-pointer group"
                    title="Click to view photo"
                  >
                    <img
                      src={sub.imageUrl}
                      alt={sub.category}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                )}
              </div>

              <p className="text-xs text-[#6B6A75] line-clamp-2 leading-relaxed bg-[#FDFBF7] p-2 rounded-lg border border-[#8DA399]/15">
                {sub.description}
              </p>

              {/* RESOLUTION EVIDENCE PHOTO & NOTES (Before & After) */}
              {sub.status === 'Resolved' && (sub.imageUrl || sub.resolutionImageUrl) && (
                <div className="p-2.5 rounded-xl bg-[#EBF0ED]/60 border border-[#8DA399]/25 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#4A4955]">
                    <span className="flex items-center gap-1.5 text-[#4A725D]">
                      <CheckCircle className="w-3.5 h-3.5 text-[#8DA399]" />
                      <span>Resolution Proof & Visual Verification</span>
                    </span>
                    {sub.resolvedAt && (
                      <span className="text-[10px] text-[#9C9BA8] font-normal">
                        Verified {new Date(sub.resolvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    {sub.imageUrl && (
                      <div
                        onClick={() =>
                          setSelectedEnlargedImage({
                            url: sub.imageUrl!,
                            label: 'Before: Reported Incident Photo',
                          })
                        }
                        className="relative h-20 rounded-lg overflow-hidden border border-[#8DA399]/20 bg-[#F4EFEB] cursor-pointer group"
                      >
                        <img
                          src={sub.imageUrl}
                          alt="Before"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.2 rounded">
                          Before (Reported)
                        </span>
                      </div>
                    )}
                    {sub.resolutionImageUrl && (
                      <div
                        onClick={() =>
                          setSelectedEnlargedImage({
                            url: sub.resolutionImageUrl!,
                            label: 'After: Official Faculty Resolution Evidence',
                          })
                        }
                        className="relative h-20 rounded-lg overflow-hidden border border-[#4A725D]/30 bg-[#EBF0ED] cursor-pointer group"
                      >
                        <img
                          src={sub.resolutionImageUrl}
                          alt="After"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-1 left-1 bg-[#4A725D] text-white text-[9px] px-1.5 py-0.2 rounded font-bold">
                          ✓ After (Resolved Proof)
                        </span>
                      </div>
                    )}
                  </div>

                  {sub.resolutionNote && (
                    <p className="text-[11px] text-[#4A725D] pt-1 leading-snug">
                      <strong>Faculty Note:</strong> {sub.resolutionNote}
                    </p>
                  )}
                </div>
              )}

              {/* Status details: Deadline or Rejection Note */}
              {sub.status === 'Forwarded' && sub.forwardDeadline && (
                <div className="text-[11px] text-blue-800 bg-blue-50/70 p-2 rounded-lg border border-blue-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Dispatched to Faculty ({sub.facultyAssignee || 'Public Works'})</span>
                  </span>
                  <span className="font-mono font-bold">Due: {sub.forwardDeadline}</span>
                </div>
              )}

              {sub.status === 'Rejected' && sub.rejectedReason && (
                <div className="text-[11px] text-rose-800 bg-rose-50/70 p-2 rounded-lg border border-rose-200">
                  <strong className="text-rose-700">Rejection Notice:</strong> {sub.rejectedReason}
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-[#9C9BA8] pt-1 border-t border-[#8DA399]/15">
                <div className="flex items-center gap-1 truncate max-w-[65%]">
                  <MapPin className="w-3.5 h-3.5 text-[#8DA399] shrink-0" />
                  <span className="truncate">{sub.location.address}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3 text-[#9C9BA8]" />
                  <span>{formattedDate}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enlarged Photo Lightbox Modal */}
      {selectedEnlargedImage && (
        <div
          onClick={() => setSelectedEnlargedImage(null)}
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FDFBF7] rounded-[1.2rem] p-4 max-w-lg w-full shadow-2xl space-y-3"
          >
            <div className="flex justify-between items-center pb-2 border-b border-[#8DA399]/20">
              <span className="text-xs font-bold text-[#4A4955]">
                {selectedEnlargedImage.label}
              </span>
              <button
                type="button"
                onClick={() => setSelectedEnlargedImage(null)}
                className="w-7 h-7 rounded-full bg-[#EBF0ED] flex items-center justify-center text-[#6B6A75]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-black/5 flex items-center justify-center max-h-[70vh]">
              <img
                src={selectedEnlargedImage.url}
                alt={selectedEnlargedImage.label}
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
