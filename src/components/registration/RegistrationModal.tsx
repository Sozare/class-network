import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Upload, X, Check, AlertCircle, Send, Eye, Edit3, Shield,
  CheckCircle2, Sparkles, User, Briefcase, Globe, MapPin, Mail
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { MemberCard } from '../directory/MemberCard';
import { LinkedInIcon } from '../common/Icons';
import { DEFAULT_CATEGORIES, POPULAR_SKILLS } from '../../lib/constants';
import { memberRegistrationSchema } from '../../lib/validation';
import { uploadProfilePhoto } from '../../services/storageService';
import { memberService } from '../../services/memberService';
import type { Member, RegistrationFormData } from '../../types';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    full_name: '',
    professional_title: '',
    category: DEFAULT_CATEGORIES[1]?.name || 'مهندسی نرم‌افزار و برنامه‌نویسی',
    bio: '',
    skills: [],
    interests: [],
    collaboration_goals: '',
    can_help_with: '',
    telegram_username: '',
    linkedin_url: '',
    website_url: '',
    location: '',
    private_email: '',
    profile_photo_url: '',
    consent_to_publish: false,
    website_trap: '', // Anti-spam honeypot
  });

  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    setUploadError(null);

    const result = await uploadProfilePhoto(file);
    setIsUploadingPhoto(false);

    if (result.error) {
      setUploadError(result.error);
    } else if (result.url) {
      setFormData(prev => ({ ...prev, profile_photo_url: result.url }));
      if (fieldErrors.profile_photo_url) {
        setFieldErrors(prev => {
          const updated = { ...prev };
          delete updated.profile_photo_url;
          return updated;
        });
      }
    }
  };

  // Add skill tag
  const handleAddSkill = (skill: string) => {
    const clean = skill.trim();
    if (!clean) return;
    if (formData.skills.includes(clean)) return;
    if (formData.skills.length >= 12) return;

    setFormData(prev => ({ ...prev, skills: [...prev.skills, clean] }));
    setSkillInput('');
    if (fieldErrors.skills) {
      setFieldErrors(prev => {
        const u = { ...prev };
        delete u.skills;
        return u;
      });
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  // Add interest tag
  const handleAddInterest = (interest: string) => {
    const clean = interest.trim();
    if (!clean) return;
    if (formData.interests?.includes(clean)) return;
    setFormData(prev => ({
      ...prev,
      interests: [...(prev.interests || []), clean],
    }));
    setInterestInput('');
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests?.filter(i => i !== interest),
    }));
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    // 1. Zod Validation
    const validationResult = memberRegistrationSchema.safeParse(formData);

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFieldErrors(errors);
      setActiveTab('form');
      return;
    }

    // 2. Submit to service
    setIsSubmitting(true);
    const res = await memberService.submitMemberRegistration(formData);
    setIsSubmitting(false);

    if (res.success) {
      setIsSubmittedSuccess(true);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Confetti is optional
      }
      onSuccess();
    } else {
      setFieldErrors({ form: res.error || 'خطایی در ثبت اطلاعات رخ داد. لطفاً دوباره تلاش کنید.' });
    }
  };

  const resetFormAndClose = () => {
    setIsSubmittedSuccess(false);
    setFieldErrors({});
    onClose();
  };

  // Virtual member object for the Live Card Preview
  const previewMember: Member = {
    id: 'preview-id',
    full_name: formData.full_name || 'نام و نام خانوادگی شما',
    professional_title: formData.professional_title || 'عنوان و موقعیت شغلی شما',
    bio: formData.bio || 'معرفی کوتاه، سوابق و حوزه‌های کاری شما در این قسمت نمایش داده خواهد شد.',
    category: formData.category,
    profile_photo_url: formData.profile_photo_url || '',
    skills: formData.skills.length > 0 ? formData.skills : ['مهارت اول', 'مهارت دوم'],
    interests: formData.interests,
    collaboration_goals: formData.collaboration_goals,
    can_help_with: formData.can_help_with,
    telegram_username: formData.telegram_username,
    linkedin_url: formData.linkedin_url,
    website_url: formData.website_url,
    location: formData.location || 'ریموت',
    publication_status: 'pending',
    featured: false,
    consent_to_publish: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetFormAndClose}
      title={
        isSubmittedSuccess ? (
          <span className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
            درخواست عضویت شما دریافت شد
          </span>
        ) : (
          'عضویت در شبکه همکلاسی‌ها'
        )
      }
      subtitle={
        isSubmittedSuccess
          ? 'پروفایل شما در حال حاضر در صف بررسی ادمین‌های دوره است.'
          : 'خود را به همکلاسی‌های دوره معرفی کنید و با افراد مستعد کلاس ارتباط کاری برقرار کنید.'
      }
      maxWidth="3xl"
    >
      {/* Success State */}
      {isSubmittedSuccess ? (
        <div className="py-6 text-center space-y-5 text-right">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto text-center">
            <h3 className="text-xl font-black text-slate-900">
              از پیوستن شما به شبکه همکلاسی‌ها متشکریم!
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              پروفایل شما با موفقیت ثبت شد و پس از بررسی و تایید توسط ادمین‌های دوره، در صفحه اصلی دایرکتوری منتشر خواهد شد.
              این فرآیند به منظور حفظ کیفیت و امنیت کامیونیتی کلاس انجام می‌شود.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 max-w-md mx-auto text-right text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Shield className="w-4 h-4 text-sky-500" />
              <span>مراحل بعدی چیست؟</span>
            </div>
            <p>۱. مدیران دوره درخواست‌ها را بررسی و اعتبارسنجی می‌کنند.</p>
            <p>۲. به محض تایید، کارت شما بلافاصله در صفحه اول قرار می‌گیرد.</p>
            <p>۳. همکلاسی‌ها می‌توانند مهارت‌های شما را ببینند و مستقیماً در تلگرام پیام دهند.</p>
          </div>

          <div className="pt-4 text-center">
            <button
              onClick={resetFormAndClose}
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm"
            >
              بازگشت به دایرکتوری همکلاسی‌ها
            </button>
          </div>
        </div>
      ) : (
        <div className="text-right">
          {/* Tabs: Edit Form vs Live Preview */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'form'
                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>تکمیل مشخصات</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>پیش‌نمایش زنده کارت</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-400 font-bold hidden sm:inline">
              * فیلدهای دارای ستاره الزامی هستند
            </span>
          </div>

          {/* General Form Error Banner */}
          {fieldErrors.form && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{fieldErrors.form}</span>
            </div>
          )}

          {/* Live Preview Tab */}
          {activeTab === 'preview' && (
            <div className="py-4 space-y-4">
              <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-xs text-sky-800 font-medium">
                این یک پیش‌نمایش زنده است از کارتی که سایر همکلاسی‌ها در صفحه اصلی مشاهده خواهند کرد.
              </div>
              <div className="max-w-sm mx-auto">
                <MemberCard member={previewMember} onSelect={() => {}} />
              </div>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className="text-xs font-bold text-sky-600 hover:underline"
                >
                  ← ادامه ویرایش مشخصات
                </button>
              </div>
            </div>
          )}

          {/* Form Tab */}
          <form
            onSubmit={handleSubmit}
            className={`space-y-6 ${activeTab === 'preview' ? 'hidden' : 'block'}`}
          >
            {/* Honeypot hidden input */}
            <input
              type="text"
              name="website_trap"
              value={formData.website_trap}
              onChange={(e) => setFormData({ ...formData, website_trap: e.target.value })}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Section 1: Photo & Basic Identity */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>۱. هویت و تخصص اصلی</span>
              </h4>

              {/* Photo Upload Row */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <Avatar
                  src={formData.profile_photo_url}
                  name={formData.full_name || 'همکلاسی'}
                  size="xl"
                  className="ring-2 ring-white shadow-sm shrink-0"
                />
                <div className="flex-1 text-center sm:text-right space-y-1.5">
                  <div className="text-xs font-bold text-slate-800">
                    تصویر چهره / پروفایل *
                  </div>
                  <p className="text-xs text-slate-500">
                    لطفاً یک تصویر باکیفیت و واضح (فرمت‌های JPG، PNG یا WebP تا سقف ۲ مگابایت) انتخاب کنید.
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoSelect}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingPhoto}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isUploadingPhoto ? 'در حال پردازش...' : 'انتخاب تصویر'}</span>
                    </button>
                    {formData.profile_photo_url && (
                      <span className="text-[11px] text-emerald-600 font-bold inline-flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> تصویر با موفقیت بارگذاری شد
                      </span>
                    )}
                  </div>
                  {uploadError && (
                    <p className="text-xs text-rose-600 font-semibold">{uploadError}</p>
                  )}
                  {fieldErrors.profile_photo_url && (
                    <p className="text-xs text-rose-600 font-semibold">{fieldErrors.profile_photo_url}</p>
                  )}
                </div>
              </div>

              {/* Full Name & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نام و نام خانوادگی *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="مثال: علی احمدی"
                    className={`w-full rounded-xl border py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.full_name
                        ? 'border-rose-300 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:border-sky-500 focus:ring-sky-500/20'
                    }`}
                  />
                  {fieldErrors.full_name && (
                    <p className="mt-1 text-xs text-rose-600 font-semibold">{fieldErrors.full_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    عنوان شغلی / حرفه‌ای *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.professional_title}
                    onChange={(e) => setFormData({ ...formData, professional_title: e.target.value })}
                    placeholder="مثال: برنامه‌نویس فول‌استک، طراح محصول"
                    className={`w-full rounded-xl border py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.professional_title
                        ? 'border-rose-300 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:border-sky-500 focus:ring-sky-500/20'
                    }`}
                  />
                  {fieldErrors.professional_title && (
                    <p className="mt-1 text-xs text-rose-600 font-semibold">{fieldErrors.professional_title}</p>
                  )}
                </div>
              </div>

              {/* Category & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    دسته‌بندی تخصصی *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white font-medium"
                  >
                    {DEFAULT_CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    شهر / موقعیت مکانی (اختیاری)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="مثال: تهران یا ریموت"
                      className="w-full rounded-xl border border-slate-200 py-2.5 pr-9 pl-3 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  معرفی کوتاه / بایو *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="خلاصه‌ای از تجربیات، کارهایی که انجام می‌دهید و موضوعاتی که برایتان هیجان‌انگیز است بنویسید..."
                  className={`w-full rounded-xl border py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.bio
                      ? 'border-rose-300 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-sky-500 focus:ring-sky-500/20'
                  }`}
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>{formData.bio.length} از ۶۰۰ حرف</span>
                  {fieldErrors.bio && <span className="text-rose-600 font-semibold">{fieldErrors.bio}</span>}
                </div>
              </div>
            </div>

            {/* Section 2: Skills & Collaboration */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                <span>۲. مهارت‌ها و اهداف همکاری</span>
              </h4>

              {/* Skills Tag Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  مهارت‌ها و ابزارها * (حداقل ۱ مهارت)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(skillInput);
                      }
                    }}
                    placeholder="مهارت را تایپ کنید و Enter یا دکمه افزودن را بزنید..."
                    className="flex-1 rounded-xl border border-slate-200 py-2 px-3 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill(skillInput)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors"
                  >
                    افزودن
                  </button>
                </div>

                {/* Selected Skills Chips */}
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-rose-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Skill Suggestions */}
                <div className="text-[11px] text-slate-400 mb-1 font-semibold">
                  مهارت‌های پرطرفدار (با کلیک اضافه می‌شوند):
                </div>
                <div className="flex flex-wrap gap-1">
                  {POPULAR_SKILLS.slice(0, 10).map((skill) => {
                    const isAdded = formData.skills.includes(skill);
                    if (isAdded) return null;
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleAddSkill(skill)}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors font-medium"
                      >
                        + {skill}
                      </button>
                    );
                  })}
                </div>
                {fieldErrors.skills && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold">{fieldErrors.skills}</p>
                )}
              </div>

              {/* Professional Interests */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  علاقه‌مندی‌های حرفه‌ای (اختیاری)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInterest(interestInput);
                      }
                    }}
                    placeholder="مثال: بات‌های تلگرام، استارتاپ‌های هوش مصنوعی، فین‌تک..."
                    className="flex-1 rounded-xl border border-slate-200 py-2 px-3 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddInterest(interestInput)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors"
                  >
                    افزودن
                  </button>
                </div>
                {formData.interests && formData.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {formData.interests.map((interest) => (
                      <span
                        key={interest}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => handleRemoveInterest(interest)}
                          className="hover:text-rose-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* What I can help with */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  چگونه می‌توانم به دیگر همکلاسی‌ها کمک کنم؟ (اختیاری)
                </label>
                <textarea
                  rows={2}
                  value={formData.can_help_with || ''}
                  onChange={(e) => setFormData({ ...formData, can_help_with: e.target.value })}
                  placeholder="مثال: بازبینی کدهای فرانت‌اند، مشاوره طراحی رابط، اشتراک منابع یادگیری..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              {/* Collaboration goals */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  به دنبال چه نوع همکاری یا تیمی هستم؟ (اختیاری)
                </label>
                <textarea
                  rows={2}
                  value={formData.collaboration_goals || ''}
                  onChange={(e) => setFormData({ ...formData, collaboration_goals: e.target.value })}
                  placeholder="مثال: مشتاق پیوستن به تیمی برای ساخت یک پروژه کلاسی مشترک یا استارتاپ مینی‌اپ..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            {/* Section 3: Contact & Links */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>۳. راه‌های ارتباطی و شبکه‌های اجتماعی</span>
              </h4>

              {/* Telegram Username */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  آیدی تلگرام (اختیاری اما بسیار توصیه می‌شود)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm font-bold">
                    @
                  </div>
                  <input
                    type="text"
                    dir="ltr"
                    value={formData.telegram_username || ''}
                    onChange={(e) => setFormData({ ...formData, telegram_username: e.target.value })}
                    placeholder="username"
                    className={`w-full rounded-xl border py-2.5 pl-8 pr-3 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.telegram_username
                        ? 'border-rose-300 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:border-sky-500 focus:ring-sky-500/20'
                    }`}
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  به همکلاسی‌ها اجازه می‌دهد با یک کلیک ساده، چت تلگرامی با شما را آغاز کنند.
                </p>
                {fieldErrors.telegram_username && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold">{fieldErrors.telegram_username}</p>
                )}
              </div>

              {/* LinkedIn & Portfolio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    آدرس لینکدین (اختیاری)
                  </label>
                  <div className="relative">
                    <LinkedInIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="url"
                      dir="ltr"
                      value={formData.linkedin_url || ''}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                      className={`w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                        fieldErrors.linkedin_url
                          ? 'border-rose-300 focus:ring-rose-500/20'
                          : 'border-slate-200 focus:border-sky-500 focus:ring-sky-500/20'
                      }`}
                    />
                  </div>
                  {fieldErrors.linkedin_url && (
                    <p className="mt-1 text-xs text-rose-600 font-semibold">{fieldErrors.linkedin_url}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    وبسایت / پورتفولیو / گیت‌هاب (اختیاری)
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      dir="ltr"
                      value={formData.website_url || ''}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      placeholder="https://yourwebsite.ir"
                      className={`w-full rounded-xl border py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                        fieldErrors.website_url
                          ? 'border-rose-300 focus:ring-rose-500/20'
                          : 'border-slate-200 focus:border-sky-500 focus:ring-sky-500/20'
                      }`}
                    />
                  </div>
                  {fieldErrors.website_url && (
                    <p className="mt-1 text-xs text-rose-600 font-semibold">{fieldErrors.website_url}</p>
                  )}
                </div>
              </div>

              {/* Private Email */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  آدرس ایمیل خصوصی (اختیاری)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="email"
                    dir="ltr"
                    value={formData.private_email || ''}
                    onChange={(e) => setFormData({ ...formData, private_email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-9 pl-3 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-left"
                  />
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                  <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    <strong>کاملاً محرمانه:</strong> این ایمیل هرگز در دایرکتوری به عموم نمایش داده نمی‌شود و فقط برای اطلاع‌رسانی‌های ضروری ادمین دوره است.
                  </span>
                </p>
                {fieldErrors.private_email && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold">{fieldErrors.private_email}</p>
                )}
              </div>
            </div>

            {/* Section 4: Explicit Consent Checkbox */}
            <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-100 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={formData.consent_to_publish}
                  onChange={(e) => setFormData({ ...formData, consent_to_publish: e.target.checked })}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4 mt-1 cursor-pointer shrink-0"
                />
                <span className="text-xs text-slate-700 leading-relaxed font-semibold">
                  <strong>رضایت انتشار عمومی:</strong> اینجانب تایید می‌کنم که عضو این دوره آموزشی تلگرام هستم و رضایت کامل دارم که اطلاعات فوق جهت شبکه‌سازی و ارتباط با سایر همکلاسی‌ها در این دایرکتوری منتشر شود.
                </span>
              </label>
              {fieldErrors.consent_to_publish && (
                <p className="text-xs text-rose-600 font-bold">{fieldErrors.consent_to_publish}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>مشاهده پیش‌نمایش کارت قبل از ارسال</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-sky-600 to-telegram-brand px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-sky-500/20 hover:from-sky-500 hover:to-sky-600 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>در حال ارسال...</span>
                  ) : (
                    <>
                      <span>ارسال پروفایل جهت تایید</span>
                      <Send className="w-3.5 h-3.5 rotate-180 -translate-x-0.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};
