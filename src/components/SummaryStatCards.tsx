import React from 'react';
import { ComplaintSubmission } from '../types/civic';
import {
  DoodleCheckCircle,
  DoodleSparkle,
  DoodleSprout,
  DoodleHouse,
} from './Doodles';
import { Clock, CheckCircle2, AlertCircle, ArrowUpRight, FolderOpen, Send } from 'lucide-react';

interface SummaryStatCardsProps {
  complaints: ComplaintSubmission[];
  userRole?: 'citizen' | 'admin' | 'faculty';
  onFilterClick?: (status: string) => void;
}

export const SummaryStatCards: React.FC<SummaryStatCardsProps> = ({
  complaints,
  userRole,
  onFilterClick,
}) => {
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(
    (c) => c.status === 'Received' || c.status === 'Under Review'
  ).length;
  const forwardedCount = complaints.filter((c) => c.status === 'Forwarded').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;
  const rejectedCount = complaints.filter((c) => c.status === 'Rejected').length;

  const stats = [
    {
      title: 'Total Complaints',
      value: totalCount,
      subtitle: userRole === 'faculty' ? 'Assigned & History' : 'Logged into municipal registry',
      icon: FolderOpen,
      doodle: DoodleHouse,
      accentBg: 'bg-[#F4EFEB]',
      iconColor: 'text-[#6B6A75]',
      badgeColor: 'bg-[#EBF0ED] text-[#6E867B]',
      filterKey: 'all',
    },
    {
      title: 'Pending Review',
      value: pendingCount,
      subtitle: 'Awaiting administrative triage',
      icon: Clock,
      doodle: DoodleSparkle,
      accentBg: 'bg-[#FEF3C7]/60',
      iconColor: 'text-amber-700',
      badgeColor: 'bg-amber-100 text-amber-800',
      filterKey: 'pending',
    },
    {
      title: 'Forwarded to Faculty',
      value: forwardedCount,
      subtitle: 'Under active crew dispatch',
      icon: Send,
      doodle: DoodleSprout,
      accentBg: 'bg-[#DBEAFE]/60',
      iconColor: 'text-blue-700',
      badgeColor: 'bg-blue-100 text-blue-800',
      filterKey: 'forwarded',
    },
    {
      title: 'Resolved',
      value: resolvedCount,
      subtitle: 'Verified & repaired by city teams',
      icon: CheckCircle2,
      doodle: DoodleCheckCircle,
      accentBg: 'bg-[#EBF0ED]',
      iconColor: 'text-[#4A725D]',
      badgeColor: 'bg-[#EBF0ED] text-[#4A725D]',
      filterKey: 'resolved',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, idx) => {
        const DoodleComp = stat.doodle;
        const IconComp = stat.icon;

        return (
          <div
            key={idx}
            onClick={() => onFilterClick && onFilterClick(stat.filterKey)}
            className="group relative rounded-[1rem] border border-[#8DA399]/25 bg-white/75 backdrop-blur-xs p-4 sm:p-4.5 shadow-2xs hover:shadow-xs hover:border-[#8DA399]/60 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            {/* Top Row */}
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold text-[#4A4955] leading-tight line-clamp-1">
                {stat.title}
              </span>
              <div
                className={`w-8 h-8 rounded-xl ${stat.accentBg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}
              >
                <DoodleComp className="w-4.5 h-4.5" color="#8DA399" />
              </div>
            </div>

            {/* Metric Value */}
            <div className="my-2.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#4A4955] tracking-tight">
                {stat.value}
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${stat.badgeColor}`}
              >
                {totalCount > 0 ? `${Math.round((stat.value / totalCount) * 100)}%` : '0%'}
              </span>
            </div>

            {/* Bottom Subtitle */}
            <p className="text-[11px] text-[#9C9BA8] line-clamp-1 leading-snug">
              {stat.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
};
