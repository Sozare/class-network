export type PublicationStatus = 'pending' | 'approved' | 'rejected' | 'archived';

export interface Member {
  id: string;
  full_name: string;
  professional_title: string;
  bio: string;
  profile_photo_url: string;
  category: string;
  skills: string[];
  interests?: string[];
  collaboration_goals?: string;
  can_help_with?: string;
  telegram_username?: string;
  linkedin_url?: string;
  website_url?: string;
  location?: string;
  private_email?: string; // Only visible to admin
  publication_status: PublicationStatus;
  featured: boolean;
  consent_to_publish: boolean;
  is_demo?: boolean; // Marker for sample development profiles
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  selectedSkills: string[];
  hasTelegramOnly: boolean;
  sortBy: 'recent' | 'name' | 'featured';
}

export interface RegistrationFormData {
  full_name: string;
  professional_title: string;
  category: string;
  bio: string;
  skills: string[];
  interests?: string[];
  collaboration_goals?: string;
  can_help_with?: string;
  telegram_username?: string;
  linkedin_url?: string;
  website_url?: string;
  location?: string;
  private_email?: string;
  profile_photo_url: string;
  consent_to_publish: boolean;
  // Honeypot field for anti-spam bots
  website_trap?: string;
}

export interface DirectoryStats {
  totalPublished: number;
  totalPending: number;
  totalRejected: number;
  totalSkillsCount: number;
  categoriesCount: Record<string, number>;
}
