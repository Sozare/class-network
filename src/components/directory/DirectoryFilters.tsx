import React, { useState } from 'react';
import { Search, X, SlidersHorizontal, Send, Check } from 'lucide-react';
import { DEFAULT_CATEGORIES, POPULAR_SKILLS } from '../../lib/constants';
import type { FilterState } from '../../types';

interface DirectoryFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  totalResults: number;
}

export const DirectoryFilters: React.FC<DirectoryFiltersProps> = ({
  filters,
  onFilterChange,
  totalResults,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchQuery: e.target.value });
  };

  const clearSearch = () => {
    onFilterChange({ ...filters, searchQuery: '' });
  };

  const handleCategorySelect = (categoryName: string) => {
    onFilterChange({
      ...filters,
      category: categoryName,
    });
  };

  const handleSkillToggle = (skill: string) => {
    const isSelected = filters.selectedSkills.includes(skill);
    const updated = isSelected
      ? filters.selectedSkills.filter(s => s !== skill)
      : [...filters.selectedSkills, skill];
    onFilterChange({ ...filters, selectedSkills: updated });
  };

  const handleTelegramToggle = () => {
    onFilterChange({ ...filters, hasTelegramOnly: !filters.hasTelegramOnly });
  };

  const handleSortChange = (sortBy: FilterState['sortBy']) => {
    onFilterChange({ ...filters, sortBy });
  };

  const clearAllFilters = () => {
    onFilterChange({
      searchQuery: '',
      category: 'all',
      selectedSkills: [],
      hasTelegramOnly: false,
      sortBy: 'recent',
    });
  };

  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    filters.category !== 'all' ||
    filters.selectedSkills.length > 0 ||
    filters.hasTelegramOnly ||
    filters.sortBy !== 'recent';

  return (
    <div id="directory" className="space-y-4">
      {/* Top Search & Sort Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder="جستجو بر اساس نام، تخصص شغلی، مهارت، علاقه‌مندی یا شهر..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-11 pl-10 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all text-right"
          />
          {filters.searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 hover:text-slate-600"
              aria-label="پاک کردن جستجو"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle & Sort Buttons */}
        <div className="flex items-center gap-2">
          {/* Advanced toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-3 text-xs sm:text-sm font-bold transition-colors ${
              showAdvanced || filters.selectedSkills.length > 0 || filters.hasTelegramOnly
                ? 'border-sky-500 bg-sky-50 text-sky-800'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>فیلترها</span>
            {(filters.selectedSkills.length > 0 || filters.hasTelegramOnly) && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-[10px] text-white font-black">
                {filters.selectedSkills.length + (filters.hasTelegramOnly ? 1 : 0)}
              </span>
            )}
          </button>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value as FilterState['sortBy'])}
              className="h-full rounded-xl border border-slate-200 bg-white py-3 pr-3 pl-8 text-xs sm:text-sm font-bold text-slate-700 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
            >
              <option value="recent">تازه‌ترین اعضا</option>
              <option value="featured">افراد منتخب</option>
              <option value="name">بر اساس نام (الفبا)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills (Horizontal Scroller) */}
      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {DEFAULT_CATEGORIES.map((cat) => {
            const isSelected =
              filters.category === cat.name ||
              (cat.id === 'all' && filters.category === 'all');

            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id === 'all' ? 'all' : cat.name)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all shadow-sm ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-slate-900/10'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Filter Drawer (Skills & Options) */}
      {showAdvanced && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600">
                فیلتر بر اساس مهارت‌ها
              </span>
              {filters.selectedSkills.length > 0 && (
                <button
                  onClick={() => onFilterChange({ ...filters, selectedSkills: [] })}
                  className="text-xs font-semibold text-sky-600 hover:underline"
                >
                  پاک کردن مهارت‌های انتخابی
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SKILLS.map((skill) => {
                const isSelected = filters.selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => handleSkillToggle(skill)}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold border transition-colors ${
                      isSelected
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs sm:text-sm text-slate-700 font-bold">
              <input
                type="checkbox"
                checked={filters.hasTelegramOnly}
                onChange={handleTelegramToggle}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
              />
              <span className="inline-flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-sky-500 rotate-180" />
                فقط اعضایی که آیدی تلگرام دارند
              </span>
            </label>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
              >
                بازنشانی همه فیلترها
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active filters pill bar & Result counter */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium gap-2 pt-1">
        <div>
          نمایش <span className="font-bold text-slate-900">{totalResults}</span> نفر
          {filters.category !== 'all' && (
            <span> در دسته‌بندی <strong className="text-slate-800">{filters.category}</strong></span>
          )}
          {filters.searchQuery && (
            <span> با جستجوی &laquo;<strong className="text-slate-800">{filters.searchQuery}</strong>&raquo;</span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            <X className="w-3.5 h-3.5" />
            <span>حذف همه فیلترها</span>
          </button>
        )}
      </div>
    </div>
  );
};
