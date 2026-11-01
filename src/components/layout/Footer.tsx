import React from 'react';
import { Send, Shield, Users, Heart } from 'lucide-react';
import { APP_CONFIG } from '../../lib/constants';

interface FooterProps {
  onOpenRegister: () => void;
  onOpenAdmin: () => void;
  onOpenDbGuide?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenRegister,
  onOpenAdmin,
  onOpenDbGuide,
}) => {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Purpose */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-telegram-brand text-white">
                <Send className="h-4 w-4 rotate-180 -translate-x-0.5" />
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                {APP_CONFIG.name}
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-md leading-relaxed">
              دایرکتوری ارتباطی و شبکه‌سازی ویژه اعضا و هم‌دوره‌ای‌های کلاس تلگرام.
              بستری برای شناخت تخصص‌ها، شکل‌گیری همکاری‌های تیمی و ساخت پروژه‌های مشترک.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>دایرکتوری مدیریت‌شده: اطلاعات تماس محرمانه هرگز بدون اجازه منتشر نمی‌شود.</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              دسترسی سریع
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 font-medium">
              <li>
                <a href="#directory" className="hover:text-sky-600 transition-colors">
                  مشاهده اعضای شبکه
                </a>
              </li>
              <li>
                <button onClick={onOpenRegister} className="hover:text-sky-600 transition-colors text-right">
                  ثبت‌نام و ارسال پروفایل
                </button>
              </li>
              <li>
                <a href="#directory" className="hover:text-sky-600 transition-colors">
                  دسته‌بندی‌های تخصصی
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Community & Admin */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              مدیریت و پشتیبانی
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 font-medium">
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-sky-600 transition-colors inline-flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>ورود مدیر (بررسی و تایید اعضا)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenDbGuide}
                  className="hover:text-sky-600 transition-colors"
                >
                  راهنمای اتصال به دیتابیس رایگان
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {APP_CONFIG.name}. طراحی و آماده‌سازی شده برای اعضای دوره تلگرام.</p>
          <p className="flex items-center gap-1">
            <span>ساخته‌شده با عشق برای یادگیری اشتراکی</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};
