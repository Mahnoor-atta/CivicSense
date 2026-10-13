import React from 'react';
import { UserAccount, ComplaintSubmission } from '../types/civic';
import {
  User,
  Shield,
  Wrench,
  Mail,
  Building,
  LogOut,
  Sparkles,
  CheckCircle,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  DoodleHouse,
  DoodleSprout,
  DoodleHeart,
  DoodleCheckCircle,
} from './Doodles';
import { TEST_USERS } from './AuthScreen';

interface ProfileViewProps {
  currentUser: UserAccount;
  onLogout: () => void;
  onSwitchUser: (user: UserAccount) => void;
  userComplaints: ComplaintSubmission[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onLogout,
  onSwitchUser,
  userComplaints,
}) => {
  const getRoleBadge = (role: UserAccount['role']) => {
    switch (role) {
      case 'admin':
        return {
          label: 'City Administrator',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          desc: 'Authoritative municipal control: triage, reject, or assign tasks to faculty with completion deadlines.',
          icon: Shield,
        };
      case 'faculty':
        return {
          label: 'Faculty',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          desc: 'Specialized maintenance & engineering: review assigned complaints and mark resolved.',
          icon: Wrench,
        };
      case 'citizen':
      default:
        return {
          label: 'Verified Citizen Resident',
          color: 'bg-[#EBF0ED] text-[#6E867B] border-[#8DA399]/30',
          desc: 'Civic pulse reporter: submit community complaints with AI triage, photos, and live tracking.',
          icon: User,
        };
    }
  };

  const roleMeta = getRoleBadge(currentUser.role);
  const IconComp = roleMeta.icon;

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in">
      {/* Profile Header Card */}
      <div className="rounded-[1.2rem] border border-[#8DA399]/25 bg-white/80 backdrop-blur-xs p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-[#EBF0ED] border border-[#8DA399]/30 text-[#8DA399] flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg font-bold text-[#4A4955]">{currentUser.name}</h2>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${roleMeta.color}`}
              >
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-[#9C9BA8] font-mono flex items-center justify-center sm:justify-start gap-1">
              <Mail className="w-3.5 h-3.5 text-[#8DA399]" />
              <span>{currentUser.email}</span>
            </p>
            {currentUser.department && (
              <p className="text-xs text-[#6B6A75] flex items-center justify-center sm:justify-start gap-1">
                <Building className="w-3.5 h-3.5 text-[#8DA399]" />
                <span>{currentUser.department}</span>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Role Permissions Description */}
        <div className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#8DA399]/20 text-xs text-[#6B6A75] flex items-start gap-2.5">
          <IconComp className="w-4 h-4 text-[#8DA399] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#4A4955]">{roleMeta.label}: </span>
            <span>{roleMeta.desc}</span>
          </div>
        </div>

        {/* User Activity Stats */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 rounded-xl bg-[#F4EFEB] border border-[#8DA399]/20 text-center">
            <p className="text-xl font-bold text-[#4A4955]">{userComplaints.length}</p>
            <p className="text-[10px] text-[#9C9BA8] uppercase font-semibold">Your Reports</p>
          </div>
          <div className="p-3 rounded-xl bg-[#EBF0ED] border border-[#8DA399]/20 text-center">
            <p className="text-xl font-bold text-[#4A725D]">
              {userComplaints.filter((c) => c.status === 'Resolved').length}
            </p>
            <p className="text-[10px] text-[#6E867B] uppercase font-semibold">Resolved</p>
          </div>
          <div className="p-3 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-center">
            <p className="text-xl font-bold text-amber-800">
              {
                userComplaints.filter(
                  (c) => c.status === 'Received' || c.status === 'Forwarded'
                ).length
              }
            </p>
            <p className="text-[10px] text-amber-800 uppercase font-semibold">Active</p>
          </div>
        </div>
      </div>

      {/* Switch Demo Account Card */}
      <div className="rounded-[1.2rem] border border-[#8DA399]/25 bg-white/80 p-5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#4A4955] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#8DA399]" />
            <span>Switch User Profile (Testing)</span>
          </h3>
          <span className="text-[10px] text-[#9C9BA8]">Instant Role Switch</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TEST_USERS.map((u, i) => {
            const isCurrent = u.email.toLowerCase() === currentUser.email.toLowerCase();

            return (
              <button
                key={i}
                type="button"
                disabled={isCurrent}
                onClick={() =>
                  onSwitchUser({
                    email: u.email,
                    name: u.name,
                    role: u.role,
                    department: u.dept,
                  })
                }
                className={`text-left p-3 rounded-xl border transition-all flex items-center justify-between
                  ${
                    isCurrent
                      ? 'bg-[#EBF0ED] border-[#8DA399] cursor-default'
                      : 'bg-[#FDFBF7] border-[#8DA399]/20 hover:border-[#8DA399]/50 hover:bg-white cursor-pointer'
                  }
                `}
              >
                <div>
                  <p className="text-xs font-semibold text-[#4A4955]">{u.name}</p>
                  <p className="text-[10px] text-[#9C9BA8] font-mono">{u.email}</p>
                  <span
                    className={`inline-block text-[9px] uppercase font-bold px-1.5 py-0.2 rounded mt-1
                      ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'faculty'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-[#EBF0ED] text-[#6E867B]'
                      }
                    `}
                  >
                    {u.role}
                  </span>
                </div>

                {isCurrent ? (
                  <span className="text-[11px] font-semibold text-[#6E867B]">Current</span>
                ) : (
                  <ArrowRight className="w-3.5 h-3.5 text-[#8DA399]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
