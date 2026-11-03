import React from 'react';
import { Send, PlusCircle, ShieldCheck } from 'lucide-react';
import { APP_CONFIG } from '../../lib/constants';

interface HeaderProps {
  memberCount?: number;
  onOpenRegister: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenRegister,
  onOpenAdmin,
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
              <span className="font-black text-slate-900 tracking-tight text-lg leading-tight">
                {APP_CONFIG.name}
              </span>
            </a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Admin link */}
            <button
              onClick={onOpenAdmin}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${
                isAdminLoggedIn
                  ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                  : 'bg-white text-slate-700 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title="پنل مدیریت دوره"
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
