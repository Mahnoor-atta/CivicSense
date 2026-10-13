import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Wrench,
  UserCheck,
  Sparkles,
  Camera,
  MapPin,
  Clock,
  CheckCircle2,
  Send,
  FileText,
  ChevronRight,
} from 'lucide-react';
import {
  DoodleCivicLogo,
  DoodleHouse,
  DoodleHeart,
  DoodleSparkle,
  DoodleCheckCircle,
  DoodleSquiggleUnderline,
  DoodlePaperPlane,
  DoodleLamp,
  DoodlePothole,
  DoodleTrashBin,
} from './Doodles';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#111113] flex flex-col justify-between selection:bg-[#8DA399]/20 selection:text-[#3B3A45]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#8DA399]/20">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EBF0ED] border border-[#8DA399]/30 flex items-center justify-center text-[#8DA399] shadow-xs">
              <DoodleCivicLogo className="w-6 h-6 text-[#8DA399]" />
            </div>
            <div>
              <span className="text-base font-bold text-[#4A4955] tracking-tight">
                CivicSense
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onGetStarted}
              className="px-4 py-2 bg-[#8DA399] hover:bg-[#7D9489] text-white text-xs font-semibold rounded-xl shadow-xs transition-all hover:scale-102 flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center">
        <section className="max-w-6xl mx-auto px-6 sm:px-10 py-8 sm:py-12 text-center space-y-5">
          {/* Soft Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF0ED] text-xs font-medium text-[#6E867B] border border-[#8DA399]/25 shadow-2xs">
            <DoodleHeart className="w-3.5 h-3.5 text-[#8DA399]" />
            <span>Citizen-First Municipal Care & Rapid Response</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-3 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#4A4955] tracking-tight leading-tight">
              Smart Civic Complaint & <br className="hidden sm:block" />
              Resolution Platform with <span className="text-[#8DA399]">CivicSense</span>
            </h1>
            <div className="flex justify-center pt-1">
              <DoodleSquiggleUnderline className="w-36 text-[#8DA399]" />
            </div>
          </div>

          <p className="text-sm sm:text-base text-[#4A4955] max-w-2xl mx-auto leading-relaxed">
            Report road potholes, streetlight outages, litter, or drainage hazards in seconds.
            Powered by smart AI triaging, photographic evidence, verified address locations,
            and transparent workflow dispatch to municipal faculty teams.
          </p>

          {/* Call To Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={onGetStarted}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#8DA399] hover:bg-[#7A9187] text-white text-sm font-semibold rounded-2xl shadow-md transition-all duration-200 hover:scale-102 active:scale-98 flex items-center justify-center gap-2.5"
            >
              <DoodlePaperPlane className="w-5 h-5 text-white" color="#FFFFFF" />
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-6 py-3.5 bg-white/80 hover:bg-[#F4EFEB] text-[#4A4955] border border-[#8DA399]/30 text-sm font-semibold rounded-2xl shadow-2xs transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Platform Roles</span>
              <ChevronRight className="w-4 h-4 text-[#8DA399]" />
            </a>
          </div>

          {/* Quick Stats Pill Strip */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-white/80 border border-[#8DA399]/20 shadow-2xs">
              <p className="text-lg font-bold text-[#4A4955]">100%</p>
              <p className="text-xs text-[#2D2C35]">Citizen Direct Voice</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/80 border border-[#8DA399]/20 shadow-2xs">
              <p className="text-lg font-bold text-[#4A725D]">&lt; 24h</p>
              <p className="text-xs text-[#2D2C35]">Average Admin Triage</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/80 border border-[#8DA399]/20 shadow-2xs">
              <p className="text-lg font-bold text-[#8DA399]">Smart AI</p>
              <p className="text-xs text-[#2D2C35]">Gemini Issue Triaging</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/80 border border-[#8DA399]/20 shadow-2xs">
              <p className="text-lg font-bold text-[#4A4955]">Live</p>
              <p className="text-xs text-[#2D2C35]">Tracking & Resolution</p>
            </div>
          </div>
        </section>

        {/* Feature Highlights Section */}
        <section id="features" className="w-full max-w-6xl mx-auto px-6 sm:px-10 py-12 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-[#4A4955]">
              Designed for Seamless Civic Collaboration
            </h2>
            <p className="text-xs sm:text-sm text-[#2D2C35] max-w-lg mx-auto">
              Every detail is engineered with plenty of whitespace, calming pastel tones, and accessible workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1 */}
            <div className="p-6 rounded-[1.2rem] bg-white/80 border border-[#8DA399]/25 shadow-2xs space-y-3.5 transition-all hover:border-[#8DA399]/60 hover:shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF0ED] text-[#8DA399] flex items-center justify-center">
                <DoodleSparkle className="w-6 h-6 text-[#8DA399]" />
              </div>
              <h3 className="text-base font-bold text-[#4A4955]">
                AI-Powered Auto Triaging
              </h3>
              <p className="text-xs text-[#4A4955] leading-relaxed">
                Gemini AI analyzes citizen descriptions and attached photos to automatically classify category, municipal department, and urgency priority.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-[1.2rem] bg-white/80 border border-[#8DA399]/25 shadow-2xs space-y-3.5 transition-all hover:border-[#8DA399]/60 hover:shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF0ED] text-[#8DA399] flex items-center justify-center">
                <DoodleHouse className="w-6 h-6 text-[#8DA399]" />
              </div>
              <h3 className="text-base font-bold text-[#4A4955]">
                Interactive City Pinning
              </h3>
              <p className="text-xs text-[#4A4955] leading-relaxed">
                Click directly on the interactive municipal map, browse landmark presets, or acquire instant GPS coordinates for exact repair location dispatch.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-[1.2rem] bg-white/80 border border-[#8DA399]/25 shadow-2xs space-y-3.5 transition-all hover:border-[#8DA399]/60 hover:shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF0ED] text-[#8DA399] flex items-center justify-center">
                <DoodleCheckCircle className="w-6 h-6 text-[#8DA399]" />
              </div>
              <h3 className="text-base font-bold text-[#4A4955]">
                Transparent Progress Tracking
              </h3>
              <p className="text-xs text-[#4A4955] leading-relaxed">
                Follow your report through Received, Admin Review, Faculty Dispatch with completion deadlines, and verified resolution with official crew notes.
              </p>
            </div>
          </div>
        </section>

        {/* Role Workflows Section */}
        <section id="how-it-works" className="w-full max-w-6xl mx-auto px-6 sm:px-10 py-12 space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF0ED] text-xs font-semibold text-[#6E867B]">
              <DoodleCivicLogo className="w-3.5 h-3.5 text-[#8DA399]" />
              <span>Role-Based Portals</span>
            </div>
            <h2 className="text-2xl font-bold text-[#4A4955]">
              Tailored Experiences for Every Stakeholder
            </h2>
            <p className="text-xs sm:text-sm text-[#4A4955] max-w-lg mx-auto">
              Clean separation of responsibilities guarantees fast resolution and clear accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Citizen Portal */}
            <div className="p-5 rounded-[1.2rem] bg-white/80 border border-[#8DA399]/25 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EBF0ED] text-[#6E867B] border border-[#8DA399]/30">
                  Citizen
                </span>
                <UserCheck className="w-4 h-4 text-[#8DA399]" />
              </div>
              <h4 className="text-sm font-bold text-[#4A4955]">Report & Track</h4>
              <ul className="text-xs text-[#4A4955] space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8DA399] shrink-0" />
                  <span>Register complaints with photo previews</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8DA399] shrink-0" />
                  <span>Select 'Other' with custom issue specifications</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8DA399] shrink-0" />
                  <span>Monitor live repair timeline & status</span>
                </li>
              </ul>
            </div>

            {/* Admin Portal */}
            <div className="p-5 rounded-[1.2rem] bg-white/80 border border-[#8DA399]/25 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  Admin
                </span>
                <ShieldCheck className="w-4 h-4 text-purple-600" />
              </div>
              <h4 className="text-sm font-bold text-[#4A4955]">Review & Dispatch</h4>
              <ul className="text-xs text-[#4A4955] space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8DA399] shrink-0" />
                  <span>Table review panel of all submissions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8DA399] shrink-0" />
                  <span>Reject reports with mandatory citizen notices</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8DA399] shrink-0" />
                  <span>Forward to Faculty with exact deadlines</span>
                </li>
              </ul>
            </div>

            {/* Faculty Portal */}
            <div className="p-5 rounded-[1.2rem] bg-white/80 border border-[#8DA399]/25 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Faculty
                </span>
                <Wrench className="w-4 h-4 text-blue-600" />
              </div>
              <h4 className="text-sm font-bold text-[#4A4955]">Execute & Resolve</h4>
              <ul className="text-xs text-[#4A4955] space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8DA399] shrink-0" />
                  <span>Dedicated panel showing only forwarded tasks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8DA399] shrink-0" />
                  <span>Inspect photos, maps, and admin instructions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8DA399] shrink-0" />
                  <span>Mark resolved with optional repair notes</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="w-full max-w-6xl mx-auto px-6 sm:px-10 py-12">
          <div className="rounded-[1.5rem] border border-[#8DA399]/30 bg-[#EBF0ED]/80 p-8 sm:p-10 text-center space-y-4 shadow-xs">
            <h3 className="text-2xl font-bold text-[#4A4955]">
              Ready to report or review municipal issues?
            </h3>
            <p className="text-xs sm:text-sm text-[#4A4955] max-w-md mx-auto leading-relaxed">
              Sign in with your role-specific test account to experience the full CivicSense workflow.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onGetStarted}
                className="px-8 py-3.5 bg-[#8DA399] hover:bg-[#7A9187] text-white text-sm font-semibold rounded-2xl shadow-md transition-all hover:scale-102 inline-flex items-center gap-2"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[#8DA399]/20 text-center text-xs text-[#6B6A75] bg-[#FDFBF7]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <DoodleHouse className="w-4 h-4 text-[#8DA399]" />
            <span>CivicSense • Smart Civic Complaint & Resolution System</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <button
              type="button"
              onClick={onGetStarted}
              className="text-[#8DA399] font-medium hover:underline"
            >
              Portal Login
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
