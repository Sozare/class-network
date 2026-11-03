import React from 'react';
import { Send, Heart } from 'lucide-react';
import { LinkedInIcon } from '../common/Icons';
import { APP_CONFIG } from '../../lib/constants';

interface FooterProps {
  onOpenRegister: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenRegister,
}) => {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-telegram-brand text-white shadow-xs">
              <Send className="h-4 w-4 rotate-180 -translate-x-0.5" />
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight text-lg">
              {APP_CONFIG.name}
            </span>
          </div>

          {/* Clean Public Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600 font-medium">
            <a href="#directory" className="hover:text-sky-600 transition-colors">
              مشاهده همکلاسی‌ها
            </a>
            <button
              onClick={onOpenRegister}
              className="hover:text-sky-600 transition-colors"
            >
              ثبت‌نام در شبکه
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 text-center sm:text-right">
          <p className="flex items-center justify-center gap-1.5 text-slate-600 font-medium">
            <span>ساخته شده با عشق برای یادگیری اشتراکی</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </p>

          <div className="flex items-center justify-center gap-2 text-slate-600">
            <span>نوشته شده توسط <strong>سروش</strong></span>
            <a
              href="https://www.linkedin.com/in/soroush-zare1993"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="پروفایل لینکدین سروش"
              className="p-1 rounded-md text-slate-500 hover:text-[#0A66C2] hover:bg-sky-50 transition-colors inline-flex items-center gap-1"
              title="مشاهده پروفایل لینکدین سروش"
            >
              <LinkedInIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
