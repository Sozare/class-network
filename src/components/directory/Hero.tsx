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
    <div className="relative overflow-hidden bg-gradient-to-b from-sky-50/40 via-white to-slate-50 border-b border-slate-200/80 pt-10 pb-10 sm:pt-20 sm:pb-16 w-full">
      {/* 1. Blurred Classmates Networking Photo in Background (Before filters) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
        <img
          src={classmatesImg}
          alt="همکلاسی‌ها در حال گفتگو و همکاری"
          className="w-full h-full object-cover object-center filter blur-[6px] opacity-30"
        />
        {/* Soft gradient mask for pristine text contrast and smooth transition to filters */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/75 to-slate-50/95" />
      </div>

      {/* 2. Decorative Glow & Radial Light */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[320px] bg-gradient-to-tr from-sky-200/35 via-blue-200/25 to-indigo-100/15 blur-3xl rounded-full" />

      {/* Subtle SVG Networking Node Grid in Background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center z-10 w-full">
        {/* Main Headline */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight sm:leading-tight break-words">
          فراتر از کلاس،{' '}
          <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            در ارتباط بمانید.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-3 sm:mt-5 max-w-2xl text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed font-normal px-2">
          همکلاسی‌های خود را پیدا کنید، با تجربیاتشان آشنا شوید و راه‌های ارتباط و همکاری را پیدا کنید.
        </p>

        {/* Action CTAs */}
        <div className="mt-6 sm:mt-8 flex flex-col items-center justify-center gap-2.5 max-w-sm sm:max-w-none mx-auto w-full px-2 sm:px-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-4 w-full">
            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-sky-600 to-telegram-brand px-6 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-white shadow-md shadow-sky-500/20 hover:from-sky-500 hover:to-sky-600 active:scale-95 transition-all"
            >
              <PlusCircle className="w-5 h-5 shrink-0" />
              <span>عضویت در شبکه</span>
            </button>

            <button
              onClick={onScrollToDirectory}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-6 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 active:scale-95 transition-all shadow-xs"
            >
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <span>مشاهده همکلاسی‌ها</span>
            </button>
          </div>

          {onOpenEditProfile && (
            <button
              type="button"
              onClick={onOpenEditProfile}
              className="text-xs text-slate-500 hover:text-sky-600 transition-colors pt-1.5"
            >
              قبلاً ثبت‌نام کرده‌اید؟ <span className="font-bold underline">ویرایش یا حذف پروفایل</span>
            </button>
          )}
        </div>

        {/* 3. Sleek Visual Section Divider to Separate Hero from Classmates */}
        <div className="mt-8 sm:mt-12 pt-5 sm:pt-6 border-t border-slate-200/60 flex items-center justify-center">
          <button
            onClick={onScrollToDirectory}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-slate-600 text-xs font-bold transition-all shadow-2xs group max-w-full"
          >
            <Users className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="truncate">دایرکتوری و اعضای شبکه دوره</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:translate-y-0.5 transition-transform shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};
