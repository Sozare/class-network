import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { authService } from '../../services/authService';
import { isSupabaseConfigured } from '../../lib/supabase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await authService.login(email, password);
    setIsLoading(false);

    if (res.success) {
      onLoginSuccess();
      onClose();
    } else {
      setError(res.error || 'ایمیل یا رمز عبور اشتباه است.');
    }
  };

  const handleFillDemoCredentials = () => {
    setEmail('admin@classnetwork.local');
    setPassword('AdminClass2026!');
    setError(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-slate-900">
          <ShieldCheck className="w-5 h-5 text-sky-600" />
          ورود به پنل مدیریت دوره
        </span>
      }
      subtitle="جهت بررسی درخواست‌ها، ویرایش یا تایید اعضا وارد شوید."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-right">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            ایمیل مدیر
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              dir="ltr"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-left"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            رمز عبور
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              dir="ltr"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-left"
            />
          </div>
        </div>

        {/* Demo mode quick button if Supabase is not yet configured */}
        {!isSupabaseConfigured && (
          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                حالت آزمایشی فعال است
              </span>
              <button
                type="button"
                onClick={handleFillDemoCredentials}
                className="text-[11px] font-bold text-sky-700 hover:underline"
              >
                پر کردن خودکار اطلاعات ورود
              </button>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed" dir="ltr">
              Email: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">admin@classnetwork.local</code><br />
              Pass: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">AdminClass2026!</code>
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isLoading ? 'در حال ورود...' : 'ورود به پنل مدیریت'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
