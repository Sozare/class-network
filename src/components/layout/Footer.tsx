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
                <Send className="h-4 w-4 -rotate-12 translate-x-0.5" />
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                {APP_CONFIG.name}
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-md leading-relaxed">
              A private peer directory for members of our online Telegram learning cohort.
              Connecting classmates, fostering collaborations, and helping everyone build with complementary skills.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Moderated directory. Private contact details are never exposed without consent.</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a href="#directory" className="hover:text-sky-600 transition-colors">
                  Browse Members
                </a>
              </li>
              <li>
                <button onClick={onOpenRegister} className="hover:text-sky-600 transition-colors text-left">
                  Submit Your Profile
                </button>
              </li>
              <li>
                <a href="#categories" className="hover:text-sky-600 transition-colors">
                  Professional Categories
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Community & Admin */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Administration
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-sky-600 transition-colors inline-flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Admin Moderation</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenDbGuide}
                  className="hover:text-sky-600 transition-colors"
                >
                  Supabase Setup Guide
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {APP_CONFIG.name}. Built for the Telegram educational community.</p>
          <p className="flex items-center gap-1">
            <span>Built with care for peer learning</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};
