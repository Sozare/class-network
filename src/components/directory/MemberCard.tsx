import React from 'react';
import { Send, Globe, MapPin, Star, ArrowUpLeft } from 'lucide-react';
import type { Member } from '../../types';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { LinkedInIcon, InstagramIcon } from '../common/Icons';

interface MemberCardProps {
  member: Member;
  onSelect: (member: Member) => void;
  onFilterSkill?: (skill: string) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onSelect,
  onFilterSkill,
}) => {
  const telegramUrl = member.telegram_username
    ? `https://t.me/${member.telegram_username.replace('@', '')}`
    : null;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 text-right">
      {/* Featured Ribbon / Star */}
      {member.featured && (
        <div className="absolute top-4 left-4 flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/80 px-2 py-0.5 text-[11px] font-bold text-amber-700 shadow-xs">
          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
          <span>منتخب</span>
        </div>
      )}

      {/* Top Section: Photo, Category, Name & Title */}
      <div>
        <div className="flex items-start gap-4 mb-4">
          <div className="relative cursor-pointer shrink-0" onClick={() => onSelect(member)}>
            <Avatar
              src={member.profile_photo_url}
              name={member.full_name}
              size="lg"
              className="ring-2 ring-slate-100 group-hover:ring-sky-400 transition-all"
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

          <div className="flex-1 min-w-0 pl-10">
            <div className="flex items-center gap-1.5 mb-1">
              <Badge variant="primary" size="sm" className="truncate max-w-[200px]">
                {member.category}
              </Badge>
            </div>
            <h3
              onClick={() => onSelect(member)}
              className="text-base sm:text-lg font-black text-slate-900 truncate hover:text-sky-600 cursor-pointer transition-colors"
              title={member.full_name}
            >
              {member.full_name}
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 truncate" title={member.professional_title}>
              {member.professional_title}
            </p>
          </div>
        </div>

        {/* Location if present */}
        {member.location && (
          <div className="flex items-center gap-1 text-xs text-slate-400 font-medium mb-3">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{member.location}</span>
          </div>
        )}

        {/* Short Bio / Introduction */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
          {member.bio}
        </p>

        {/* Main Skills Pills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {member.skills?.slice(0, 4).map((skill) => (
            <span
              key={skill}
              onClick={(e) => {
                e.stopPropagation();
                onFilterSkill?.(skill);
              }}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-50 text-slate-600 border border-slate-200 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 cursor-pointer transition-colors"
            >
              {skill}
            </span>
          ))}
          {member.skills?.length > 4 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-bold text-slate-400 bg-slate-50">
              +{member.skills.length - 4} بیشتر
            </span>
          )}
        </div>
      </div>

      {/* Footer Section: Contact Links & View Profile */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
        {/* Social / Contact Icons (Only displayed if provided) */}
        <div className="flex items-center gap-1.5">
          {telegramUrl && (
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white transition-colors"
              title={`ارسال پیام در تلگرام به @${member.telegram_username}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Send className="w-4 h-4 rotate-180 -translate-x-0.5" />
            </a>
          )}

          {member.instagram_username && (
            <a
              href={`https://instagram.com/${member.instagram_username.replace(/^@/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:text-white transition-all"
              title={`صفحه اینستاگرام @${member.instagram_username}`}
              onClick={(e) => e.stopPropagation()}
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
          )}

          {member.linkedin_url && (
            <a
              href={member.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-[#0077b5] hover:text-white transition-colors"
              title="پروفایل لینکدین"
              onClick={(e) => e.stopPropagation()}
            >
              <LinkedInIcon className="w-4 h-4" />
            </a>
          )}

          {member.website_url && (
            <a
              href={member.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white transition-colors"
              title="وبسایت یا پورتفولیو شخصی"
              onClick={(e) => e.stopPropagation()}
            >
              <Globe className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* View Profile Action */}
        <button
          onClick={() => onSelect(member)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80 transition-colors"
        >
          <span>مشاهده پروفایل</span>
          <ArrowUpLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
