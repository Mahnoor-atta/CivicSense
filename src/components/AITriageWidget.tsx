import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { PriorityLevel, TriageResult } from '../types/civic';
import { DoodleSparkle } from './Doodles';
import { analyzeIssue } from '../lib/gemini';

interface AITriageWidgetProps {
  description: string;
  imagePreview: string | null;
  currentCategory: string;
  currentPriority: PriorityLevel;
  onApplyTriage: (category: string, priority: PriorityLevel) => void;
  disabled?: boolean;
}

export const AITriageWidget: React.FC<AITriageWidgetProps> = ({
  description,
  imagePreview,
  currentCategory,
  currentPriority,
  onApplyTriage,
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [applied, setApplied] = useState(false);

  const handleTriage = async () => {
    if (!description.trim() && !imagePreview) return;
    setLoading(true);
    setApplied(false);

    try {
      const triage = await analyzeIssue(description, imagePreview);
      setResult(triage);
      // Auto-apply or present to citizen
      onApplyTriage(triage.category, triage.priority);
      setApplied(true);
    } catch (err) {
      console.error('Triage error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadgeColor = (p: PriorityLevel) => {
    switch (p) {
      case 'High':
        return 'bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]';
      case 'Medium':
        return 'bg-[#FEF3C7] text-[#B45309] border-[#FCD34D]';
      case 'Low':
        return 'bg-[#EBF0ED] text-[#4A725D] border-[#C2D6CD]';
    }
  };

  const hasInput = Boolean(description.trim() || imagePreview);

  return (
    <div className="rounded-[1rem] border border-[#8DA399]/30 bg-gradient-to-br from-[#FDFBF7] to-[#EBF0ED]/50 p-3.5 space-y-3 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#8DA399]/20 flex items-center justify-center text-[#8DA399]">
            <DoodleSparkle className="w-4 h-4 text-[#8DA399]" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#4A4955] flex items-center gap-1.5">
              <span>Smart Complaint Assistant</span>
            </h4>
            <p className="text-[11px] text-[#555461]">
              Helps automatically categorize issues and prioritize based on safety.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTriage}
          disabled={disabled || loading || !hasInput}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5 shadow-xs
            ${
              loading
                ? 'bg-[#EBF0ED] text-[#8DA399] cursor-wait'
                : hasInput
                ? 'bg-[#8DA399] text-white hover:bg-[#7D9489] hover:scale-[1.02] cursor-pointer'
                : 'bg-[#F4EFEB] text-[#555461] cursor-not-allowed'
            }
          `}
        >
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing Issue...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Triage</span>
            </>
          )}
        </button>
      </div>

      {/* Result Display Banner */}
      {result && (
        <div className="p-3 bg-white/80 rounded-xl border border-[#8DA399]/25 text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#4A4955] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#8DA399]" />
              <span>Assessment:</span>
              <span className="text-[#3E4A44] underline decoration-[#8DA399]/50 underline-offset-2">
                {result.category}
              </span>
            </span>

            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadgeColor(
                result.priority
              )}`}
            >
              Priority: {result.priority}
            </span>
          </div>

          <p className="text-[11px] text-[#6B6A75] leading-relaxed bg-[#FDFBF7] p-2 rounded-lg border border-[#8DA399]/15">
            <strong className="text-[#4A4955] font-medium">Department:</strong> {result.department}
            <br />
            <span className="italic text-[#9C9BA8]">{result.reasoning}</span>
          </p>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#8DA399] font-medium">
              Applied automatically to your complaint form
            </span>
            <span className="text-[10px] text-[#9C9BA8]">
              You can adjust anytime below
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
