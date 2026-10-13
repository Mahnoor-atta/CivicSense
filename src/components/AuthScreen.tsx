import React, { useState } from 'react';
import { UserRole, UserAccount } from '../types/civic';
import {
  DoodleHouse,
  DoodleCivicLogo,
  DoodleSparkle,
  DoodleSquiggleUnderline,
} from './Doodles';
import { Lock, Mail, UserCheck, ShieldCheck, Wrench, ArrowRight, Sparkles, ArrowLeft } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: UserAccount) => void;
  onBackToHome?: () => void;
}

export const TEST_USERS: { email: string; pass: string; name: string; role: UserRole; dept?: string }[] = [
  {
    email: 'noor@gmail.com',
    pass: 'civic123',
    name: 'Noor (Citizen)',
    role: 'citizen',
    dept: 'Verified Resident',
  },
  {
    email: 'admin@gmail.com',
    pass: 'civic123',
    name: 'Admin (Staff)',
    role: 'admin',
    dept: 'City Administrator',
  },
  {
    email: 'faculty@gmail.com',
    pass: 'civic123',
    name: 'Faculty (Staff)',
    role: 'faculty',
    dept: 'Municipal Engineering & Public Works',
  },
];

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onBackToHome }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [email, setEmail] = useState('noor@gmail.com');
  const [password, setPassword] = useState('noor123');
  const [error, setError] = useState<string | null>(null);

  // Sync credentials when switching role tab
  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
    if (role === 'citizen') {
      setEmail('noor@gmail.com');
      setPassword('civic123');
    } else if (role === 'admin') {
      setEmail('admin@gmail.com');
      setPassword('civic123');
    } else if (role === 'faculty') {
      setEmail('faculty@gmail.com');
      setPassword('civic123');
    }
  };

  const handleQuickLogin = (u: typeof TEST_USERS[0]) => {
    setEmail(u.email);
    setPassword(u.pass);
    setSelectedRole(u.role);
    setError(null);
    onLogin({
      email: u.email,
      name: u.name,
      role: u.role,
      department: u.dept,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const match = TEST_USERS.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.pass === password
    );

    if (match) {
      onLogin({
        email: match.email,
        name: match.name,
        role: match.role,
        department: match.dept,
      });
    } else {
      setError('Invalid credentials. Please use the exact credentials shown below.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center items-center p-4 selection:bg-[#8DA399]/20">
      <div className="w-full max-w-md space-y-5">
        {/* Back to Home Button */}
        {onBackToHome && (
          <button
            type="button"
            onClick={onBackToHome}
            className="text-xs text-[#8DA399] hover:text-[#6E867B] font-semibold flex items-center gap-1.5 transition-colors pl-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to CivicSense Home</span>
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#EBF0ED] border border-[#8DA399]/30 flex items-center justify-center text-[#8DA399] mx-auto shadow-xs">
            <DoodleCivicLogo className="w-8 h-8 text-[#8DA399]" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[#4A4955] tracking-tight">
              CivicSense Login
            </h1>
            <div className="flex justify-center -mt-1">
              <DoodleSquiggleUnderline className="w-20 text-[#8DA399]" />
            </div>
            <p className="text-xs text-[#6B6A75] max-w-xs mx-auto">
              Select your role or enter credentials to access your dashboard
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-[1.2rem] border border-[#8DA399]/25 bg-white/80 backdrop-blur-xs p-6 shadow-sm space-y-5">
          {/* Role Selection Tabs */}
          <div>
            <label className="text-[11px] font-semibold text-[#4A4955] uppercase tracking-wider block mb-2 text-center">
              Select Your Access Role
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F4EFEB] rounded-xl border border-[#8DA399]/20">
              <button
                type="button"
                onClick={() => handleRoleTabChange('citizen')}
                className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5
                  ${
                    selectedRole === 'citizen'
                      ? 'bg-white text-[#4A4955] shadow-xs'
                      : 'text-[#6B6A75] hover:text-[#4A4955]'
                  }
                `}
              >
                <UserCheck className="w-3.5 h-3.5 text-[#8DA399]" />
                <span>Citizen</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange('admin')}
                className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5
                  ${
                    selectedRole === 'admin'
                      ? 'bg-white text-[#4A4955] shadow-xs'
                      : 'text-[#6B6A75] hover:text-[#4A4955]'
                  }
                `}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#8DA399]" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange('faculty')}
                className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5
                  ${
                    selectedRole === 'faculty'
                      ? 'bg-white text-[#4A4955] shadow-xs'
                      : 'text-[#6B6A75] hover:text-[#4A4955]'
                  }
                `}
              >
                <Wrench className="w-3.5 h-3.5 text-[#8DA399]" />
                <span>Faculty</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4A4955] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#8DA399]" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  selectedRole === 'citizen'
                    ? 'noor@gmail.com'
                    : selectedRole === 'admin'
                    ? 'admin@gmail.com'
                    : 'faculty@gmail.com'
                }
                className="w-full px-3.5 py-2.5 bg-white/90 border border-[#8DA399]/30 rounded-xl text-xs text-[#4A4955] placeholder:text-[#9C9BA8] focus:outline-none focus:ring-2 focus:ring-[#8DA399]/40 focus:border-[#8DA399] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4A4955] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#8DA399]" />
                <span>Password</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  selectedRole === 'citizen'
                    ? 'noor123'
                    : selectedRole === 'admin'
                    ? 'admin123'
                    : 'faculty123'
                }
                className="w-full px-3.5 py-2.5 bg-white/90 border border-[#8DA399]/30 rounded-xl text-xs text-[#4A4955] placeholder:text-[#9C9BA8] focus:outline-none focus:ring-2 focus:ring-[#8DA399]/40 focus:border-[#8DA399] transition-all"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-500 font-medium bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#8DA399] hover:bg-[#7D9489] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>
                Sign In as {selectedRole === 'citizen' ? 'Citizen' : selectedRole === 'admin' ? 'Admin' : 'Faculty'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Helper Credentials Box */}
        <div className="rounded-[1.2rem] border border-[#8DA399]/25 bg-[#F4EFEB]/80 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#4A4955] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#8DA399]" />
              <span>Testing Credentials</span>
            </span>
            <span className="text-[10px] text-[#8DA399] bg-[#EBF0ED] px-2 py-0.5 rounded-full font-medium">
              Click to Auto-Fill
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            {TEST_USERS.map((u) => (
              <button
                key={u.role}
                type="button"
                onClick={() => handleQuickLogin(u)}
                className="w-full text-left p-2.5 rounded-xl bg-white/80 hover:bg-white border border-[#8DA399]/20 hover:border-[#8DA399]/50 transition-all flex items-center justify-between group shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#4A4955]">{u.name}</span>
                    <span
                      className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.2 rounded-full border
                        ${
                          u.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : u.role === 'faculty'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-[#EBF0ED] text-[#6E867B] border-[#8DA399]/30'
                        }
                      `}
                    >
                      {u.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9C9BA8] font-mono mt-0.5">
                    {u.email} <span className="text-[#6B6A75]">/</span> {u.pass}
                  </p>
                </div>

                <span className="text-[11px] text-[#8DA399] font-medium group-hover:translate-x-0.5 transition-transform">
                  Login →
                </span>
              </button>
            ))}
          </div>

          {/* Explicit Helper Text as requested */}
          <div className="text-[11px] text-[#6B6A75] bg-white/60 p-2.5 rounded-xl border border-[#8DA399]/15 space-y-0.5 font-mono">
            <p><strong>Citizen:</strong> noor@gmail.com / civic123</p>
            <p><strong>Admin:</strong> admin@gmail.com / civic123</p>
            <p><strong>Faculty:</strong> faculty@gmail.com / civic123</p>
          </div>
        </div>
      </div>
    </div>
  );
};
