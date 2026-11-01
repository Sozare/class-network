import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { APP_CONFIG } from '../lib/constants';

export async function uploadProfilePhoto(file: File): Promise<{ url: string; error?: string }> {
  // 1. Validation checks
  if (file.size > APP_CONFIG.maxPhotoSizeBytes) {
    return { url: '', error: 'Image file is too large. Maximum allowed size is 2MB.' };
  }

  if (!APP_CONFIG.allowedImageTypes.includes(file.type)) {
    return { url: '', error: 'Unsupported format. Please upload a JPG, PNG, or WebP image.' };
  }

  // 2. If Supabase is configured, upload to Supabase Storage
  if (isSupabaseConfigured && supabase) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('member-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.warn('Supabase storage upload error, falling back to base64 preview:', uploadError.message);
        // Fallback to Base64 so submission doesn't fail if the bucket isn't created yet
        const base64 = await fileToBase64(file);
        return { url: base64 };
      }

      const { data: publicUrlData } = supabase.storage
        .from('member-photos')
        .getPublicUrl(filePath);

      return { url: publicUrlData.publicUrl };
    } catch (err: unknown) {
      console.warn('Storage error, falling back to base64:', err);
      const base64 = await fileToBase64(file);
      return { url: base64 };
    }
  }

  // 3. Fallback: Base64 data-URL for instant local/demo usability
  const base64 = await fileToBase64(file);
  return { url: base64 };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
