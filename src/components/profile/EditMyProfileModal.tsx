import React, { useState, useEffect, useRef } from 'react';
import {
  AlertCircle, Save, Trash2, Upload, MapPin, CheckCircle2, RefreshCw
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { ImageCropperModal } from '../common/ImageCropperModal';
import { InstagramIcon } from '../common/Icons';
import { DEFAULT_CATEGORIES } from '../../lib/constants';
import { memberService } from '../../services/memberService';
import type { Member } from '../../types';

interface EditMyProfileModalProps {
  isOpen: boolean;
  memberId: string | null;
  onClose: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
}

const IRAN_CITIES = [
  'تهران', 'مشهد', 'اصفهان', 'شیراز', 'تبریز', 'کرج', 'اهواز', 'قم',
  'رشت', 'کرمانشاه', 'ارومیه', 'یزد', 'همدان', 'قزوین', 'ساری',
  'بندرعباس', 'کرمان', 'زنجان', 'سنندج', 'گرگان', 'ریموت / دورکاری', 'خارج از کشور'
];

export const EditMyProfileModal: React.FC<EditMyProfileModalProps> = ({
  isOpen,
  memberId,
  onClose,
  onUpdated,
  onDeleted,
}) => {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [instagramUsername, setInstagramUsername] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Image Cropper State
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch member data when modal opens
  useEffect(() => {
    if (isOpen && memberId) {
      setIsLoading(true);
      setError(null);
      setSuccessMsg(null);
      memberService.getMemberById(memberId).then((data) => {
        setIsLoading(false);
        if (data) {
          setMember(data);
          setFullName(data.full_name || '');
          setProfessionalTitle(data.professional_title || '');
          setCategory(data.category || DEFAULT_CATEGORIES[1]?.name || 'مهندسی نرم‌افزار و برنامه‌نویسی');
          setLocation(data.location || 'تهران');
          setTelegramUsername(data.telegram_username || '');
          setInstagramUsername(data.instagram_username || '');
          setBio(data.bio || '');
          setPhotoUrl(data.profile_photo_url || '');
        } else {
          setError('پروفایل یافت نشد یا ممکن است قبلاً حذف شده باشد.');
        }
      });
    }
  }, [isOpen, memberId]);

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
    setPhotoUrl(croppedDataUrl);
  };

  // Save updates
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) return;

    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    let cleanTg = telegramUsername.trim();
    if (cleanTg.startsWith('@')) cleanTg = cleanTg.substring(1);
    if (cleanTg.includes('t.me/')) cleanTg = cleanTg.split('t.me/')[1]?.replace('/', '') || '';

    let cleanIg = instagramUsername.trim();
    if (cleanIg.startsWith('@')) cleanIg = cleanIg.substring(1);
    if (cleanIg.includes('instagram.com/')) cleanIg = cleanIg.split('instagram.com/')[1]?.replace(/\/$/, '') || '';

    const success = await memberService.updateMember(memberId, {
      full_name: fullName.trim(),
      professional_title: professionalTitle.trim(),
      category: category,
      location: location.trim(),
      telegram_username: cleanTg,
      instagram_username: cleanIg,
      bio: bio.trim(),
      profile_photo_url: photoUrl,
    });

    setIsSaving(false);

    if (success) {
      setSuccessMsg('تغییرات با موفقیت ذخیره شد!');
      // Update local storage cache
      try {
        localStorage.setItem('my_class_profile', JSON.stringify({
          id: memberId,
          name: fullName.trim(),
          telegram: cleanTg,
        }));
      } catch {
        // ignore
      }
      onUpdated();
      setTimeout(() => {
        onClose();
      }, 900);
    } else {
      setError('خطایی در ذخیره تغییرات رخ داد. لطفاً دوباره تلاش کنید.');
    }
  };

  // Delete profile
  const handleDelete = async () => {
    if (!memberId) return;
    const confirmDelete = window.confirm('آیا مطمئن هستید که می‌خواهید پروفایل خود را برای همیشه حذف کنید؟ این عمل غیرقابل بازگشت است.');
    if (!confirmDelete) return;

    setIsDeleting(true);
    const success = await memberService.deleteMember(memberId);
    setIsDeleting(false);

    if (success) {
      try {
        localStorage.removeItem('my_class_profile');
      } catch {
        // ignore
      }
      onDeleted();
      onClose();
    } else {
      setError('خطایی در حذف پروفایل رخ داد.');
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <span className="font-bold text-slate-900 text-base sm:text-lg">
            ویرایش یا حذف پروفایل من
          </span>
        }
        maxWidth="lg"
      >
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
            <span>در حال فراخوانی مشخصات پروفایل شما...</span>
          </div>
        ) : error && !member ? (
          <div className="py-6 text-center space-y-3 text-right">
            <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-xl">
              {error}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-700"
            >
              بستن
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-3.5 text-right">
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Photo & Identity Header */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <Avatar
                src={photoUrl}
                name={fullName || 'همکلاسی'}
                size="md"
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
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                >
                  <Upload className="w-3 h-3 text-slate-500" />
                  <span>تغییر و کراپ عکس</span>
                </button>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    title="حذف تصویر"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Row 1: Name & Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  نام و نام خانوادگی
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  عنوان یا تخصص
                </label>
                <input
                  type="text"
                  required
                  value={professionalTitle}
                  onChange={(e) => setProfessionalTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            {/* Row 2: Category & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  دسته‌بندی
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white"
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
                    list="edit-cities"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2 pr-9 pl-3 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                  <datalist id="edit-cities">
                    {IRAN_CITIES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            {/* Row 3: Telegram ID & Instagram */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2 pl-8 pr-3 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  آیدی اینستاگرام (اختیاری)
                </label>
                <div className="relative">
                  <InstagramIcon className="w-4 h-4 text-pink-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    dir="ltr"
                    value={instagramUsername}
                    onChange={(e) => setInstagramUsername(e.target.value)}
                    placeholder="username"
                    className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-800 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                معرفی کوتاه / بایو (اختیاری)
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs sm:text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            {/* Actions: Save & Delete */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'در حال حذف...' : 'حذف پروفایل من'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
                >
                  انصراف
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-slate-800 transition-all shadow-xs disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* Embedded Cropper for Image Upload */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        imageSrc={rawImageSrc}
        onClose={() => setIsCropperOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </>
  );
};
