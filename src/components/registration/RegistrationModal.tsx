import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Upload, X, AlertCircle, Send, Eye, EyeOff, Edit3, Copy, Check,
  CheckCircle2, MapPin, Trash2, ChevronDown, ChevronUp, Mail, Lock
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { MemberCard } from '../directory/MemberCard';
import { ImageCropperModal } from '../common/ImageCropperModal';
import { LinkedInIcon, InstagramIcon } from '../common/Icons';
import { DEFAULT_CATEGORIES, POPULAR_SKILLS } from '../../lib/constants';
import { memberRegistrationSchema } from '../../lib/validation';
import { memberService } from '../../services/memberService';
import type { Member, RegistrationFormData } from '../../types';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenEditProfile?: () => void;
}

const IRAN_CITIES = [
  'تهران',
  'مشهد',
  'اصفهان',
  'شیراز',
  'تبریز',
  'کرج',
  'اهواز',
  'قم',
  'رشت',
  'کرمانشاه',
  'ارومیه',
  'یزد',
  'همدان',
  'قزوین',
  'ساری',
  'بندرعباس',
  'کرمان',
  'زنجان',
  'سنندج',
  'گرگان',
  'ریموت / دورکاری',
  'خارج از کشور',
];

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenEditProfile,
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
    instagram_username: '',
    website_url: '',
    location: 'تهران',
    private_email: '',
    profile_password: '',
    profile_photo_url: '',
    consent_to_publish: true,
    website_trap: '',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [submittedMember, setSubmittedMember] = useState<Member | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Image Cropper State
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Photo File Pick
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result as string);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    setFormData(prev => ({ ...prev, profile_photo_url: croppedDataUrl }));
    if (fieldErrors.profile_photo_url) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated.profile_photo_url;
        return updated;
      });
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

    if (res.success && res.member) {
      setSubmittedMember(res.member);
      try {
        localStorage.setItem('my_class_profile', JSON.stringify({
          id: res.member.id,
          name: res.member.full_name,
          telegram: res.member.telegram_username,
        }));
      } catch {
        // ignore
      }
      setIsSubmittedSuccess(true);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Confetti optional
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

  // Clean Telegram & Instagram IDs for preview
  const cleanTg = (formData.telegram_username || '').replace(/^@/, '').replace(/.*t\.me\//, '').trim();
  const cleanIg = (formData.instagram_username || '').replace(/^@/, '').replace(/.*instagram\.com\//, '').trim();

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
    instagram_username: cleanIg || undefined,
    linkedin_url: formData.linkedin_url,
    website_url: formData.website_url,
    location: formData.location || 'تهران',
    publication_status: 'pending',
    featured: false,
    consent_to_publish: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const editUrl = submittedMember ? `${window.location.origin}/#edit=${submittedMember.id}` : '';

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={resetFormAndClose}
        title={
          isSubmittedSuccess ? (
            <span className="flex items-center gap-2 text-emerald-600 font-bold">
              <CheckCircle2 className="w-5 h-5" />
              اطلاعات شما با موفقیت ثبت شد
            </span>
          ) : (
            <span className="font-bold text-slate-900 text-base sm:text-lg">
              عضویت در دایرکتوری همکلاسی‌ها
            </span>
          )
        }
        maxWidth="xl"
      >
        {/* Success State */}
        {isSubmittedSuccess && submittedMember ? (
          <div className="py-5 text-center space-y-4 text-right">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto text-center">
              <h3 className="text-lg font-black text-slate-900">
                خوش آمدید، {submittedMember.full_name}! 🎉
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                پروفایل شما ثبت شد و به زودی پس از بررسی ادمین کلاس منتشر خواهد شد.
              </p>
            </div>

            {/* Self-Edit / Delete info box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-right space-y-2 max-w-lg mx-auto">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>ویرایش یا حذف پروفایل در آینده:</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  فعال در همین دستگاه
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                روی همین دستگاه، دکمه <strong>«ویرایش پروفایل من»</strong> در بالای سایت فعال شد. همچنین می‌توانید لینک اختصاصی زیر را ذخیره کنید تا از دستگاه‌های دیگر نیز بتوانید اطلاعاتتان را ویرایش یا حذف کنید:
              </p>
              <div className="flex items-center gap-2 pt-0.5" dir="ltr">
                <input
                  type="text"
                  readOnly
                  value={editUrl}
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-mono select-all text-left"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(editUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold shrink-0 hover:bg-slate-800 transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>کپی شد!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>کپی لینک</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              {onOpenEditProfile && (
                <button
                  type="button"
                  onClick={() => {
                    resetFormAndClose();
                    onOpenEditProfile();
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>مشاهده و ویرایش کارت من</span>
                </button>
              )}
              <button
                onClick={resetFormAndClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs sm:text-sm hover:bg-slate-800 transition-colors shadow-xs"
              >
                مشاهده دایرکتوری همکلاسی‌ها
              </button>
            </div>
          </div>
        ) : (
          <div className="text-right">
            {/* Top Preview/Form switch & Quick Edit Link */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3.5">
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'form'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>فرم عضویت</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'preview'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>پیش‌نمایش کارت</span>
                </button>
              </div>

              {onOpenEditProfile && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenEditProfile();
                  }}
                  className="text-[11px] font-bold text-sky-600 hover:text-sky-700 transition-colors"
                >
                  قبلاً ثبت‌نام کرده‌اید؟ ویرایش پروفایل ←
                </button>
              )}
            </div>

            {/* Form Error Banner */}
            {fieldErrors.form && (
              <div className="mb-3 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{fieldErrors.form}</span>
              </div>
            )}

            {/* Live Preview Tab */}
            {activeTab === 'preview' && (
              <div className="py-2 space-y-4">
                <div className="max-w-sm mx-auto">
                  <MemberCard member={previewMember} onSelect={() => {}} />
                </div>
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('form')}
                    className="px-4 py-1.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-bold hover:bg-sky-100 transition-colors"
                  >
                    ← ادامه تکمیل فرم
                  </button>
                </div>
              </div>
            )}

            {/* Form Tab - Clean, Crisp & Minimal */}
            <form
              onSubmit={handleSubmit}
              className={`space-y-3 ${activeTab === 'preview' ? 'hidden' : 'block'}`}
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

              {/* Row 1: Full Name & Professional Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    نام و نام خانوادگی <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="مثال: علی احمدی"
                    className={`w-full rounded-xl border py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all ${
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
                    عنوان یا تخصص <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.professional_title}
                    onChange={(e) => setFormData({ ...formData, professional_title: e.target.value })}
                    placeholder="مثال: برنامه‌نویس فرانت‌اند، طراح UI..."
                    className={`w-full rounded-xl border py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all ${
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

              {/* Row 2: Category & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    دسته‌بندی <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 py-2 px-3 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white font-medium"
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
                    شهر / موقعیت مکانی
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                    <input
                      type="text"
                      list="city-options"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="انتخاب یا تایپ شهر (مثال: تهران)"
                      className="w-full rounded-xl border border-slate-200 py-2 pr-9 pl-3 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                    <datalist id="city-options">
                      {IRAN_CITIES.map((city) => (
                        <option key={city} value={city} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>

              {/* Row 3: Telegram ID & Compact Croppable Photo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    آیدی تلگرام <span className="text-rose-500">*</span>
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
                      className={`w-full rounded-xl border py-2 pl-8 pr-3 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                        fieldErrors.telegram_username
                          ? 'border-rose-300 focus:ring-rose-500/20'
                          : 'border-slate-200 focus:border-sky-500 focus:ring-sky-500/20'
                      }`}
                    />
                  </div>
                  {fieldErrors.telegram_username && (
                    <p className="mt-1 text-xs text-rose-600 font-semibold">{fieldErrors.telegram_username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    عکس پروفایل (اختیاری و با امکان کراپ)
                  </label>
                  <div className="flex items-center gap-2.5 p-1.5 rounded-xl border border-slate-200 bg-slate-50/70">
                    <Avatar
                      src={formData.profile_photo_url}
                      name={formData.full_name || 'همکلاسی'}
                      size="sm"
                      className="ring-1 ring-white shrink-0"
                    />

                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoSelect}
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                      >
                        <span className="inline-flex items-center gap-1">
                          <Upload className="w-3 h-3 text-slate-500" />
                          <span>{formData.profile_photo_url ? 'تغییر و کراپ' : 'انتخاب و برش عکس'}</span>
                        </span>
                      </button>

                      {formData.profile_photo_url && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          title="حذف عکس"
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4: Private Email & Password (For secure login, editing & deleting) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                    <span>ایمیل شما <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] text-slate-400 font-normal">مخفی در سایت</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      dir="ltr"
                      required
                      value={formData.private_email || ''}
                      onChange={(e) => setFormData({ ...formData, private_email: e.target.value })}
                      placeholder="yourname@gmail.com"
                      className={`w-full rounded-xl border py-2 pl-9 pr-3 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 transition-all ${
                        fieldErrors.private_email
                          ? 'border-rose-300 focus:ring-rose-500/20'
                          : 'border-slate-200 focus:border-sky-500 focus:ring-sky-500/20'
                      }`}
                    />
                  </div>
                  {fieldErrors.private_email && (
                    <p className="mt-1 text-xs text-rose-600 font-semibold">{fieldErrors.private_email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                    <span>رمز عبور ویرایش <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] text-sky-600 font-normal">به خاطر بسپارید</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      dir="ltr"
                      required
                      value={formData.profile_password || ''}
                      onChange={(e) => setFormData({ ...formData, profile_password: e.target.value })}
                      placeholder="حداقل ۴ کاراکتر"
                      className={`w-full rounded-xl border py-2 pl-9 pr-9 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 transition-all ${
                        fieldErrors.profile_password
                          ? 'border-rose-300 focus:ring-rose-500/20'
                          : 'border-slate-200 focus:border-sky-500 focus:ring-sky-500/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      title={showPassword ? 'مخفی کردن رمز' : 'نمایش رمز'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.profile_password && (
                    <p className="mt-1 text-xs text-rose-600 font-semibold">{fieldErrors.profile_password}</p>
                  )}
                </div>
              </div>

              {/* Collapsible Details (Bio, Skills, Instagram & LinkedIn) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between py-2 px-3 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100/70 hover:bg-slate-100 transition-colors"
                >
                  <span>{showAdvanced ? 'بستن اطلاعات تکمیلی' : '➕ افزودن معرفی، مهارت، اینستاگرام یا لینکدین (اختیاری)'}</span>
                  {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showAdvanced && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3 animate-in fade-in duration-150">
                    {/* Bio */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        معرفی کوتاه / بایو
                      </label>
                      <textarea
                        rows={2}
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="یک یا دو خط درباره خودتان بنویسید..."
                        className="w-full rounded-xl border border-slate-200 py-1.5 px-3 text-xs text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white"
                      />
                    </div>

                    {/* Skills quick chips */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        مهارت‌ها
                      </label>
                      <div className="flex items-center gap-2 mb-1.5">
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
                          placeholder="مهارت را تایپ کنید و Enter بزنید..."
                          className="flex-1 rounded-xl border border-slate-200 py-1.5 px-3 text-xs text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSkill(skillInput)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
                        >
                          افزودن
                        </button>
                      </div>

                      {formData.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-1.5">
                          {formData.skills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200"
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

                      <div className="flex flex-wrap gap-1">
                        {POPULAR_SKILLS.slice(0, 6).map((skill) => {
                          const isAdded = formData.skills.includes(skill);
                          if (isAdded) return null;
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => handleAddSkill(skill)}
                              className="text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                              + {skill}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Socials: Instagram & LinkedIn */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Instagram */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          آیدی اینستاگرام
                        </label>
                        <div className="relative">
                          <InstagramIcon className="w-3.5 h-3.5 text-pink-500 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            dir="ltr"
                            value={formData.instagram_username || ''}
                            onChange={(e) => setFormData({ ...formData, instagram_username: e.target.value })}
                            placeholder="username"
                            className="w-full rounded-xl border border-slate-200 py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 bg-white text-left"
                          />
                        </div>
                        {fieldErrors.instagram_username && (
                          <p className="mt-1 text-xs text-rose-600 font-semibold">{fieldErrors.instagram_username}</p>
                        )}
                      </div>

                      {/* LinkedIn */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          آدرس لینکدین
                        </label>
                        <div className="relative">
                          <LinkedInIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="url"
                            dir="ltr"
                            value={formData.linkedin_url || ''}
                            onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                            placeholder="https://linkedin.com/in/..."
                            className="w-full rounded-xl border border-slate-200 py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white text-left"
                          />
                        </div>
                        {fieldErrors.linkedin_url && (
                          <p className="mt-1 text-xs text-rose-600 font-semibold">{fieldErrors.linkedin_url}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={formData.consent_to_publish}
                    onChange={(e) => setFormData({ ...formData, consent_to_publish: e.target.checked })}
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                  />
                  <span>با نمایش کارتم در دایرکتوری موافقم.</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-sky-600 to-telegram-brand hover:from-sky-500 hover:to-sky-600 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-sm shadow-sky-500/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>در حال ثبت...</span>
                    ) : (
                      <>
                        <span>ثبت کارت 🚀</span>
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

      {/* Embedded Cropper Modal */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        imageSrc={rawImageSrc}
        onClose={() => setIsCropperOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </>
  );
};
