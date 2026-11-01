import { z } from 'zod';

export const memberRegistrationSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name must not exceed 60 characters'),
  professional_title: z
    .string()
    .min(3, 'Professional title must be at least 3 characters')
    .max(80, 'Professional title must not exceed 80 characters'),
  category: z
    .string()
    .min(1, 'Please select a professional category'),
  bio: z
    .string()
    .min(15, 'Please provide a short intro of at least 15 characters')
    .max(600, 'Intro must not exceed 600 characters'),
  profile_photo_url: z
    .string()
    .min(1, 'A profile photo is required'),
  skills: z
    .array(z.string())
    .min(1, 'Please add at least one skill')
    .max(12, 'Maximum of 12 skills allowed'),
  consent_to_publish: z
    .boolean()
    .refine((val) => val === true, {
      message: 'You must consent to publish your profile information',
    }),
  telegram_username: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[a-zA-Z0-9_]{3,32}$/.test(val.replace(/^@/, '').replace(/.*t\.me\//, '')),
      { message: 'Enter a valid Telegram username (letters, numbers, underscore)' }
    ),
  linkedin_url: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === '' || /^https?:\/\/(www\.)?linkedin\.com\/.*$/i.test(val),
      { message: 'Must be a valid LinkedIn URL (https://linkedin.com/...)' }
    ),
  website_url: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === '' || /^https?:\/\/.+/i.test(val),
      { message: 'Must be a valid web URL starting with https:// or http://' }
    ),
  location: z
    .string()
    .max(70, 'Location must not exceed 70 characters')
    .optional(),
  private_email: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      { message: 'Please enter a valid email address' }
    ),
  collaboration_goals: z
    .string()
    .max(500, 'Collaboration goals must not exceed 500 characters')
    .optional(),
  can_help_with: z
    .string()
    .max(500, 'Help description must not exceed 500 characters')
    .optional(),
  interests: z
    .array(z.string())
    .optional(),
  website_trap: z
    .string()
    .optional(),
});

export type MemberRegistrationFormValues = z.infer<typeof memberRegistrationSchema>;
