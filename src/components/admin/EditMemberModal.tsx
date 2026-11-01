import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import type { Member } from '../../types';
import { DEFAULT_CATEGORIES } from '../../lib/constants';
import { X } from 'lucide-react';

interface EditMemberModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Member>) => Promise<void>;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  member,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Member>>({});
  const [skillInput, setSkillInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        full_name: member.full_name,
        professional_title: member.professional_title,
        category: member.category,
        bio: member.bio,
        skills: [...member.skills],
        telegram_username: member.telegram_username,
        linkedin_url: member.linkedin_url,
        website_url: member.website_url,
        location: member.location,
        can_help_with: member.can_help_with,
        collaboration_goals: member.collaboration_goals,
        featured: member.featured,
      });
    }
  }, [member]);

  if (!member) return null;

  const handleAddSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    const current = formData.skills || [];
    if (!current.includes(s)) {
      setFormData({ ...formData, skills: [...current, s] });
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: (formData.skills || []).filter(s => s !== skillToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(member.id, formData);
    setIsSaving(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ویرایش مشخصات همکلاسی"
      subtitle={`مدیریت اطلاعات و بازبینی پروفایل ${member.full_name}`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-right">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">نام و نام خانوادگی</label>
            <input
              type="text"
              required
              value={formData.full_name || ''}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 py-2 px-3 text-sm text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">عنوان حرفه‌ای</label>
            <input
              type="text"
              required
              value={formData.professional_title || ''}
              onChange={(e) => setFormData({ ...formData, professional_title: e.target.value })}
              className="w-full rounded-xl border border-slate-200 py-2 px-3 text-sm text-slate-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">دسته‌بندی تخصصی</label>
            <select
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-xl border border-slate-200 py-2 px-3 text-sm text-slate-800 bg-white font-medium"
            >
              {DEFAULT_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">شهر / موقعیت مکانی</label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full rounded-xl border border-slate-200 py-2 px-3 text-sm text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">معرفی کوتاه / بایو</label>
          <textarea
            rows={3}
            value={formData.bio || ''}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full rounded-xl border border-slate-200 py-2 px-3 text-sm text-slate-800"
          />
        </div>

        {/* Skills Tag Edit */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">مهارت‌ها</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="مهارت جدید..."
              className="flex-1 rounded-xl border border-slate-200 py-1.5 px-3 text-sm text-slate-800"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
            >
              افزودن
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {formData.skills?.map(s => (
              <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {s}
                <button type="button" onClick={() => handleRemoveSkill(s)}>
                  <X className="w-3 h-3 text-slate-400 hover:text-rose-600" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Telegram, LinkedIn, Website */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">آیدی تلگرام</label>
            <input
              type="text"
              dir="ltr"
              value={formData.telegram_username || ''}
              onChange={(e) => setFormData({ ...formData, telegram_username: e.target.value.replace('@', '') })}
              className="w-full rounded-xl border border-slate-200 py-2 px-3 text-sm text-slate-800 text-left"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">لینکدین</label>
            <input
              type="url"
              dir="ltr"
              value={formData.linkedin_url || ''}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              className="w-full rounded-xl border border-slate-200 py-2 px-3 text-sm text-slate-800 text-left"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">وبسایت</label>
            <input
              type="url"
              dir="ltr"
              value={formData.website_url || ''}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              className="w-full rounded-xl border border-slate-200 py-2 px-3 text-sm text-slate-800 text-left"
            />
          </div>
        </div>

        {/* Featured Toggle */}
        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-800">
            <input
              type="checkbox"
              checked={formData.featured || false}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
            />
            <span>نمایش این کاربر به عنوان عضو منتخب در بالای صفحه</span>
          </label>
        </div>

        {/* Action Buttons */}
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
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
