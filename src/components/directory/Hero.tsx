import React from 'react';
import { PlusCircle, Search } from 'lucide-react';

interface HeroProps {
  memberCount?: number;
  skillsCount?: number;
  onOpenRegister: () => void;
  onScrollToDirectory: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenRegister,
  onScrollToDirectory,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-sky-50/40 via-white to-slate-50 border-b border-slate-200/60 pt-12 pb-14 sm:pt-20 sm:pb-20">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[260px] bg-gradient-to-tr from-sky-200/30 via-blue-200/20 to-indigo-100/10 blur-3xl rounded-full" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.25]">
          فراتر از کلاس،{' '}
          <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            در ارتباط بمانید.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
          همکلاسی‌های خود را پیدا کنید، با تجربیاتشان آشنا شوید و راه‌های ارتباط و همکاری را پیدا کنید.
        </p>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={onOpenRegister}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-sky-600 to-telegram-brand px-6 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-sky-500/20 hover:from-sky-500 hover:to-sky-600 active:scale-95 transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            <span>عضویت در شبکه</span>
          </button>

          <button
            onClick={onScrollToDirectory}
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-6 py-3.5 text-sm sm:text-base font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 active:scale-95 transition-all shadow-xs"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span>مشاهده همکلاسی‌ها</span>
          </button>
        </div>
      </div>
    </div>
  );
};
