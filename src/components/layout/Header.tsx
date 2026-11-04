import React from 'react';
import { Send, PlusCircle, Edit3 } from 'lucide-react';
import { APP_CONFIG } from '../../lib/constants';

interface HeaderProps {
  memberCount?: number;
  onOpenRegister: () => void;
  myProfile?: { id: string; name: string } | null;
  onOpenMyProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenRegister,
  myProfile,
  onOpenMyProfile,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
            <a href="#" className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-telegram-brand text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <Send className="h-4 w-4 sm:h-5 sm:w-5 rotate-180 -translate-x-0.5" />
              </div>
              <span className="font-black text-slate-900 tracking-tight text-sm sm:text-lg leading-tight truncate">
                {APP_CONFIG.name}
              </span>
            </a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Profile Management Button (Always accessible to edit/delete) */}
            {onOpenMyProfile && (
              <button
                onClick={onOpenMyProfile}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs shrink-0 ${
                  myProfile
                    ? 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/80'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
                title="ویرایش مشخصات یا حذف پروفایل من"
              >
                <Edit3 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="hidden sm:inline">
                  {myProfile ? `پروفایل من (${myProfile.name.split(' ')[0]})` : 'ویرایش یا حذف پروفایل'}
                </span>
                <span className="sm:hidden text-[11px]">
                  {myProfile ? 'پروفایل من' : 'پروفایل'}
                </span>
              </button>
            )}

            {/* Public Register Button */}
            <button
              onClick={onOpenRegister}
              className="inline-flex items-center gap-1 sm:gap-1.5 rounded-xl bg-gradient-to-l from-sky-600 to-telegram-brand px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-sm shadow-sky-500/25 hover:from-sky-500 hover:to-sky-600 active:scale-95 transition-all shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>عضویت</span>
              <span className="hidden sm:inline"> در شبکه</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
