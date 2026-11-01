import { z } from 'zod';

export const memberRegistrationSchema = z.object({
  full_name: z
    .string()
    .min(2, 'نام و نام خانوادگی باید حداقل ۲ حرف باشد')
    .max(60, 'نام و نام خانوادگی نمی‌تواند بیش از ۶۰ حرف باشد'),
  professional_title: z
    .string()
    .min(3, 'عنوان حرفه‌ای باید حداقل ۳ حرف باشد')
    .max(80, 'عنوان حرفه‌ای نمی‌تواند بیش از ۸۰ حرف باشد'),
  category: z
    .string()
    .min(1, 'لطفاً دسته‌بندی حرفه‌ای خود را انتخاب کنید'),
  bio: z
    .string()
    .min(15, 'لطفاً معرفی کوتاهی حداقل در ۱۵ حرف بنویسید')
    .max(600, 'متن معرفی نمی‌تواند بیش از ۶۰۰ حرف باشد'),
  profile_photo_url: z
    .string()
    .min(1, 'آپلود تصویر پروفایل الزامی است'),
  skills: z
    .array(z.string())
    .min(1, 'لطفاً حداقل ۱ مهارت یا تخصص اضافه کنید')
    .max(12, 'حداکثر ۱۲ مهارت مجاز است'),
  consent_to_publish: z
    .boolean()
    .refine((val) => val === true, {
      message: 'تایید رضایت انتشار عمومی اطلاعات الزامی است',
    }),
  telegram_username: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[a-zA-Z0-9_]{3,32}$/.test(val.replace(/^@/, '').replace(/.*t\.me\//, '')),
      { message: 'آیدی تلگرام معتبر نیست (شامل حروف انگلیسی، اعداد یا خط زیرین)' }
    ),
  linkedin_url: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === '' || /^https?:\/\/(www\.)?linkedin\.com\/.*$/i.test(val),
      { message: 'آدرس لینکدین معتبر نیست (باید با https://linkedin.com شروع شود)' }
    ),
  website_url: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === '' || /^https?:\/\/.+/i.test(val),
      { message: 'آدرس وبسایت باید با http:// یا https:// شروع شود' }
    ),
  location: z
    .string()
    .max(70, 'موقعیت مکانی نباید بیش از ۷۰ حرف باشد')
    .optional(),
  private_email: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      { message: 'لطفاً یک ایمیل معتبر وارد کنید' }
    ),
  collaboration_goals: z
    .string()
    .max(500, 'توضیحات همکاری نباید بیش از ۵۰۰ حرف باشد')
    .optional(),
  can_help_with: z
    .string()
    .max(500, 'توضیحات کمک به دیگران نباید بیش از ۵۰۰ حرف باشد')
    .optional(),
  interests: z
    .array(z.string())
    .optional(),
  website_trap: z
    .string()
    .optional(),
});

export type MemberRegistrationFormValues = z.infer<typeof memberRegistrationSchema>;
