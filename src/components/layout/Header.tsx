import React from 'react';
import { Send, PlusCircle } from 'lucide-react';
import { APP_CONFIG } from '../../lib/constants';

interface HeaderProps {
  memberCount?: number;
  onOpenRegister: () => void;
  isAdminLoggedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenRegister,
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

          {/* Right Action Button - Only Public Register CTA */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={onOpenRegister}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-sky-600 to-telegram-brand px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-sm shadow-sky-500/25 hover:from-sky-500 hover:to-sky-600 active:scale-95 transition-all"
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
