import React from 'react';
import { PlusCircle, Search, Users, ChevronDown } from 'lucide-react';
import classmatesImg from '../../assets/classmates-discussion.jpg';

interface HeroProps {
  memberCount?: number;
  skillsCount?: number;
  onOpenRegister: () => void;
  onScrollToDirectory: () => void;
  onOpenEditProfile?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenRegister,
  onScrollToDirectory,
  onOpenEditProfile,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-[#0b1329] border-b border-slate-800/80 pt-12 pb-12 sm:pt-20 sm:pb-16 w-full text-white">
      {/* 1. Blurred Classmates Networking Photo in Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
        <img
          src={classmatesImg}
          alt="هم‌دوره‌ای‌ها در حال گفتگو و همکاری"
          className="w-full h-full object-cover object-center filter blur-[6px] opacity-20"
        />
        {/* Dark gradient mask for high contrast text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/85 to-[#0b1329]" />
      </div>

      {/* 2. Decorative Glow & Radial Light */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-[650px] h-[340px] bg-gradient-to-tr from-sky-500/20 via-blue-600/15 to-indigo-500/10 blur-3xl rounded-full" />

      {/* Subtle SVG Networking Node Grid in Background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center z-10 w-full">
        {/* Main Headline */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight sm:leading-tight break-words">
          فراتر از کلاس،{' '}
          <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
            در ارتباط بمانید.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-3 sm:mt-5 max-w-2xl text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed font-normal px-2">
          هم‌دوره‌ای‌های خود را پیدا کنید، با تجربیاتشان آشنا شوید و راه‌های ارتباط و همکاری را پیدا کنید.
        </p>

        {/* Action CTAs */}
        <div className="mt-7 sm:mt-8 flex flex-col items-center justify-center gap-2.5 max-w-sm sm:max-w-none mx-auto w-full px-2 sm:px-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-4 w-full">
            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-sky-500 to-telegram-brand px-6 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-sky-500 active:scale-95 transition-all"
            >
              <PlusCircle className="w-5 h-5 shrink-0" />
              <span>عضویت در شبکه</span>
            </button>

            <button
              onClick={onScrollToDirectory}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 px-6 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-white active:scale-95 transition-all shadow-xs backdrop-blur-md"
            >
              <Search className="w-4 h-4 text-sky-300 shrink-0" />
              <span>مشاهده هم‌دوره‌ای‌ها</span>
            </button>
          </div>

          {onOpenEditProfile && (
            <button
              type="button"
              onClick={onOpenEditProfile}
              className="text-xs text-slate-400 hover:text-sky-300 transition-colors pt-2"
            >
              قبلاً ثبت‌نام کرده‌اید؟ <span className="font-bold underline text-slate-300">ویرایش یا حذف پروفایل</span>
            </button>
          )}
        </div>

        {/* 3. Sleek Visual Section Divider to Separate Hero from Directory */}
        <div className="mt-9 sm:mt-12 pt-5 sm:pt-6 border-t border-slate-800/80 flex items-center justify-center">
          <button
            onClick={onScrollToDirectory}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 text-xs font-bold transition-all shadow-xs group max-w-full backdrop-blur-md"
          >
            <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate">دایرکتوری اعضای دوره</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:translate-y-0.5 transition-transform shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};
