import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Upload, X, AlertCircle, Send, Eye, Edit3, Shield,
  CheckCircle2, Sparkles, MapPin,
  ChevronDown, ChevronUp, Clock, Lock, Smile, Trash2
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

const QUICK_TITLES = [
  'برنامه‌نویس فرانت‌اند',
  'برنامه‌نویس پایتون / بک‌اند',
  'طراح رابط کاربری (UI/UX)',
  'کارشناس تولید محتوا',
  'دیجیتال مارکتر',
  'مدیر محصول / پروژه',
  'تحلیلگر دیتا و هوش مصنوعی',
  'دانشجو و پژوهشگر',
];

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
    consent_to_publish: true,
    website_trap: '',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [skillInput, setSkillInput] = useState('');
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

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, profile_photo_url: '' }));
  };

  // Add skill tag
  const handleAddSkill = (skill: string) => {
    const clean = skill.trim();
    if (!clean) return;
    if (formData.skills.includes(clean)) return;
    if (formData.skills.length >= 10) return;

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

  // Clean Telegram ID for preview
  const cleanTg = (formData.telegram_username || '').replace(/^@/, '').replace(/.*t\.me\//, '').trim();

  // Virtual member object for the Live Card Preview
  const previewMember: Member = {
    id: 'preview-id',
    full_name: formData.full_name || 'نام شما',
    professional_title: formData.professional_title || 'عنوان و حوزه فعالیت شما',
    bio: formData.bio || 'عضو دوره آموزشی • آماده گفتگو و همکاری با همکلاسی‌های عزیز',
    category: formData.category,
    profile_photo_url: formData.profile_photo_url || '',
    skills: formData.skills.length > 0 ? formData.skills : [formData.category],
    interests: formData.interests,
    collaboration_goals: formData.collaboration_goals,
    can_help_with: formData.can_help_with,
    telegram_username: cleanTg || undefined,
    linkedin_url: formData.linkedin_url,
    website_url: formData.website_url,
    location: formData.location || 'ایران',
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
            اطلاعات شما با موفقیت ثبت شد!
          </span>
        ) : (
          <div className="flex items-center gap-2 text-slate-900">
            <Sparkles className="w-5 h-5 text-sky-600" />
            <span>معرفی و عضویت در شبکه همکلاسی‌ها</span>
          </div>
        )
      }
      subtitle={
        isSubmittedSuccess
          ? 'پروفایل شما در صف بررسی مدیر کلاس قرار گرفت.'
          : 'خودت رو در کمتر از ۱ دقیقه به بچه‌های دوره معرفی کن تا بتونید با هم لینک بشید.'
      }
      maxWidth="2xl"
    >
      {/* Success State */}
      {isSubmittedSuccess ? (
        <div className="py-6 text-center space-y-5 text-right">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto text-center">
            <h3 className="text-xl font-black text-slate-900">
              خوش آمدید! کار شما تمام شد 🎉
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              اطلاعات شما ثبت شد و به زودی پس از تایید توسط مدیر دوره، در صفحه اصلی برای همه همکلاسی‌ها نمایش داده می‌شود.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 max-w-md mx-auto text-right text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Shield className="w-4 h-4 text-sky-500" />
              <span>چرا تایید ادمین وجود دارد؟</span>
            </div>
            <p>این بررسی صرفاً برای این است که مطمئن شویم فقط اعضای واقعی دوره در دایرکتوری حضور دارند و امنیت و صمیمیت جمع حفظ شود.</p>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={resetFormAndClose}
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm"
            >
              مشاهده دایرکتوری همکلاسی‌ها
            </button>
          </div>
        </div>
      ) : (
        <div className="text-right">
          {/* Trust & Ease Banner */}
          <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50/40 to-white border border-sky-100/80 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-slate-700 leading-tight">
                <strong>حریم خصوصی تضمین‌شده:</strong> بدون نیاز به شماره تماس یا اطلاعات حساس؛ فقط نام و تخصص شما جهت شبکه‌سازی همکلاسی‌ها نمایش داده می‌شود.
              </span>
            </div>
            <div className="inline-flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-full bg-white text-slate-600 border border-slate-200 text-[11px] font-bold self-start sm:self-auto">
              <Clock className="w-3 h-3 text-emerald-600" />
              <span>تکمیل در ۱ دقیقه</span>
            </div>
          </div>

          {/* Form Tabs */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'form'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>فرم سریع ثبت‌نام</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'preview'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>پیش‌نمایش کارت من</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              فقط ۴ فیلد اصلی الزامی است
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
            <div className="py-2 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 text-center font-medium">
                کارت شما پس از تایید مدیر، با این شکل و شمایل در صفحه اصلی دایرکتوری دوره نمایش داده می‌شود:
              </div>
              <div className="max-w-sm mx-auto">
                <MemberCard member={previewMember} onSelect={() => {}} />
              </div>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className="px-4 py-2 rounded-xl bg-sky-50 text-sky-700 text-xs font-bold hover:bg-sky-100 transition-colors"
                >
                  ← بازگشت به فرم و نهایی کردن ثبت‌نام
                </button>
              </div>
            </div>
          )}

          {/* Form Tab */}
          <form
            onSubmit={handleSubmit}
            className={`space-y-4 ${activeTab === 'preview' ? 'hidden' : 'block'}`}
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

            {/* Step 1: Main Core Fields (Clean & Fast) */}
            <div className="space-y-3.5">
              {/* Row 1: Full Name & Professional Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    نام و نام خانوادگی <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="مثال: سهراب احمدی"
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
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    عنوان یا تخصص اصلی شما <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.professional_title}
                    onChange={(e) => setFormData({ ...formData, professional_title: e.target.value })}
                    placeholder="مثال: طراح رابط کاربری، برنامه‌نویس، تریدر..."
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

              {/* Quick Titles Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[11px] text-slate-400 font-medium">عناوین آماده:</span>
                {QUICK_TITLES.slice(0, 4).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, professional_title: t }))}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-700 transition-colors font-medium"
                  >
                    + {t}
                  </button>
                ))}
              </div>

              {/* Row 2: Category & Telegram ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    دسته‌بندی اصلی <span className="text-rose-500">*</span>
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
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    آیدی تلگرام برای ارتباط <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sky-600 font-bold text-sm">
                      @
                    </div>
                    <input
                      type="text"
                      dir="ltr"
                      required
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
                  {fieldErrors.telegram_username ? (
                    <p className="mt-1 text-xs text-rose-600 font-semibold">{fieldErrors.telegram_username}</p>
                  ) : (
                    <p className="mt-1 text-[11px] text-slate-400">
                      دکمه شروع چت تلگرام مستقیماً به آیدی شما لینک می‌شود.
                    </p>
                  )}
                </div>
              </div>

              {/* Photo Box: Friendly & Fully Optional */}
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={formData.profile_photo_url}
                    name={formData.full_name || 'همکلاسی'}
                    size="lg"
                    className="ring-2 ring-white shadow-xs shrink-0"
                  />
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>تصویر پروفایل</span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/70 px-1.5 py-0.2 rounded">
                        اختیاری
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {formData.profile_photo_url
                        ? 'تصویر شما با موفقیت انتخاب شد.'
                        : 'اگر عکس آپلود نکنید، آواتار زیبا با حروف نام شما قرار می‌گیرد.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>{isUploadingPhoto ? 'در حال آپلود...' : 'انتخاب عکس'}</span>
                  </button>

                  {formData.profile_photo_url && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      title="حذف تصویر"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              {uploadError && (
                <p className="text-xs text-rose-600 font-semibold">{uploadError}</p>
              )}
            </div>

            {/* Step 2: Collapsible Optional Details (Accordion) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-sky-50/50 hover:bg-sky-50 border border-sky-100 text-xs font-bold text-sky-800 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Smile className="w-4 h-4 text-sky-600" />
                  <span>{showAdvanced ? 'بستن اطلاعات تکمیلی' : 'افزودن مهارت‌ها، بیو یا لینک‌های بیشتر (کاملاً اختیاری ➕)'}</span>
                </span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvanced && (
                <div className="mt-3 p-4 rounded-2xl bg-white border border-slate-200 space-y-4 animate-in fade-in duration-200">
                  {/* Bio */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      معرفی کوتاه / بایو (اختیاری)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="یک یا دو جمله درباره زمینه کاری، تجربیات یا علایق‌تان بنویسید..."
                      className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs sm:text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>

                  {/* Skills quick chips */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      مهارت‌ها یا ابزارهای مورد استفاده شما (اختیاری)
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
                        placeholder="مهارت دلخواه را تایپ کنید و Enter بزنید..."
                        className="flex-1 rounded-xl border border-slate-200 py-1.5 px-3 text-xs text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSkill(skillInput)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors"
                      >
                        افزودن
                      </button>
                    </div>

                    {formData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {formData.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200"
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

                    <div className="flex flex-wrap gap-1 pt-1">
                      {POPULAR_SKILLS.slice(0, 8).map((skill) => {
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
                  </div>

                  {/* Location & LinkedIn */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        شهر / موقعیت مکانی (اختیاری)
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                        <input
                          type="text"
                          value={formData.location || ''}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="مثال: تهران یا ریموت"
                          className="w-full rounded-xl border border-slate-200 py-2 pr-9 pl-3 text-xs sm:text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        آدرس لینکدین (اختیاری)
                      </label>
                      <div className="relative">
                        <LinkedInIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="url"
                          dir="ltr"
                          value={formData.linkedin_url || ''}
                          onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                          placeholder="https://linkedin.com/in/..."
                          className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-left"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Website / Portfolio */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      وبسایت، گیت‌هاب یا نمونه کار (اختیاری)
                    </label>
                    <input
                      type="url"
                      dir="ltr"
                      value={formData.website_url || ''}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs sm:text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-left"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Friendly Consent & Action Button */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={formData.consent_to_publish}
                  onChange={(e) => setFormData({ ...formData, consent_to_publish: e.target.checked })}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                />
                <span>با نمایش کارتم در دایرکتوری همکلاسی‌های دوره موافقم.</span>
              </label>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-600" />
                  <span>پیش‌نمایش زنده کارت</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-sky-500/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>در حال ثبت...</span>
                    ) : (
                      <>
                        <span>ثبت و معرفی به کلاس 🚀</span>
                        <Send className="w-3.5 h-3.5 rotate-180 -translate-x-0.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};