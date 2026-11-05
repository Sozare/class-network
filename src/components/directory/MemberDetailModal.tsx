import React, { useState } from 'react';
import { Send, Globe, MapPin, Calendar, Check, Copy, HeartHandshake, Lightbulb, Sparkles, ShieldCheck, Edit3 } from 'lucide-react';
import type { Member } from '../../types';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { LinkedInIcon, InstagramIcon } from '../common/Icons';

interface MemberDetailModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onFilterSkill?: (skill: string) => void;
  onOpenEditProfile?: (memberId: string) => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  isOpen,
  onClose,
  onFilterSkill,
  onOpenEditProfile,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!member) return null;

  const telegramUrl = member.telegram_username
    ? `https://t.me/${member.telegram_username.replace('@', '')}`
    : null;

  const handleCopyProfile = () => {
    const url = `${window.location.origin}${window.location.pathname}#member-${member.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const formattedDate = new Date(member.created_at).toLocaleDateString('fa-IR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl" noPadding>
      <div className="text-right">
        {/* Banner header gradient */}
        <div className="h-36 sm:h-44 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Content body */}
        <div className="px-4 sm:px-6 pb-6 pt-0">
          {/* Avatar & Action buttons row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 -mt-14 sm:-mt-20 mb-5">
            {/* Avatar on the right */}
            <div className="relative shrink-0">
              <Avatar
                src={member.profile_photo_url}
                name={member.full_name}
                size="2xl"
                className="w-20 h-20 sm:w-28 sm:h-28 border-4 border-white shadow-xl ring-1 ring-slate-900/10 shrink-0 bg-white"
              />
            </div>

            {/* Clear Action buttons on the left */}
            <div className="flex items-center gap-2 pt-1 sm:pt-0 w-full sm:w-auto">
              <button
                onClick={handleCopyProfile}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold border border-slate-200 transition-all shadow-xs active:scale-95"
                title="کپی لینک اختصاصی این پروفایل"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-emerald-700 font-bold">لینک کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>اشتراک‌گذاری</span>
                  </>
                )}
              </button>

              {onOpenEditProfile && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenEditProfile(member.id);
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs sm:text-sm font-bold border border-sky-200 transition-all shadow-xs active:scale-95"
                  title="ویرایش یا حذف این پروفایل توسط صاحب آن"
                >
                  <Edit3 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>ویرایش یا حذف</span>
                </button>
              )}
            </div>
          </div>

          {/* Member Identity Block (Name, Title, Badges) - Fully separated from banner */}
          <div className="mb-5 sm:mb-6 text-right">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight break-words">
                {member.full_name}
              </h2>
              <span title="عضو تایید‌شده دوره">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-sky-500 shrink-0" />
              </span>
            </div>
            <p className="text-xs sm:text-base font-bold text-slate-600 mt-1 break-words">{member.professional_title}</p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mt-2.5 sm:mt-3 text-[11px] sm:text-xs text-slate-500 font-semibold">
              <Badge variant="primary">{member.category}</Badge>
              {member.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {member.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                عضویت از {formattedDate}
              </span>
            </div>
          </div>

          {/* Contact Action Bar */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 mb-6">
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 w-full sm:w-auto">
              {telegramUrl && (
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg bg-telegram-brand hover:bg-sky-600 text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95"
                >
                  <Send className="w-4 h-4 rotate-180 -translate-x-0.5 shrink-0" />
                  <span>ارسال پیام در تلگرام ({member.telegram_username}@)</span>
                </a>
              )}

              {member.instagram_username && (
                <a
                  href={`https://instagram.com/${member.instagram_username.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-rose-600 hover:border-rose-300 text-xs sm:text-sm font-bold shadow-xs transition-colors"
                >
                  <InstagramIcon className="w-4 h-4 text-rose-600" />
                  <span>اینستاگرام ({member.instagram_username}@)</span>
                </a>
              )}

              {member.linkedin_url && (
                <a
                  href={member.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-700 hover:border-blue-300 text-xs sm:text-sm font-bold shadow-xs transition-colors"
                >
                  <LinkedInIcon className="w-4 h-4 text-[#0077b5]" />
                  <span>لینکدین</span>
                </a>
              )}

              {member.website_url && (
                <a
                  href={member.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 text-xs sm:text-sm font-bold shadow-xs transition-colors"
                >
                  <Globe className="w-4 h-4 text-slate-500" />
                  <span>وبسایت / پورتفولیو</span>
                </a>
              )}
            </div>
          </div>

          {/* Profile Sections */}
          <div className="space-y-6 text-right">
            {/* About */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                درباره من
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {member.bio}
              </p>
            </div>

            {/* Skills & Expertise */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                مهارت‌ها و فناوری‌ها
              </h4>
              <div className="flex flex-wrap gap-2">
                {member.skills?.map((skill) => (
                  <span
                    key={skill}
                    onClick={() => {
                      onFilterSkill?.(skill);
                      onClose();
                    }}
                    className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 border border-slate-200/60 cursor-pointer transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Current Interests */}
            {member.interests && member.interests.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  علاقه‌مندی‌های حرفه‌ای
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {member.interests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100"
                    >
                      <Sparkles className="w-3 h-3 text-sky-500" />
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Highlight Cards: Help & Collaboration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Can Help With */}
              {member.can_help_with && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-right">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-2">
                    <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>چگونه می‌توانم به دیگران کمک کنم؟</span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
                    {member.can_help_with}
                  </p>
                </div>
              )}

              {/* Collaboration Goals */}
              {member.collaboration_goals && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-right">
                  <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase tracking-wider mb-2">
                    <HeartHandshake className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>به دنبال چه نوع همکاری هستم؟</span>
                  </div>
                  <p className="text-xs sm:text-sm text-blue-950 leading-relaxed">
                    {member.collaboration_goals}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
