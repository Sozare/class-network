import React from 'react';
import { Send, MapPin, ChevronLeft } from 'lucide-react';
import type { Member } from '../../types';
import { Avatar } from '../common/Avatar';

interface MemberListItemProps {
  member: Member;
  onSelect: (member: Member) => void;
}

export const MemberListItem: React.FC<MemberListItemProps> = ({ member, onSelect }) => {
  const telegramUrl = member.telegram_username
    ? `https://t.me/${member.telegram_username.replace('@', '')}`
    : null;

  return (
    <div
      onClick={() => onSelect(member)}
      className="group flex items-center justify-between p-3 sm:p-3.5 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl shadow-2xs hover:border-slate-200 transition-all cursor-pointer text-right w-full"
    >
      {/* Right: Avatar & Details */}
      <div className="flex items-center gap-3 min-w-0 flex-1 pl-2">
        <div className="relative shrink-0">
          <Avatar
            src={member.profile_photo_url}
            name={member.full_name}
            size="md"
            className="w-11 h-11 sm:w-12 sm:h-12 ring-1 ring-slate-100 group-hover:ring-sky-200 transition-all shrink-0"
          />
          {member.is_demo && (
            <span
              className="absolute -bottom-1 -left-1 px-1 py-0.2 bg-slate-100 text-slate-500 text-[8px] font-bold rounded border border-slate-200"
              title="نمونه آزمایشی"
            >
              نمونه
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors truncate">
              {member.full_name}
            </h4>
            <span className="text-[10px] sm:text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full truncate max-w-[140px] sm:max-w-none">
              {member.category}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span className="truncate max-w-[180px] sm:max-w-md">{member.professional_title}</span>
            {member.location && (
              <span className="hidden sm:flex items-center gap-0.5 text-[11px] text-slate-400 shrink-0">
                <MapPin className="w-3 h-3" />
                {member.location}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Left: Quick Actions */}
      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
        {telegramUrl && (
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600 hover:bg-[#229ED9] hover:text-white transition-all shadow-2xs shrink-0"
            title={`ارسال پیام در تلگرام به @${member.telegram_username}`}
          >
            <Send className="w-3.5 h-3.5 rotate-180 -translate-x-0.2" />
          </a>
        )}

        <button
          onClick={() => onSelect(member)}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
          title="مشاهده پروفایل کامل"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
