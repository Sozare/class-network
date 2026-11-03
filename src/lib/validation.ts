import { z } from 'zod';

export const memberRegistrationSchema = z.object({
  full_name: z
    .string()
    .min(2, 'لطفاً نام و نام خانوادگی خود را بنویسید (حداقل ۲ حرف)')
    .max(60, 'نام و نام خانوادگی نمی‌تواند بیش از ۶۰ حرف باشد'),
  professional_title: z
    .string()
    .min(2, 'لطفاً عنوان یا زمینه فعالیت خود را مشخص کنید (مثلاً: برنامه‌نویس، طراح، کارشناس فروش)')
    .max(80, 'عنوان نمی‌تواند بیش از ۸۰ حرف باشد'),
  category: z
    .string()
    .min(1, 'لطفاً دسته‌بندی تخصصی خود را انتخاب کنید'),
  telegram_username: z
    .string()
    .min(1, 'آیدی تلگرام برای ارتباط همکلاسی‌ها الزامی است')
    .refine(
      (val) => /^[a-zA-Z0-9_]{3,32}$/.test(val.replace(/^@/, '').replace(/.*t\.me\//, '')),
      { message: 'آیدی تلگرام نامعتبر است (لطفاً به انگلیسی بنویسید، مانند: my_username)' }
    ),
  instagram_username: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[a-zA-Z0-9._]{1,30}$/.test(val.replace(/^@/, '').replace(/.*instagram\.com\//, '').replace(/\/$/, '')),
      { message: 'آیدی اینستاگرام نامعتبر است (شامل حروف انگلیسی، اعداد یا نقطه)' }
    ),
  bio: z
    .string()
    .max(600, 'متن معرفی نمی‌تواند بیش از ۶۰۰ حرف باشد')
    .optional(),
  profile_photo_url: z
    .string()
    .optional(),
  skills: z
    .array(z.string())
    .max(12, 'حداکثر ۱۲ مهارت مجاز است')
    .optional(),
  consent_to_publish: z
    .boolean()
    .optional(),
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
