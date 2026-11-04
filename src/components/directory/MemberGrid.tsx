import React, { useState } from 'react';
import type { Member } from '../../types';
import { MemberCard } from './MemberCard';
import { MemberListItem } from './MemberListItem';
import { SearchX, PlusCircle, ArrowDown, LayoutGrid, List } from 'lucide-react';

interface MemberGridProps {
  members: Member[];
  isLoading: boolean;
  onSelectMember: (member: Member) => void;
  onFilterSkill?: (skill: string) => void;
  onOpenRegister: () => void;
  onResetFilters: () => void;
}

const ITEMS_PER_PAGE = 9;

export const MemberGrid: React.FC<MemberGridProps> = ({
  members,
  isLoading,
  onSelectMember,
  onFilterSkill,
  onOpenRegister,
  onResetFilters,
}) => {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [viewMode, setViewMode] = useState<'card' | 'list'>(() => {
    try {
      return (localStorage.getItem('directory_view_mode') as 'card' | 'list') || 'card';
    } catch {
      return 'card';
    }
  });

  const handleViewModeChange = (mode: 'card' | 'list') => {
    setViewMode(mode);
    try {
      localStorage.setItem('directory_view_mode', mode);
    } catch {
      // ignore
    }
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-2">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm animate-pulse space-y-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-20 bg-slate-200 rounded" />
                <div className="h-5 w-36 bg-slate-200 rounded" />
                <div className="h-3 w-28 bg-slate-200 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-slate-200 rounded" />
              <div className="h-3 w-4/5 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm my-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
          <SearchX className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-black text-slate-900 mb-1">همکلاسی‌ای با این مشخصات یافت نشد</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
          هیچ پروفایل تایید‌شده‌ای متناسب با عبارت جستجو یا دسته‌بندی انتخاب‌شده پیدا نشد. می‌توانید فیلترها را پاک کنید یا اولین نفری باشید که پروفایلش را ثبت می‌کند!
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onResetFilters}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            حذف فیلترها
          </button>
          <button
            onClick={onOpenRegister}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>عضویت در شبکه</span>
          </button>
        </div>
      </div>
    );
  }

  const visibleMembers = members.slice(0, visibleCount);
  const hasMore = visibleCount < members.length;

  return (
    <div className="space-y-4 sm:space-y-6 pt-1">
      {/* View Switcher Bar */}
      <div className="flex items-center justify-between gap-2 pb-1">
        <div className="text-xs text-slate-500 font-medium">
          نمایش <span className="font-bold text-slate-900">{members.length}</span> همکلاسی
        </div>

        {/* View Mode Toggle Button */}
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/60 shadow-2xs">
          <button
            type="button"
            onClick={() => handleViewModeChange('card')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'card'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="نمای کارتی (همراه با معرفی کامل)"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">کارتی</span>
          </button>

          <button
            type="button"
            onClick={() => handleViewModeChange('list')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="نمای لیست فشرده تلگرامی (مرور سریع و آسان)"
          >
            <List className="w-3.5 h-3.5" />
            <span>فهرست فشرده</span>
          </button>
        </div>
      </div>

      {/* Render Cards or Compact List */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {visibleMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onSelect={onSelectMember}
              onFilterSkill={onFilterSkill}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-2.5">
          {visibleMembers.map((member) => (
            <MemberListItem
              key={member.id}
              member={member}
              onSelect={onSelectMember}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-2 sm:pt-4">
          <button
            onClick={handleLoadMore}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs active:scale-95 transition-all"
          >
            <ArrowDown className="w-4 h-4 text-slate-400" />
            <span>مشاهده اعضای بیشتر ({members.length - visibleCount} همکلاسی دیگر)</span>
          </button>
        </div>
      )}
    </div>
  );
};
