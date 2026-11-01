import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Member, PublicationStatus, RegistrationFormData, FilterState, DirectoryStats } from '../types';
import { DEMO_MEMBERS } from '../lib/constants';

const LOCAL_STORAGE_KEY = 'class_network_members_v1';

function getStoredMembers(): Member[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEMO_MEMBERS));
      return DEMO_MEMBERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read from localStorage:', err);
    return DEMO_MEMBERS;
  }
}

function saveStoredMembers(members: Member[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(members));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export const memberService = {
  /**
   * Fetch approved members for the public directory with filtering and searching
   */
  async getPublishedMembers(filter?: Partial<FilterState>): Promise<Member[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('members')
          .select('id, full_name, professional_title, bio, profile_photo_url, category, skills, interests, collaboration_goals, can_help_with, telegram_username, linkedin_url, website_url, location, publication_status, featured, created_at, updated_at')
          .eq('publication_status', 'approved');

        if (filter?.category && filter.category !== 'all') {
          query = query.ilike('category', `%${filter.category}%`);
        }

        if (filter?.searchQuery) {
          const s = filter.searchQuery.trim();
          query = query.or(`full_name.ilike.%${s}%,professional_title.ilike.%${s}%,bio.ilike.%${s}%,category.ilike.%${s}%`);
        }

        if (filter?.sortBy === 'name') {
          query = query.order('full_name', { ascending: true });
        } else if (filter?.sortBy === 'featured') {
          query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;
        if (error) {
          console.warn('Supabase query failed, falling back to local storage:', error.message);
          return this.getPublishedMembersLocal(filter);
        }

        let results = (data as Member[]) || [];

        // Apply in-memory skill filtering if array filtering in Supabase isn't indexed
        if (filter?.selectedSkills && filter.selectedSkills.length > 0) {
          results = results.filter(m =>
            filter.selectedSkills!.every(sk =>
              m.skills?.some(s => s.toLowerCase() === sk.toLowerCase())
            )
          );
        }

        if (filter?.hasTelegramOnly) {
          results = results.filter(m => Boolean(m.telegram_username && m.telegram_username.trim().length > 0));
        }

        return results;
      } catch (err) {
        console.warn('Error querying Supabase:', err);
        return this.getPublishedMembersLocal(filter);
      }
    }

    return this.getPublishedMembersLocal(filter);
  },

  getPublishedMembersLocal(filter?: Partial<FilterState>): Member[] {
    const all = getStoredMembers();
    let approved = all.filter(m => m.publication_status === 'approved');

    if (filter?.category && filter.category !== 'all') {
      const target = filter.category.toLowerCase().replace(/[-\s]/g, '');
      approved = approved.filter(m => {
        const itemCat = m.category.toLowerCase().replace(/[-\s]/g, '');
        return itemCat.includes(target) || target.includes(itemCat);
      });
    }

    if (filter?.searchQuery && filter.searchQuery.trim().length > 0) {
      const q = filter.searchQuery.trim().toLowerCase();
      approved = approved.filter(m =>
        m.full_name.toLowerCase().includes(q) ||
        m.professional_title.toLowerCase().includes(q) ||
        m.bio.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.skills.some(s => s.toLowerCase().includes(q)) ||
        (m.location && m.location.toLowerCase().includes(q)) ||
        (m.interests && m.interests.some(i => i.toLowerCase().includes(q)))
      );
    }

    if (filter?.selectedSkills && filter.selectedSkills.length > 0) {
      approved = approved.filter(m =>
        filter.selectedSkills!.every(sk =>
          m.skills?.some(s => s.toLowerCase() === sk.toLowerCase())
        )
      );
    }

    if (filter?.hasTelegramOnly) {
      approved = approved.filter(m => Boolean(m.telegram_username && m.telegram_username.trim().length > 0));
    }

    // Sort
    if (filter?.sortBy === 'name') {
      approved.sort((a, b) => a.full_name.localeCompare(b.full_name));
    } else if (filter?.sortBy === 'featured') {
      approved.sort((a, b) => {
        if (a.featured === b.featured) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return a.featured ? -1 : 1;
      });
    } else {
      approved.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return approved;
  },

  /**
   * Get single member details
   */
  async getMemberById(id: string): Promise<Member | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('members')
          .select('id, full_name, professional_title, bio, profile_photo_url, category, skills, interests, collaboration_goals, can_help_with, telegram_username, linkedin_url, website_url, location, publication_status, featured, created_at, updated_at')
          .eq('id', id)
          .single();

        if (error) {
          console.warn('Supabase getMemberById error:', error.message);
          return this.getMemberByIdLocal(id);
        }
        return data as Member;
      } catch (err) {
        console.warn('Error fetching member:', err);
        return this.getMemberByIdLocal(id);
      }
    }
    return this.getMemberByIdLocal(id);
  },

  getMemberByIdLocal(id: string): Member | null {
    const all = getStoredMembers();
    return all.find(m => m.id === id) || null;
  },

  /**
   * Submit registration for moderation
   */
  async submitMemberRegistration(formData: RegistrationFormData): Promise<{ success: boolean; member?: Member; error?: string }> {
    // 1. Anti-spam honeypot check
    if (formData.website_trap && formData.website_trap.trim().length > 0) {
      return { success: false, error: 'Spam submission detected.' };
    }

    // 2. Validate mandatory consent
    if (!formData.consent_to_publish) {
      return { success: false, error: 'Consent to publish profile is required.' };
    }

    // 3. Clean and sanitize data
    let cleanTelegram = formData.telegram_username?.trim() || '';
    if (cleanTelegram.startsWith('@')) {
      cleanTelegram = cleanTelegram.substring(1);
    }
    if (cleanTelegram.includes('t.me/')) {
      cleanTelegram = cleanTelegram.split('t.me/')[1]?.replace('/', '') || '';
    }

    const newMember: Member = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      full_name: formData.full_name.trim(),
      professional_title: formData.professional_title.trim(),
      bio: formData.bio.trim(),
      profile_photo_url: formData.profile_photo_url.trim(),
      category: formData.category,
      skills: formData.skills.map(s => s.trim()).filter(Boolean),
      interests: formData.interests || [],
      collaboration_goals: formData.collaboration_goals?.trim() || undefined,
      can_help_with: formData.can_help_with?.trim() || undefined,
      telegram_username: cleanTelegram || undefined,
      linkedin_url: formData.linkedin_url?.trim() || undefined,
      website_url: formData.website_url?.trim() || undefined,
      location: formData.location?.trim() || undefined,
      private_email: formData.private_email?.trim() || undefined,
      publication_status: 'pending', // ALWAYS pending until admin review!
      featured: false,
      consent_to_publish: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('members')
          .insert([
            {
              full_name: newMember.full_name,
              professional_title: newMember.professional_title,
              bio: newMember.bio,
              profile_photo_url: newMember.profile_photo_url,
              category: newMember.category,
              skills: newMember.skills,
              interests: newMember.interests,
              collaboration_goals: newMember.collaboration_goals,
              can_help_with: newMember.can_help_with,
              telegram_username: newMember.telegram_username,
              linkedin_url: newMember.linkedin_url,
              website_url: newMember.website_url,
              location: newMember.location,
              private_email: newMember.private_email,
              publication_status: 'pending',
              featured: false,
              consent_to_publish: true,
            }
          ])
          .select()
          .single();

        if (error) {
          console.warn('Supabase submission insert failed, falling back to local storage:', error.message);
          this.saveSubmissionLocal(newMember);
          return { success: true, member: newMember };
        }

        return { success: true, member: data as Member };
      } catch (err: unknown) {
        console.warn('Supabase submission failed:', err);
        this.saveSubmissionLocal(newMember);
        return { success: true, member: newMember };
      }
    }

    this.saveSubmissionLocal(newMember);
    return { success: true, member: newMember };
  },

  saveSubmissionLocal(member: Member): void {
    const list = getStoredMembers();
    list.unshift(member);
    saveStoredMembers(list);
  },

  /**
   * Admin: fetch all submissions with optional status filter
   */
  async getAllSubmissions(status?: PublicationStatus): Promise<Member[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('members')
          .select('*')
          .order('created_at', { ascending: false });

        if (status) {
          query = query.eq('publication_status', status);
        }

        const { data, error } = await query;
        if (error) {
          console.warn('Supabase getAllSubmissions error:', error.message);
          return this.getAllSubmissionsLocal(status);
        }
        return (data as Member[]) || [];
      } catch (err) {
        console.warn('Supabase error:', err);
        return this.getAllSubmissionsLocal(status);
      }
    }
    return this.getAllSubmissionsLocal(status);
  },

  getAllSubmissionsLocal(status?: PublicationStatus): Member[] {
    const all = getStoredMembers();
    if (status) {
      return all.filter(m => m.publication_status === status);
    }
    return all;
  },

  /**
   * Admin: approve, reject, or archive a member
   */
  async updateMemberStatus(id: string, status: PublicationStatus): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('members')
          .update({ publication_status: status, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (!error) return true;
        console.warn('Supabase status update error:', error.message);
      } catch (err) {
        console.warn('Supabase error:', err);
      }
    }

    const all = getStoredMembers();
    const idx = all.findIndex(m => m.id === id);
    if (idx !== -1) {
      all[idx] = {
        ...all[idx],
        publication_status: status,
        updated_at: new Date().toISOString()
      };
      saveStoredMembers(all);
      return true;
    }
    return false;
  },

  /**
   * Admin: edit profile information
   */
  async updateMember(id: string, updates: Partial<Member>): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('members')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (!error) return true;
        console.warn('Supabase updateMember error:', error.message);
      } catch (err) {
        console.warn('Supabase error:', err);
      }
    }

    const all = getStoredMembers();
    const idx = all.findIndex(m => m.id === id);
    if (idx !== -1) {
      all[idx] = {
        ...all[idx],
        ...updates,
        updated_at: new Date().toISOString()
      };
      saveStoredMembers(all);
      return true;
    }
    return false;
  },

  /**
   * Admin: toggle featured badge
   */
  async toggleFeatured(id: string, featured: boolean): Promise<boolean> {
    return this.updateMember(id, { featured });
  },

  /**
   * Admin: permanently delete profile
   */
  async deleteMember(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('members')
          .delete()
          .eq('id', id);

        if (!error) return true;
        console.warn('Supabase deleteMember error:', error.message);
      } catch (err) {
        console.warn('Supabase error:', err);
      }
    }

    const all = getStoredMembers();
    const filtered = all.filter(m => m.id !== id);
    saveStoredMembers(filtered);
    return true;
  },

  /**
   * Get stats for directory header and admin overview
   */
  async getDirectoryStats(): Promise<DirectoryStats> {
    const all = isSupabaseConfigured && supabase
      ? await this.getAllSubmissions()
      : getStoredMembers();

    const published = all.filter(m => m.publication_status === 'approved');
    const pending = all.filter(m => m.publication_status === 'pending');
    const rejected = all.filter(m => m.publication_status === 'rejected');

    const skillsSet = new Set<string>();
    const categoriesCount: Record<string, number> = {};

    published.forEach(m => {
      m.skills.forEach(s => skillsSet.add(s.toLowerCase()));
      const cat = m.category || 'Other';
      categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
    });

    return {
      totalPublished: published.length,
      totalPending: pending.length,
      totalRejected: rejected.length,
      totalSkillsCount: skillsSet.size,
      categoriesCount,
    };
  },

  /**
   * Reset / Seed sample profiles for testing
   */
  resetToDemoData(): void {
    saveStoredMembers(DEMO_MEMBERS);
  },

  /**
   * Clear all demo-tagged profiles before production launch
   */
  clearDemoData(): void {
    const all = getStoredMembers();
    const productionOnly = all.filter(m => !m.is_demo);
    saveStoredMembers(productionOnly);
  }
};
