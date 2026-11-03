import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/directory/Hero';
import { DirectoryFilters } from './components/directory/DirectoryFilters';
import { MemberGrid } from './components/directory/MemberGrid';
import { MemberDetailModal } from './components/directory/MemberDetailModal';
import { RegistrationModal } from './components/registration/RegistrationModal';
import { EditMyProfileModal } from './components/profile/EditMyProfileModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DbGuideModal } from './components/common/DbGuideModal';
import { memberService } from './services/memberService';
import { authService } from './services/authService';
import type { Member, FilterState } from './types';

export const App: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [totalPublished, setTotalPublished] = useState<number>(0);
  const [totalSkills, setTotalSkills] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'all',
    selectedSkills: [],
    hasTelegramOnly: false,
    sortBy: 'recent',
  });

  // Modals & Navigation state
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isAdminViewOpen, setIsAdminViewOpen] = useState<boolean>(false);
  const [isDbGuideOpen, setIsDbGuideOpen] = useState<boolean>(false);

  // User Self-Management state (edit/delete my profile)
  const [myProfile, setMyProfile] = useState<{ id: string; name: string } | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [editMemberId, setEditMemberId] = useState<string | null>(null);

  // Load published members
  const loadPublishedMembers = useCallback(async () => {
    setIsLoading(true);
    const data = await memberService.getPublishedMembers(filters);
    setMembers(data);

    // Compute stats
    const stats = await memberService.getDirectoryStats();
    setTotalPublished(stats.totalPublished);
    setTotalSkills(stats.totalSkillsCount);
    setIsLoading(false);
  }, [filters]);

  useEffect(() => {
    loadPublishedMembers();
  }, [loadPublishedMembers]);

  // Check auth state & user's stored profile on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('my_class_profile');
      if (saved) {
        setMyProfile(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleOpenAdmin = async () => {
    const isAuth = await authService.isAuthenticated();
    if (isAuth) {
      setIsAdminViewOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  // Handle URL routing (#admin, #manage, ?admin=true, #edit=..., #register, #member-<id>)
  useEffect(() => {
    const handleHash = async () => {
      const hash = window.location.hash.toLowerCase();
      const urlParams = new URLSearchParams(window.location.search);
      const hasAdminParam = urlParams.has('admin');

      if (hash === '#admin' || hash === '#manage' || hash === '#panel' || hasAdminParam) {
        const isAuth = await authService.isAuthenticated();
        if (isAuth) {
          setIsAdminViewOpen(true);
        } else {
          setIsAdminLoginOpen(true);
        }
      } else if (hash.startsWith('#edit=')) {
        const targetId = window.location.hash.replace('#edit=', '');
        if (targetId) {
          setEditMemberId(targetId);
          setIsEditProfileOpen(true);
        }
      } else if (hash === '#edit') {
        const saved = localStorage.getItem('my_class_profile');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setEditMemberId(parsed.id);
            setIsEditProfileOpen(true);
          } catch {
            setIsRegisterOpen(true);
          }
        } else {
          setIsRegisterOpen(true);
        }
      } else if (hash === '#register') {
        setIsRegisterOpen(true);
      } else if (hash.startsWith('#member-')) {
        const memberId = hash.replace('#member-', '');
        const found = await memberService.getMemberById(memberId);
        if (found) {
          setSelectedMember(found);
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Secret keyboard shortcut for admin (Ctrl + Shift + A or Alt + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') || (e.altKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        handleOpenAdmin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAdminLoginSuccess = () => {
    setIsAdminViewOpen(true);
  };

  const handleAdminLogout = async () => {
    await authService.logout();
    setIsAdminViewOpen(false);
    window.location.hash = '';
    loadPublishedMembers();
  };

  const handleFilterSkill = (skill: string) => {
    if (!filters.selectedSkills.includes(skill)) {
      setFilters(prev => ({
        ...prev,
        selectedSkills: [...prev.selectedSkills, skill],
      }));
    }
    const el = document.getElementById('directory');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToDirectory = () => {
    const el = document.getElementById('directory');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // If Admin View is active, show the full admin dashboard
  if (isAdminViewOpen) {
    return (
      <AdminDashboard
        onLogout={handleAdminLogout}
        onOpenDbGuide={() => setIsDbGuideOpen(true)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Global Navigation Header - Purely public without admin button */}
      <Header
        memberCount={totalPublished}
        onOpenRegister={() => setIsRegisterOpen(true)}
        myProfile={myProfile}
        onOpenMyProfile={() => {
          setEditMemberId(myProfile?.id || null);
          setIsEditProfileOpen(true);
        }}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Banner with Soft Networking Visual & Divider */}
        <Hero
          memberCount={totalPublished}
          skillsCount={totalSkills}
          onOpenRegister={() => setIsRegisterOpen(true)}
          onScrollToDirectory={handleScrollToDirectory}
          onOpenEditProfile={() => {
            setEditMemberId(myProfile?.id || null);
            setIsEditProfileOpen(true);
          }}
        />

        {/* Directory Explorer Section with Search & Category Filters */}
        <div id="directory" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          {/* Restored Search & Filter Bar */}
          <DirectoryFilters
            filters={filters}
            onFilterChange={setFilters}
            totalResults={members.length}
          />

          {/* Members Responsive Grid */}
          <MemberGrid
            members={members}
            isLoading={isLoading}
            onSelectMember={(m) => setSelectedMember(m)}
            onFilterSkill={handleFilterSkill}
            onOpenRegister={() => setIsRegisterOpen(true)}
            onResetFilters={() => setFilters({
              searchQuery: '',
              category: 'all',
              selectedSkills: [],
              hasTelegramOnly: false,
              sortBy: 'recent',
            })}
          />
        </div>
      </main>

      {/* Global Footer - Purely public with Soroush LinkedIn credit */}
      <Footer
        onOpenRegister={() => setIsRegisterOpen(true)}
      />

      {/* Individual Member Profile Modal */}
      <MemberDetailModal
        member={selectedMember}
        isOpen={Boolean(selectedMember)}
        onClose={() => {
          setSelectedMember(null);
          if (window.location.hash.startsWith('#member-')) {
            window.history.pushState(null, '', window.location.pathname);
          }
        }}
        onFilterSkill={handleFilterSkill}
        onOpenEditProfile={(targetMemberId) => {
          setEditMemberId(targetMemberId);
          setIsEditProfileOpen(true);
        }}
      />

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => {
          setIsRegisterOpen(false);
          if (window.location.hash === '#register') {
            window.history.pushState(null, '', window.location.pathname);
          }
        }}
        onOpenEditProfile={() => {
          setIsRegisterOpen(false);
          setEditMemberId(myProfile?.id || null);
          setIsEditProfileOpen(true);
        }}
        onSuccess={() => {
          loadPublishedMembers();
          try {
            const saved = localStorage.getItem('my_class_profile');
            if (saved) setMyProfile(JSON.parse(saved));
          } catch {
            // ignore
          }
        }}
      />

      {/* Self-Management: Edit/Delete My Profile Modal */}
      <EditMyProfileModal
        isOpen={isEditProfileOpen}
        memberId={editMemberId || myProfile?.id || null}
        onClose={() => {
          setIsEditProfileOpen(false);
          if (window.location.hash.startsWith('#edit')) {
            window.history.pushState(null, '', window.location.pathname);
          }
        }}
        onOpenRegister={() => {
          setIsEditProfileOpen(false);
          setIsRegisterOpen(true);
        }}
        onUpdated={() => {
          loadPublishedMembers();
          try {
            const saved = localStorage.getItem('my_class_profile');
            if (saved) {
              const parsed = JSON.parse(saved);
              setMyProfile(parsed);
              setEditMemberId(parsed.id);
            } else {
              setMyProfile(null);
            }
          } catch {
            // ignore
          }
        }}
        onDeleted={() => {
          setMyProfile(null);
          setEditMemberId(null);
          loadPublishedMembers();
        }}
      />

      {/* Admin Login Modal (Triggered by Secret URL / Shortcut) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => {
          setIsAdminLoginOpen(false);
          if (window.location.hash.toLowerCase() === '#admin') {
            window.history.pushState(null, '', window.location.pathname);
          }
        }}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Supabase Free Tier Setup Guide Modal */}
      <DbGuideModal
        isOpen={isDbGuideOpen}
        onClose={() => setIsDbGuideOpen(false)}
      />
    </div>
  );
};

export default App;
