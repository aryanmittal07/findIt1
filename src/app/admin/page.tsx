'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Users,
  MessageSquare,
  CheckCircle,
  XCircle,
  Star,
  Activity,
  ArrowRight,
  Loader2,
  Lock,
  Search,
  ExternalLink,
  Edit,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatDate, formatDateTime, getStatusStyle } from '@/lib/utils';

export default function AdminControlPanel() {
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'metrics' | 'moderation' | 'complaints' | 'users' | 'audit'>('metrics');
  const [loading, setLoading] = useState(true);

  // Data States
  const [metrics, setMetrics] = useState<any | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Action states
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [adminResponseText, setAdminResponseText] = useState('');
  const [adminComplaintStatus, setAdminComplaintStatus] = useState('RESOLVED');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchAdminData = useCallback(async () => {
    if (!user || user.role !== 'ADMIN') return;
    setLoading(true);
    try {
      const [metricsRes, listingsRes, complaintsRes, usersRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/listings?limit=50&status=ALL'),
        fetch('/api/complaints'),
        fetch('/api/admin/users'),
      ]);

      if (metricsRes.ok) {
        const d = await metricsRes.json();
        setMetrics(d.metrics);
        setAuditLogs(d.recentAuditLogs || []);
      }
      if (listingsRes.ok) {
        const d = await listingsRes.json();
        setListings(d.items || []);
      }
      if (complaintsRes.ok) {
        const d = await complaintsRes.json();
        setComplaints(d.complaints || []);
      }
      if (usersRes.ok) {
        const d = await usersRes.json();
        setUsers(d.users || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchAdminData();
    }
  }, [user, fetchAdminData]);

  // Moderation action (approve, reject, feature, resolve)
  const handleModerateItem = async (
    itemId: string,
    status?: string,
    isFeatured?: boolean,
    notes?: string
  ) => {
    setSubmittingAction(true);
    try {
      const res = await fetch('/api/admin/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          status,
          isFeatured,
          moderationNotes: notes || 'Admin review completed',
        }),
      });

      if (res.ok) {
        setActionSuccess(`Item action successfully applied.`);
        setTimeout(() => setActionSuccess(null), 3500);
        await fetchAdminData();
      }
    } catch (err) {
      console.error('Moderation error:', err);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Resolve complaint action
  const handleResolveComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: adminComplaintStatus,
          adminResponse: adminResponseText.trim(),
        }),
      });

      if (res.ok) {
        setActionSuccess(`Complaint ${selectedComplaint.referenceId} updated.`);
        setTimeout(() => setActionSuccess(null), 3500);
        setSelectedComplaint(null);
        setAdminResponseText('');
        await fetchAdminData();
      }
    } catch (err) {
      console.error('Complaint update error:', err);
    } finally {
      setSubmittingAction(false);
    }
  };

  // User suspend / activate action
  const handleUserStatus = async (targetUserId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, status: newStatus }),
      });

      if (res.ok) {
        setActionSuccess(`User status updated to ${newStatus}.`);
        setTimeout(() => setActionSuccess(null), 3500);
        await fetchAdminData();
      }
    } catch (e) {
      console.error('Failed to change user status', e);
    }
  };

  if (authLoading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 text-rose-600 animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500">Checking administrator privileges...</p>
      </div>
    );
  }

  // Access control check: Only ADMIN role allowed!
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-rose-200 shadow-md text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Restricted Administrator Area</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Access to the FindIt Administrative Panel requires an account with elevated privileges.
        </p>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
          <span className="font-semibold block text-slate-900 mb-1">Testing Credentials:</span>
          <span>admin@findit.org / AdminPass123!</span>
        </div>
        <Link
          href="/login?redirect=/admin"
          className="inline-block px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800"
        >
          Sign In as Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              FindIt Operations & Moderation
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Logged in as <span className="font-semibold text-slate-800">{user.name}</span> ({user.email})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
          >
            Switch to User View
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-medium">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'metrics'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Metrics & Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'moderation'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Listing Moderation</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
            {listings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'complaints'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Complaints & Disputes</span>
          {complaints.filter((c) => c.status !== 'RESOLVED').length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">
              {complaints.filter((c) => c.status !== 'RESOLVED').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Audit Log</span>
        </button>
      </div>

      {/* Tab 1: Metrics Overview */}
      {activeTab === 'metrics' && metrics && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Total Listings
              </span>
              <p className="text-3xl font-bold text-slate-900">{metrics.totalReports}</p>
              <div className="flex gap-3 text-xs text-slate-500 mt-2">
                <span className="text-rose-600 font-medium">{metrics.lostReports} Lost</span>
                <span>•</span>
                <span className="text-emerald-600 font-medium">{metrics.foundReports} Found</span>
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Pending Review
              </span>
              <p className="text-3xl font-bold text-amber-600">{metrics.pendingReview}</p>
              <p className="text-xs text-slate-500 mt-2">Require staff evaluation</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Open Disputes
              </span>
              <p className="text-3xl font-bold text-rose-600">{metrics.pendingComplaints}</p>
              <p className="text-xs text-slate-500 mt-2">Active tickets in queue</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Community Members
              </span>
              <p className="text-3xl font-bold text-slate-900">{metrics.totalUsers}</p>
              <p className="text-xs text-slate-500 mt-2">Registered accounts</p>
            </div>
          </div>

          {/* Recent Audit Activities */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <h3 className="font-semibold text-slate-900 text-sm">Recent Administrative Actions</h3>
            <div className="divide-y divide-slate-100 text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <span className="font-semibold text-slate-900">{log.action}</span>
                    <p className="text-slate-600 mt-0.5">{log.details}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {formatDateTime(log.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Listing Moderation */}
      {activeTab === 'moderation' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Community Listings Moderation</h3>
            <span className="text-xs text-slate-500">{listings.length} items catalogued</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            {listings.map((item) => {
              const statusStyle = getStatusStyle(item.status);

              return (
                <div
                  key={item.id}
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      {item.images && item.images.length > 0 ? (
                        <img src={item.images[0].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                          No Pic
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            item.type === 'LOST'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.type}
                        </span>
                        <span className="font-mono text-xs font-semibold text-slate-700">
                          {item.referenceId}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${statusStyle.bg}`}
                        >
                          {statusStyle.label}
                        </span>
                        {item.isFeatured && (
                          <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-amber-100 text-amber-800 rounded flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            Featured
                          </span>
                        )}
                      </div>

                      <h4 className="font-semibold text-slate-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                      <p className="text-[11px] text-slate-400">
                        Reporter: {item.user?.name} • Location: {item.approxLocation}, {item.city}
                      </p>
                    </div>
                  </div>

                  {/* Moderation Controls */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Link
                      href={`/listings/${item.id}`}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View</span>
                    </Link>

                    {item.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleModerateItem(item.id, 'APPROVED')}
                        className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                      >
                        Approve
                      </button>
                    )}

                    {item.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleModerateItem(item.id, 'REJECTED')}
                        className="px-3 py-1.5 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg"
                      >
                        Reject
                      </button>
                    )}

                    <button
                      onClick={() => handleModerateItem(item.id, undefined, !item.isFeatured)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                        item.isFeatured
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {item.isFeatured ? 'Unfeature' : 'Feature'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Complaints & Disputes */}
      {activeTab === 'complaints' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Complaints List */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-100">
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 font-semibold text-xs text-slate-700 uppercase tracking-wider">
              Tickets Queue ({complaints.length})
            </div>

            {complaints.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No active complaints filed.
              </div>
            ) : (
              complaints.map((c) => {
                const isSelected = selectedComplaint?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedComplaint(c);
                      setAdminResponseText(c.adminResponse || '');
                      setAdminComplaintStatus(c.status);
                    }}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-slate-900">{c.referenceId}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <h4 className="font-semibold text-slate-900 text-sm">{c.subject}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{c.description}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>By: {c.user?.name} ({c.user?.email})</span>
                      <span>Priority: {c.priority}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Complaint Action / Resolution Form */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Review & Resolve Ticket</h3>

            {selectedComplaint ? (
              <form onSubmit={handleResolveComplaint} className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <p className="font-mono font-bold text-slate-900">{selectedComplaint.referenceId}</p>
                  <p className="font-semibold text-slate-800">{selectedComplaint.subject}</p>
                  <p className="text-slate-600 leading-relaxed pt-1 border-t border-slate-200/60 mt-1">
                    {selectedComplaint.description}
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ticket Status</label>
                  <select
                    value={adminComplaintStatus}
                    onChange={(e) => setAdminComplaintStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 font-medium"
                  >
                    <option value="INVESTIGATING">INVESTIGATING</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Admin Response (Sent to User)
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={adminResponseText}
                    onChange={(e) => setAdminResponseText(e.target.value)}
                    placeholder="Describe actions taken, policy decisions, or safety guidance..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(null)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 border border-slate-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAction}
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-indigo-600 rounded-lg transition-colors"
                  >
                    Submit Resolution
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                Select a complaint from the list to respond or update status.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: User Accounts */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">User Directory & Security</h3>
            <span className="text-xs text-slate-500">{users.length} registered accounts</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto text-xs">
            {users.map((u) => (
              <div
                key={u.id}
                className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{u.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {u.role}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {u.status}
                    </span>
                  </div>

                  <p className="text-slate-500 mt-0.5">{u.email} • {u.phone || 'No phone'}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Reports: {u._count?.items || 0} • Joined {formatDate(u.createdAt)}
                  </p>
                </div>

                {/* Restrict / Activate button */}
                <div className="flex items-center gap-2">
                  {u.id !== user.id && (
                    <button
                      onClick={() =>
                        handleUserStatus(u.id, u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')
                      }
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                        u.status === 'ACTIVE'
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {u.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">Administrative Audit Trail</h3>
            <span className="text-xs text-slate-400 font-mono">Immutable Log</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-800">{log.action}</span>
                  <span className="text-slate-400 text-[11px]">
                    {formatDateTime(log.createdAt)}
                  </span>
                </div>
                <p className="text-slate-600">{log.details}</p>
                <p className="text-[10px] text-slate-400">
                  Target: {log.targetType} ({log.targetId}) • Operator: {log.admin?.name || 'System Admin'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
