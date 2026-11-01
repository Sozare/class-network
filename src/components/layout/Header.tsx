import React from 'react';
import { Send, PlusCircle, ShieldCheck, Database } from 'lucide-react';
import { APP_CONFIG } from '../../lib/constants';
import { isSupabaseConfigured } from '../../lib/supabase';

interface HeaderProps {
  memberCount: number;
  onOpenRegister: () => void;
  onOpenAdmin: () => void;
  onOpenDbGuide?: () => void;
  isAdminLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  memberCount,
  onOpenRegister,
  onOpenAdmin,
  onOpenDbGuide,
  isAdminLoggedIn,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-telegram-brand text-white shadow-sm shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <Send className="h-5 w-5 rotate-180 -translate-x-0.5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-slate-900 tracking-tight text-lg leading-tight">
                    {APP_CONFIG.name}
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-sky-100 text-sky-800">
                    دوره تلگرام
                  </span>
                </div>
                <span className="text-xs text-slate-500 hidden sm:inline font-medium">
                  {APP_CONFIG.courseName}
                </span>
              </div>
            </a>

            {/* Member count indicator */}
            <div className="hidden md:flex items-center gap-1.5 pr-3 border-r border-slate-200 text-xs font-medium text-slate-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>
                <strong className="text-slate-900 font-bold">{memberCount}</strong> عضو تایید شده
              </span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Database indicator */}
            <button
              onClick={onOpenDbGuide}
              title={isSupabaseConfigured ? 'پایگاه داده زنده Supabase متصل است' : 'استفاده از حافظه مرورگر. برای راهنمای اتصال رایگان به دیتابیس کلیک کنید'}
              className={`hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                isSupabaseConfigured
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isSupabaseConfigured ? 'دیتابیس متصل' : 'حالت آزمایشی (راهنمای اتصال)'}</span>
            </button>

            {/* Admin link */}
            <button
              onClick={onOpenAdmin}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${
                isAdminLoggedIn
                  ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                  : 'bg-white text-slate-700 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title="پنل مدیریت و تایید اعضا"
            >
              <ShieldCheck className="w-4 h-4 text-sky-500" />
              <span>{isAdminLoggedIn ? 'پنل مدیریت' : 'مدیریت'}</span>
            </button>

            {/* Join the Network CTA */}
            <button
              onClick={onOpenRegister}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-sky-600 to-telegram-brand px-3.5 py-2 text-xs sm:text-sm font-bold text-white shadow-sm shadow-sky-500/25 hover:from-sky-500 hover:to-sky-600 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="whitespace-nowrap">عضویت در شبکه</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
