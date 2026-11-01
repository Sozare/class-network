import React from 'react';
import { PlusCircle, Search, Users, ShieldCheck, Sparkles, Send } from 'lucide-react';
import { APP_CONFIG } from '../../lib/constants';

interface HeroProps {
  memberCount: number;
  skillsCount: number;
  onOpenRegister: () => void;
  onScrollToDirectory: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  memberCount,
  skillsCount,
  onOpenRegister,
  onScrollToDirectory,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-sky-50/50 via-white to-slate-50 border-b border-slate-200/60 pt-10 pb-12 sm:pt-16 sm:pb-16">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-tr from-sky-200/40 via-blue-200/30 to-indigo-100/20 blur-3xl rounded-full" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/80 border border-sky-200/70 text-sky-800 text-xs font-semibold mb-6 shadow-sm">
          <Send className="w-3.5 h-3.5 text-sky-600 -rotate-12" />
          <span>{APP_CONFIG.courseName} Community</span>
          <span className="w-1 h-1 rounded-full bg-sky-500" />
          <span className="text-sky-700 font-normal">Official Peer Directory</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          Learn Together. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Connect Beyond the Classroom.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
          {APP_CONFIG.subtitle}
        </p>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={onOpenRegister}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-telegram-brand px-6 py-3.5 text-sm sm:text-base font-semibold text-white shadow-lg shadow-sky-500/25 hover:from-sky-500 hover:to-sky-600 active:scale-95 transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Join the Network</span>
          </button>

          <button
            onClick={onScrollToDirectory}
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 active:scale-95 transition-all shadow-sm"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span>Explore Directory</span>
          </button>
        </div>

        {/* Key Metrics / Highlights */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-6 border-t border-slate-200/80">
          <div className="p-3 rounded-xl bg-white/70 border border-slate-100 shadow-sm text-center">
            <div className="flex items-center justify-center gap-1.5 text-sky-600 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900">{memberCount}</span>
            </div>
            <p className="text-xs font-medium text-slate-500">Joined Members</p>
          </div>

          <div className="p-3 rounded-xl bg-white/70 border border-slate-100 shadow-sm text-center">
            <div className="flex items-center justify-center gap-1.5 text-blue-600 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900">{skillsCount}+</span>
            </div>
            <p className="text-xs font-medium text-slate-500">Skills & Tools</p>
          </div>

          <div className="p-3 rounded-xl bg-white/70 border border-slate-100 shadow-sm text-center col-span-2 sm:col-span-1">
            <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900">100%</span>
            </div>
            <p className="text-xs font-medium text-slate-500">Moderated & Verified</p>
          </div>
        </div>
      </div>
    </div>
  );
};
