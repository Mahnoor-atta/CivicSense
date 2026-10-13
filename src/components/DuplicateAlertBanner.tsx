import React, { useState } from 'react';
import { DuplicateMatch } from '../types/civic';
import { AlertCircle, MapPin, Eye, Check, ChevronRight, X, Clock } from 'lucide-react';
import { DoodleMapPin, DoodleSparkle } from './Doodles';

interface DuplicateAlertBannerProps {
  duplicates: DuplicateMatch[];
  onAcknowledgeDuplicate?: (trackingNumber: string) => void;
  onDismiss?: () => void;
}

export const DuplicateAlertBanner: React.FC<DuplicateAlertBannerProps> = ({
  duplicates,
  onAcknowledgeDuplicate,
  onDismiss,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  if (duplicates.length === 0 || acknowledged) return null;

  const primaryMatch = duplicates[0];
  const { existingComplaint, distanceMeters, matchReason } = primaryMatch;

  return (
    <div className="rounded-[1rem] border border-amber-200/80 bg-amber-50/70 p-4 space-y-3 shadow-2xs animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-4 h-4 text-amber-700" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-amber-900">
                Potential Duplicate Report Detected
              </h4>
              <span className="text-[10px] font-mono font-bold bg-white text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded-full">
                {distanceMeters}m away
              </span>
            </div>
            <p className="text-[11px] text-amber-800/90 leading-relaxed">
              A similar issue was already reported nearby as{' '}
              <strong className="font-mono text-amber-950 font-bold">
                {existingComplaint.trackingNumber}
              </strong>{' '}
              ({existingComplaint.status}).
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-amber-700/60 hover:text-amber-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Existing Ticket Preview Snippet */}
      <div className="p-3 bg-white/90 rounded-xl border border-amber-200/60 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-[#8DA399]">
              {existingComplaint.trackingNumber}
            </span>
            <span className="text-[#9C9BA8]">•</span>
            <span className="font-semibold text-[#4A4955]">
              {existingComplaint.category}
            </span>
          </div>

          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border
              ${
                existingComplaint.status === 'Resolved'
                  ? 'bg-[#EBF0ED] text-[#4A725D] border-[#8DA399]/30'
                  : existingComplaint.status === 'Forwarded'
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : 'bg-amber-100 text-amber-800 border-amber-200'
              }
            `}
          >
            {existingComplaint.status}
          </span>
        </div>

        <p className="text-[11px] text-[#6B6A75] italic line-clamp-2">
          "{existingComplaint.description}"
        </p>

        <div className="flex items-center justify-between text-[10px] text-[#9C9BA8] pt-1 border-t border-amber-100">
          <div className="flex items-center gap-1 truncate max-w-[70%]">
            <MapPin className="w-3 h-3 text-[#8DA399] shrink-0" />
            <span className="truncate">{existingComplaint.location.address}</span>
          </div>
          <span>Match: {matchReason}</span>
        </div>
      </div>

      {/* Citizen Choice Actions */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <span className="text-[11px] text-amber-800/80">
          If this is the same issue, municipal crews are already aware!
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setAcknowledged(true);
              if (onAcknowledgeDuplicate) {
                onAcknowledgeDuplicate(existingComplaint.trackingNumber);
              }
            }}
            className="px-3 py-1 bg-white hover:bg-amber-100/60 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-semibold transition-all shadow-2xs"
          >
            Proceed Anyway
          </button>
        </div>
      </div>
    </div>
  );
};
