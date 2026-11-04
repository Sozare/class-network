import React from 'react';
import { Send, Globe, MapPin, Star, ArrowUpLeft } from 'lucide-react';
import type { Member } from '../../types';
import { Avatar } from '../common/Avatar';
import { LinkedInIcon, InstagramIcon } from '../common/Icons';

interface MemberCardProps {
  member: Member;
  onSelect: (member: Member) => void;
  onFilterSkill?: (skill: string) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onSelect,
}) => {
  const telegramUrl = member.telegram_username
    ? `https://t.me/${member.telegram_username.replace('@', '')}`
    : null;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-xs hover:shadow-md hover:border-slate-200 transition-all duration-200 hover:-translate-y-0.5 text-right">
      {/* Featured Ribbon / Star */}
      {member.featured && (
        <div className="absolute top-3.5 left-3.5 flex items-center gap-1 rounded-full bg-amber-50/90 border border-amber-200/70 px-2 py-0.5 text-[10px] font-bold text-amber-700">
          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
          <span>منتخب</span>
        </div>
      )}

      {/* Top Section: Photo, Category, Name & Title */}
      <div>
        <div className="flex items-start gap-3.5 mb-3">
          <div className="relative cursor-pointer shrink-0" onClick={() => onSelect(member)}>
            <Avatar
              src={member.profile_photo_url}
              name={member.full_name}
              size="lg"
              className="ring-1 ring-slate-100 group-hover:ring-sky-200 transition-all"
            />
            {member.is_demo && (
              <span
                className="absolute -bottom-1 -left-1 px-1 py-0.2 bg-slate-100 text-slate-500 text-[9px] font-bold rounded border border-slate-200"
                title="پروفایل نمونه توسعه (قبل از انتشار حذف می‌شود)"
              >
                آزمایشی
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <span className="inline-block text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full mb-1 max-w-full truncate">
              {member.category}
            </span>
            <h3
              onClick={() => onSelect(member)}
              className="text-base font-bold text-slate-900 truncate hover:text-sky-600 cursor-pointer transition-colors"
              title={member.full_name}
            >
              {member.full_name}
            </h3>
            <p className="text-xs text-slate-500 font-normal leading-snug mt-1" title={member.professional_title}>
              {member.professional_title}
            </p>
          </div>
        </div>

        {/* Location if present */}
        {member.location && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-normal mb-2.5">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{member.location}</span>
          </div>
        )}

        {/* Bio / Description */}
        <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed mb-3 min-h-[3.25rem] font-normal">
          {member.bio}
        </p>
      </div>

      {/* Footer Section: Contact Links & View Profile */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
        {/* Social / Contact Icons (Only displayed if provided) */}
        <div className="flex items-center gap-1">
          {telegramUrl && (
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-sky-500 hover:text-white transition-all"
              title={`ارسال پیام در تلگرام به @${member.telegram_username}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Send className="w-3.5 h-3.5 rotate-180 -translate-x-0.2" />
            </a>
          )}

          {member.instagram_username && (
            <a
              href={`https://instagram.com/${member.instagram_username.replace(/^@/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-rose-500 hover:text-white transition-all"
              title={`صفحه اینستاگرام @${member.instagram_username}`}
              onClick={(e) => e.stopPropagation()}
            >
              <InstagramIcon className="w-3.5 h-3.5" />
            </a>
          )}

          {member.linkedin_url && (
            <a
              href={member.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-[#0077b5] hover:text-white transition-all"
              title="پروفایل لینکدین"
              onClick={(e) => e.stopPropagation()}
            >
              <LinkedInIcon className="w-3.5 h-3.5" />
            </a>
          )}

          {member.website_url && (
            <a
              href={member.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-800 hover:text-white transition-all"
              title="وبسایت یا پورتفولیو شخصی"
              onClick={(e) => e.stopPropagation()}
            >
              <Globe className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* View Profile Action */}
        <button
          onClick={() => onSelect(member)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors"
        >
          <span>مشاهده پروفایل</span>
          <ArrowUpLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
