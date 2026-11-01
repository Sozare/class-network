import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/directory/Hero';
import { DirectoryFilters } from './components/directory/DirectoryFilters';
import { MemberGrid } from './components/directory/MemberGrid';
import { MemberDetailModal } from './components/directory/MemberDetailModal';
import { RegistrationModal } from './components/registration/RegistrationModal';
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
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [isDbGuideOpen, setIsDbGuideOpen] = useState<boolean>(false);

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

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      const auth = await authService.isAuthenticated();
      setIsAdminLoggedIn(auth);
    };
    checkAuth();
  }, []);

  // Handle URL hash routing (e.g. #admin, #register, #member-<id>)
  useEffect(() => {
    const handleHash = async () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        const isAuth = await authService.isAuthenticated();
        if (isAuth) {
          setIsAdminViewOpen(true);
        } else {
          setIsAdminLoginOpen(true);
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

  const handleOpenAdmin = async () => {
    const isAuth = await authService.isAuthenticated();
    if (isAuth) {
      setIsAdminViewOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setIsAdminViewOpen(true);
  };

  const handleAdminLogout = async () => {
    await authService.logout();
    setIsAdminLoggedIn(false);
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
    // Scroll to directory
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
      {/* Global Navigation Header */}
      <Header
        memberCount={totalPublished}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        onOpenDbGuide={() => setIsDbGuideOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Banner */}
        <Hero
          memberCount={totalPublished}
          skillsCount={totalSkills}
          onOpenRegister={() => setIsRegisterOpen(true)}
          onScrollToDirectory={handleScrollToDirectory}
        />

        {/* Directory Explorer Section */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          {/* Search, Filter Pills & Sort Controls */}
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

      {/* Global Footer */}
      <Footer
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        onOpenDbGuide={() => setIsDbGuideOpen(true)}
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
        onSuccess={() => {
          loadPublishedMembers();
        }}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
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
