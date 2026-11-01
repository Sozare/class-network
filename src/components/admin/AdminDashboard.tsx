import React, { useState, useEffect } from 'react';
import {
  Shield, Check, X, Edit, Trash2, Star, Search, RefreshCw,
  BarChart3, Users, Clock, AlertTriangle, Download,
  LogOut, Database, Sparkles, Send, ExternalLink
} from 'lucide-react';
import type { Member, DirectoryStats } from '../../types';
import { memberService } from '../../services/memberService';
import { authService } from '../../services/authService';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { EditMemberModal } from './EditMemberModal';
import { isSupabaseConfigured } from '../../lib/supabase';

interface AdminDashboardProps {
  onLogout: () => void;
  onOpenDbGuide?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  onOpenDbGuide,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'stats' | 'database'>('pending');
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<DirectoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberToEdit, setSelectedMemberToEdit] = useState<Member | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const all = await memberService.getAllSubmissions();
    const st = await memberService.getDirectoryStats();
    setMembers(all);
    setStats(st);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleApprove = async (id: string) => {
    const ok = await memberService.updateMemberStatus(id, 'approved');
    if (ok) {
      showFeedback('Member profile approved and published to directory.');
      await loadData();
    }
  };

  const handleReject = async (id: string) => {
    const ok = await memberService.updateMemberStatus(id, 'rejected');
    if (ok) {
      showFeedback('Member profile rejected.');
      await loadData();
    }
  };

  const handleUnpublish = async (id: string) => {
    const ok = await memberService.updateMemberStatus(id, 'pending');
    if (ok) {
      showFeedback('Member profile returned to pending queue.');
      await loadData();
    }
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    const ok = await memberService.toggleFeatured(id, !current);
    if (ok) {
      showFeedback(!current ? 'Member marked as featured.' : 'Featured badge removed.');
      await loadData();
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await memberService.deleteMember(id);
    if (ok) {
      showFeedback('Profile deleted permanently.');
      setDeleteConfirmationId(null);
      await loadData();
    }
  };

  const handleSaveEdit = async (id: string, updates: Partial<Member>) => {
    await memberService.updateMember(id, updates);
    showFeedback('Member profile updated.');
    await loadData();
  };

  const handleSeedDemoData = () => {
    memberService.resetToDemoData();
    showFeedback('Reset and populated sample demo members.');
    loadData();
  };

  const handleClearDemoData = () => {
    if (window.confirm('Are you sure you want to remove all DEMO profiles? Only real submissions will remain.')) {
      memberService.clearDemoData();
      showFeedback('All sample demo profiles removed.');
      loadData();
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(members, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `class-network-directory-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filter members by tab and search
  const filteredMembers = members.filter((m) => {
    const matchesTab =
      activeTab === 'pending'
        ? m.publication_status === 'pending'
        : activeTab === 'approved'
        ? m.publication_status === 'approved'
        : activeTab === 'rejected'
        ? m.publication_status === 'rejected' || m.publication_status === 'archived'
        : true;

    if (!matchesTab) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.full_name.toLowerCase().includes(q) ||
        m.professional_title.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        (m.telegram_username && m.telegram_username.toLowerCase().includes(q))
      );
    }

    return true;
  });

  const pendingCount = members.filter(m => m.publication_status === 'pending').length;
  const approvedCount = members.filter(m => m.publication_status === 'approved').length;
  const demoCount = members.filter(m => m.is_demo).length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Admin Header */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Shield className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">Directory Moderation Portal</h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Admin
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Logged in as <strong className="text-slate-800">{authService.getCurrentUserEmail()}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              title="Refresh submissions"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              title="Export backup as JSON"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-150">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between text-amber-600 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Review</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{pendingCount}</div>
            <p className="text-[11px] text-slate-400">Waiting for approval</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between text-emerald-600 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Published Active</span>
              <Users className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{approvedCount}</div>
            <p className="text-[11px] text-slate-400">Visible on homepage</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between text-sky-600 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Demo Profiles</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{demoCount}</div>
            <p className="text-[11px] text-slate-400">Sample development cards</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between text-purple-600 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Storage Backend</span>
              <Database className="w-4 h-4" />
            </div>
            <div className="text-sm font-extrabold text-slate-900 truncate">
              {isSupabaseConfigured ? 'Supabase Live' : 'Local / Demo Mode'}
            </div>
            <p className="text-[11px] text-slate-400">
              {isSupabaseConfigured ? 'PostgreSQL Database' : 'LocalStorage active'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-2 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTab('pending')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Reviews</span>
              {pendingCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${activeTab === 'pending' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'}`}>
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('approved')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'approved'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Approved Directory</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${activeTab === 'approved' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {approvedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('rejected')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'rejected'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <X className="w-3.5 h-3.5" />
              <span>Rejected Submissions</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'stats'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('database')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'database'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Database Setup</span>
            </button>
          </div>

          {/* Search box within table */}
          {activeTab !== 'stats' && activeTab !== 'database' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by name, role..."
                className="w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-xs text-slate-800 focus:border-sky-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Tab 1, 2, 3: Submissions Table / Cards */}
        {(activeTab === 'pending' || activeTab === 'approved' || activeTab === 'rejected') && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {filteredMembers.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                No profiles found in the <strong className="text-slate-700 capitalize">{activeTab}</strong> queue.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Left: Avatar & Info */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <Avatar
                        src={member.profile_photo_url}
                        name={member.full_name}
                        size="lg"
                        className="border border-slate-200"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm sm:text-base">
                            {member.full_name}
                          </span>
                          <Badge variant="primary">{member.category}</Badge>
                          {member.featured && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> Featured
                            </span>
                          )}
                          {member.is_demo && (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              DEMO
                            </span>
                          )}
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            member.publication_status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : member.publication_status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {member.publication_status}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-600 truncate">
                          {member.professional_title} {member.location ? `· ${member.location}` : ''}
                        </p>

                        <p className="text-xs text-slate-500 line-clamp-1 max-w-2xl">
                          {member.bio}
                        </p>

                        {/* Contact details row */}
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                          {member.telegram_username && (
                            <a
                              href={`https://t.me/${member.telegram_username}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-sky-600 hover:underline font-medium"
                            >
                              <Send className="w-3 h-3 -rotate-12" />
                              <span>@{member.telegram_username}</span>
                            </a>
                          )}
                          {member.private_email && (
                            <span className="text-slate-400">
                              Private email: <strong className="text-slate-600">{member.private_email}</strong>
                            </span>
                          )}
                          <span className="text-slate-400">
                            Submitted: {new Date(member.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Moderation Actions */}
                    <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                      {/* Approve button */}
                      {member.publication_status !== 'approved' && (
                        <button
                          onClick={() => handleApprove(member.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Publish</span>
                        </button>
                      )}

                      {/* Reject button */}
                      {member.publication_status === 'pending' && (
                        <button
                          onClick={() => handleReject(member.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      )}

                      {/* Unpublish */}
                      {member.publication_status === 'approved' && (
                        <button
                          onClick={() => handleUnpublish(member.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                          title="Move back to pending review"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Unpublish</span>
                        </button>
                      )}

                      {/* Toggle Featured */}
                      {member.publication_status === 'approved' && (
                        <button
                          onClick={() => handleToggleFeatured(member.id, member.featured)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            member.featured
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : 'bg-white text-slate-400 border-slate-200 hover:text-amber-500'
                          }`}
                          title={member.featured ? 'Remove featured badge' : 'Mark as featured'}
                        >
                          <Star className={`w-4 h-4 ${member.featured ? 'fill-amber-400' : ''}`} />
                        </button>
                      )}

                      {/* Edit */}
                      <button
                        onClick={() => setSelectedMemberToEdit(member)}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        title="Edit profile information"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete with confirmation */}
                      {deleteConfirmationId === member.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="px-2 py-1 bg-rose-600 text-white text-[11px] font-bold rounded"
                          >
                            Confirm Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirmationId(null)}
                            className="px-2 py-1 bg-slate-200 text-slate-700 text-[11px] font-bold rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmationId(member.id)}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-colors"
                          title="Delete profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Analytics */}
        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-sky-600" />
                Distribution by Professional Category
              </h3>
              <div className="space-y-3 pt-2">
                {Object.entries(stats.categoriesCount).map(([cat, count]) => {
                  const pct = stats.totalPublished > 0
                    ? Math.round((count / stats.totalPublished) * 100)
                    : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{cat}</span>
                        <span>{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-sky-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                Community Health & Moderation
              </h3>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex justify-between py-2 border-b border-slate-100">
                  <span className="font-medium text-slate-500">Total Submissions Processed</span>
                  <strong className="text-slate-900 font-bold">{members.length}</strong>
                </li>
                <li className="flex justify-between py-2 border-b border-slate-100">
                  <span className="font-medium text-slate-500">Approval Rate</span>
                  <strong className="text-emerald-700 font-bold">
                    {members.length > 0 ? Math.round((approvedCount / members.length) * 100) : 0}%
                  </strong>
                </li>
                <li className="flex justify-between py-2 border-b border-slate-100">
                  <span className="font-medium text-slate-500">Unique Skills Represented</span>
                  <strong className="text-slate-900 font-bold">{stats.totalSkillsCount}</strong>
                </li>
                <li className="flex justify-between py-2 border-b border-slate-100">
                  <span className="font-medium text-slate-500">Members with Direct Telegram</span>
                  <strong className="text-sky-700 font-bold">
                    {members.filter(m => Boolean(m.telegram_username)).length}
                  </strong>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 5: Database Setup Guide & Production Cleanup */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            {/* Demo Data Management Alert */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Production Launch & Demo Profiles Management
                  </h3>
                  <p className="text-xs text-slate-500">
                    Remove development sample profiles before opening the directory to your actual Telegram class.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                <p>
                  Current demo profiles loaded: <strong className="text-slate-900">{demoCount} sample profiles</strong>.
                </p>
                <p>
                  When you are ready to invite actual cohort members, click below to purge all demo data. Real submissions will always be preserved.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleClearDemoData}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs"
                >
                  Clear All Demo Profiles for Production Launch
                </button>
                <button
                  onClick={handleSeedDemoData}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  Restore Sample Demo Profiles
                </button>
              </div>
            </div>

            {/* Supabase Free Tier Instructions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-sky-600" />
                  <h3 className="text-base font-bold text-slate-900">Connecting to Free Supabase</h3>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  isSupabaseConfigured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {isSupabaseConfigured ? '🟢 Connected to Live Supabase' : '🟡 Local Storage Fallback Mode'}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Supabase offers a permanently free tier with 500MB PostgreSQL database, 1GB file storage, 50,000 monthly active users, and full Row Level Security (RLS). Follow the steps in the setup guide or copy the schema migration script below.
              </p>

              <button
                onClick={onOpenDbGuide}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Full Supabase Migration Script & Guide</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Member Modal */}
      <EditMemberModal
        member={selectedMemberToEdit}
        isOpen={Boolean(selectedMemberToEdit)}
        onClose={() => setSelectedMemberToEdit(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
};
