import React from 'react';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  User,
  LogOut,
  Shield,
  Wrench,
  CheckCircle,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { UserAccount } from '../types/civic';
import {
  DoodleCivicLogo,
  DoodleHouse,
  DoodleHeart,
  DoodleSparkle,
} from './Doodles';

export type NavTab = 'dashboard' | 'complaints' | 'new_complaint' | 'profile';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentUser: UserAccount;
  onLogout: () => void;
  mobileOpen: boolean;
  onMobileToggle: () => void;
  complaintCounts: {
    total: number;
    pending: number;
    forwarded: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  onLogout,
  mobileOpen,
  onMobileToggle,
  complaintCounts,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'complaints',
      label:
        currentUser.role === 'admin'
          ? 'Review Panel'
          : currentUser.role === 'faculty'
          ? 'Forwarded Tasks'
          : 'My Complaints',
      icon: FileText,
      badge:
        currentUser.role === 'admin'
          ? complaintCounts.pending
          : currentUser.role === 'faculty'
          ? complaintCounts.forwarded
          : undefined,
    },
    // 'New Complaint' is ONLY visible to the 'Citizen' role as requested
    ...(currentUser.role === 'citizen'
      ? [
          {
            id: 'new_complaint' as NavTab,
            label: 'New Complaint',
            icon: PlusCircle,
          },
        ]
      : []),
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
    },
  ];

  const getRoleBadge = (role: UserAccount['role']) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Admin',
          bg: 'bg-purple-50 border-purple-200 text-purple-700',
        };
      case 'faculty':
        return {
          label: 'Faculty',
          bg: 'bg-blue-50 border-blue-200 text-blue-700',
        };
      case 'citizen':
      default:
        return {
          label: 'Citizen',
          bg: 'bg-[#EBF0ED] border-[#8DA399]/30 text-[#6E867B]',
        };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 bg-[#FDFBF7] border-r border-[#8DA399]/20 w-64 select-none">
      {/* Top Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EBF0ED] border border-[#8DA399]/30 flex items-center justify-center text-[#8DA399] shadow-xs shrink-0">
              <DoodleCivicLogo className="w-6 h-6 text-[#8DA399]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#4A4955] tracking-tight">
                CivicSense
              </h2>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onMobileToggle}
            className="md:hidden w-8 h-8 rounded-lg bg-[#F4EFEB] flex items-center justify-center text-[#6B6A75]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-3 rounded-2xl bg-white/80 border border-[#8DA399]/25 shadow-2xs space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EBF0ED] text-[#8DA399] flex items-center justify-center font-bold text-xs shrink-0 border border-[#8DA399]/20">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#4A4955] truncate">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-[#9C9BA8] truncate font-mono">
                {currentUser.email}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#8DA399]/15">
            <span
              className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${roleInfo.bg}`}
            >
              {roleInfo.label}
            </span>
            <span className="text-[10px] text-[#8DA399] font-medium flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-[#8DA399]" />
              Online
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const IconComp = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onTabChange(item.id);
                  if (mobileOpen) onMobileToggle();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[1rem] text-xs font-semibold transition-all duration-200
                  ${
                    isActive
                      ? 'bg-[#8DA399] text-white shadow-xs'
                      : 'text-[#6B6A75] hover:text-[#4A4955] hover:bg-[#EBF0ED]/60'
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <IconComp
                    className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#8DA399]'}`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.2 rounded-full font-bold
                      ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#FEF3C7] text-amber-800'
                      }
                    `}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer / Logout */}
      <div className="space-y-3 pt-4 border-t border-[#8DA399]/20">
        <div className="px-2 text-[11px] text-[#9C9BA8] flex items-center gap-1.5">
          <DoodleHeart className="w-3.5 h-3.5 text-[#8DA399]" />
          <span>Community Care & Dispatch</span>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-[1rem] text-xs font-semibold text-[#6B6A75] hover:text-rose-700 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>Switch Account / Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block shrink-0 sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={onMobileToggle}
          className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-64 h-full bg-[#FDFBF7] shadow-2xl animate-in slide-in-from-left duration-200"
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
