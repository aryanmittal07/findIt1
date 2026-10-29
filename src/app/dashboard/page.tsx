'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  MessageSquare,
  AlertTriangle,
  Settings,
  Bell,
  PlusCircle,
  CheckCircle,
  Clock,
  CheckSquare,
  XCircle,
  ExternalLink,
  Send,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Calendar,
  MapPin,
  Tag,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatDate, formatDateTime, getStatusStyle } from '@/lib/utils';
import ItemCard from '@/components/ItemCard';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';

  const { user, loading: authLoading, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Data States
  const [loading, setLoading] = useState(true);
  const [myItems, setMyItems] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [contactRequests, setContactRequests] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Active message thread
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Profile Edit State
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileCity, setProfileCity] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [itemsRes, matchesRes, requestsRes, complaintsRes, notifsRes] =
        await Promise.all([
          fetch(`/api/listings?userId=${user.id}&limit=50&status=ALL`),
          fetch('/api/matches'),
          fetch('/api/contact-requests'),
          fetch('/api/complaints'),
          fetch('/api/notifications'),
        ]);

      if (itemsRes.ok) {
        const d = await itemsRes.json();
        setMyItems(d.items || []);
      }
      if (matchesRes.ok) {
        const d = await matchesRes.json();
        setMatches(d.matches || []);
      }
      if (requestsRes.ok) {
        const d = await requestsRes.json();
        setContactRequests(d.requests || []);
        if (d.requests?.length > 0 && !activeThreadId) {
          setActiveThreadId(d.requests[0].id);
        }
      }
      if (complaintsRes.ok) {
        const d = await complaintsRes.json();
        setComplaints(d.complaints || []);
      }
      if (notifsRes.ok) {
        const d = await notifsRes.json();
        setNotifications(d.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [user, activeThreadId]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone || '');
      setProfileCity(user.city || '');
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  // Handle URL tab changes
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Update item status (e.g. resolve or close)
  const handleItemStatus = async (itemId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/listings/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await loadDashboardData();
      }
    } catch (e) {
      console.error('Failed to change item status:', e);
    }
  };

  // Reply to active contact request thread
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThreadId || !replyMessage.trim()) return;

    setSendingReply(true);
    try {
      const res = await fetch('/api/contact-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactRequestId: activeThreadId,
          content: replyMessage.trim(),
        }),
      });

      if (res.ok) {
        setReplyMessage('');
        await loadDashboardData();
      }
    } catch (e) {
      console.error('Failed to send reply:', e);
    } finally {
      setSendingReply(false);
    }
  };

  // Accept or decline contact request
  const handleRequestStatus = async (requestId: string, status: 'ACCEPTED' | 'DECLINED') => {
    try {
      const res = await fetch('/api/contact-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status }),
      });
      if (res.ok) {
        await loadDashboardData();
      }
    } catch (e) {
      console.error('Failed to update request status', e);
    }
  };

  // Mark all notifications as read
  const handleMarkNotificationsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      await loadDashboardData();
      await refreshUser();
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  };

  if (authLoading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500">Loading your FindIt session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Sign in to Access Dashboard</h2>
        <p className="text-xs text-slate-500">
          Your dashboard lets you track active reports, messages, and matches.
        </p>
        <Link
          href="/login?redirect=/dashboard"
          className="inline-block px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-indigo-600"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Calculate Metrics
  const activeReportsCount = myItems.filter((i) => i.status === 'APPROVED').length;
  const resolvedReportsCount = myItems.filter((i) => i.status === 'RESOLVED').length;
  const pendingRequestsCount = contactRequests.filter(
    (r) => r.receiverId === user.id && r.status === 'PENDING'
  ).length;

  const currentThread = contactRequests.find((r) => r.id === activeThreadId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, {user.name.split(' ')[0]}
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800 rounded-md">
              Protected Account
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your lost & found items, inspect potential matches, and converse safely.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/report"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-indigo-600 rounded-xl transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>File New Report</span>
          </Link>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('reports')}
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-colors shadow-2xs cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>My Active Reports</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">{activeReportsCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">{myItems.length} total reports filed</p>
        </div>

        <div
          onClick={() => setActiveTab('matches')}
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-colors shadow-2xs cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Potential Matches</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">{matches.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Smart correlation alerts</p>
        </div>

        <div
          onClick={() => setActiveTab('requests')}
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-colors shadow-2xs cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Inquiries & Messages</span>
            <MessageSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">
            {contactRequests.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {pendingRequestsCount} pending approval
          </p>
        </div>

        <div
          onClick={() => setActiveTab('reports')}
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-colors shadow-2xs cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Items Resolved</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">{resolvedReportsCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Returned to owners</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Overview & Notifications
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'reports'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>My Reports</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
            {myItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('matches')}
          className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'matches'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Potential Matches</span>
          {matches.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">
              {matches.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'requests'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Protected Messages</span>
          {pendingRequestsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-600 text-white font-bold">
              {pendingRequestsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'complaints'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>My Complaints</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
            {complaints.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'settings'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Tab 1: Overview & Notifications */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Notifications Feed */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Notifications & Updates</h3>
              </div>
              {notifications.some((n) => !n.isRead) && (
                <button
                  onClick={handleMarkNotificationsRead}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No recent activity. When someone messages you or a match is found, you will see it here.
              </p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-xl border transition-colors ${
                      notif.isRead
                        ? 'bg-slate-50/50 border-slate-200'
                        : 'bg-indigo-50/50 border-indigo-200 font-medium'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{notif.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {formatDateTime(notif.createdAt)}
                        </p>
                      </div>
                      {notif.linkUrl && (
                        <Link
                          href={notif.linkUrl}
                          className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-white border border-indigo-200 rounded-lg shrink-0 hover:bg-indigo-50"
                        >
                          View
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action / Safety Sidebar */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
              <h3 className="font-semibold text-slate-900 text-sm">Recommended Next Steps</h3>
              <div className="space-y-2.5 text-xs">
                <Link
                  href="/report/lost"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 text-slate-800 font-medium"
                >
                  <span>Did you lose something recently?</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/report/found"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 text-slate-800 font-medium"
                >
                  <span>Register an item you picked up</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/safety"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 text-slate-800 font-medium"
                >
                  <span>Find verified exchange zone locations</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-900 text-white space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Community Protection
              </h4>
              <p className="text-xs text-indigo-100 leading-relaxed">
                FindIt never asks for passwords, payment codes, or credit card pins.
                Always conduct exchanges at verified municipal desks.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: My Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-lg">My Submitted Reports</h3>
            <Link
              href="/report"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-indigo-600 transition-colors"
            >
              + New Report
            </Link>
          </div>

          {myItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-slate-900">No reports created yet</h4>
              <p className="text-xs text-slate-500">
                You haven’t filed any lost or found items. Submit a report to let FindIt match with nearby records.
              </p>
              <div className="pt-2">
                <Link
                  href="/report"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-indigo-600"
                >
                  Create Your First Report
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {myItems.map((item) => {
                const isLost = item.type === 'LOST';
                const statusStyle = getStatusStyle(item.status);

                return (
                  <div
                    key={item.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0].url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Tag className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                              isLost
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {item.type}
                          </span>
                          <span className="font-mono text-xs text-slate-500 font-medium">
                            {item.referenceId}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${statusStyle.bg}`}
                          >
                            {statusStyle.label}
                          </span>
                        </div>

                        <h4 className="font-semibold text-slate-900 text-sm">{item.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {item.city}
                          </span>
                          <span>•</span>
                          <span>{formatDate(item.dateLostFound)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                      <Link
                        href={`/listings/${item.id}`}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                      >
                        View Listing
                      </Link>

                      {item.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleItemStatus(item.id, 'RESOLVED')}
                          className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100"
                        >
                          Mark Resolved
                        </button>
                      )}

                      {item.status !== 'CLOSED' && (
                        <button
                          onClick={() => handleItemStatus(item.id, 'CLOSED')}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Potential Matches */}
      {activeTab === 'matches' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Smart Match Suggestions</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated correlations between your active items and reports submitted by other community members.
            </p>
          </div>

          {matches.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-slate-900">No matches found at this moment</h4>
              <p className="text-xs text-slate-500">
                When another user registers an item matching your category and location, FindIt will alert you here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matches.map((match, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 p-5 shadow-2xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-800 rounded-full">
                      {match.score}% Match Score
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Ref: {match.matchedItem.referenceId}
                    </span>
                  </div>

                  {/* Comparison */}
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Your Item:</span>
                      <p className="font-semibold text-slate-900">{match.sourceItem.title}</p>
                    </div>

                    <div className="p-2.5 bg-indigo-50/60 rounded-lg border border-indigo-100">
                      <span className="text-[10px] font-semibold text-indigo-600 uppercase">
                        Matched {match.matchedItem.type}:
                      </span>
                      <p className="font-semibold text-indigo-950">{match.matchedItem.title}</p>
                      <p className="text-[11px] text-indigo-800 mt-1">
                        Location: {match.matchedItem.approxLocation || match.matchedItem.city}
                      </p>
                    </div>
                  </div>

                  {/* Reasons pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {match.reasons.map((r: string, rIdx: number) => (
                      <span
                        key={rIdx}
                        className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-700 rounded"
                      >
                        ✓ {r}
                      </span>
                    ))}
                  </div>

                  {/* Action link */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">
                      Found by {match.matchedItem.user?.name}
                    </span>
                    <Link
                      href={`/listings/${match.matchedItem.id}`}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-indigo-600 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Inspect Match</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Messages & Contact Requests */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[480px]">
            {/* Conversation Threads Sidebar */}
            <div className="md:col-span-5 border-r border-slate-200 bg-slate-50/50 flex flex-col">
              <div className="p-4 border-b border-slate-200 font-semibold text-xs text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Inquiries & Messages</span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {contactRequests.length} threads
                </span>
              </div>

              {contactRequests.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No active inquiries. When you message a reporter or someone contacts your listing, threads appear here.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
                  {contactRequests.map((req) => {
                    const isSender = req.senderId === user.id;
                    const counterparty = isSender ? req.receiver : req.sender;
                    const isSelected = activeThreadId === req.id;

                    return (
                      <div
                        key={req.id}
                        onClick={() => setActiveThreadId(req.id)}
                        className={`p-3.5 cursor-pointer transition-colors ${
                          isSelected ? 'bg-white border-l-4 border-l-indigo-600' : 'hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-900 truncate">
                            {counterparty.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDate(req.updatedAt)}
                          </span>
                        </div>
                        <p className="text-xs text-indigo-700 font-medium truncate">
                          Re: {req.item.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {req.messages[req.messages.length - 1]?.content || req.initialMessage}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between text-[10px]">
                          <span
                            className={`px-1.5 py-0.2 rounded font-semibold ${
                              req.status === 'ACCEPTED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === 'DECLINED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {req.status}
                          </span>
                          <span className="text-slate-400 font-mono">{req.item.referenceId}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Conversation Active Window */}
            <div className="md:col-span-7 flex flex-col justify-between p-4 sm:p-6 bg-white">
              {currentThread ? (
                <>
                  {/* Thread Header */}
                  <div className="pb-3 border-b border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">
                          {currentThread.senderId === user.id
                            ? currentThread.receiver.name
                            : currentThread.sender.name}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Regarding: {currentThread.item.title} ({currentThread.item.referenceId})
                        </p>
                      </div>

                      {/* Accept / Decline controls if current user is receiver & still pending */}
                      {currentThread.receiverId === user.id && currentThread.status === 'PENDING' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRequestStatus(currentThread.id, 'ACCEPTED')}
                            className="px-3 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                          >
                            Accept Request
                          </button>
                          <button
                            onClick={() => handleRequestStatus(currentThread.id, 'DECLINED')}
                            className="px-3 py-1 text-xs font-semibold text-slate-600 hover:text-rose-600"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>

                    {currentThread.verificationDetails && (
                      <div className="p-2.5 bg-amber-50 rounded-lg text-xs text-amber-900 border border-amber-200">
                        <span className="font-bold">Proof of Ownership / Verification Notes:</span>
                        <p className="mt-0.5 text-amber-800">{currentThread.verificationDetails}</p>
                      </div>
                    )}
                  </div>

                  {/* Messages Feed */}
                  <div className="py-4 space-y-3 overflow-y-auto max-h-[340px]">
                    {currentThread.messages.map((m: any) => {
                      const isMe = m.senderId === user.id;
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                              isMe
                                ? 'bg-slate-900 text-white rounded-br-none'
                                : 'bg-slate-100 text-slate-800 rounded-bl-none'
                            }`}
                          >
                            <p>{m.content}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 px-1">
                            {formatDateTime(m.createdAt)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply Input Form */}
                  <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-100 flex gap-2">
                    <input
                      type="text"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type a safe reply (e.g. proposed public meeting spot)..."
                      className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={sendingReply || !replyMessage.trim()}
                      className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-40 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="m-auto text-center py-12 text-slate-400 text-xs">
                  Select a message thread from the left to view protected correspondence.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: My Complaints */}
      {activeTab === 'complaints' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">My Support Tickets & Complaints</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review administrator investigations and responses to your filed concerns.
              </p>
            </div>
            <Link
              href="/report/complaint"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-indigo-600 transition-colors"
            >
              + File New Ticket
            </Link>
          </div>

          {complaints.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-slate-900">No support tickets filed</h4>
              <p className="text-xs text-slate-500">
                If you ever suspect a fraudulent listing or experience an issue, submit a complaint and our team will investigate.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((c) => (
                <div
                  key={c.id}
                  className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {c.referenceId}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded">
                        {c.category}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded">
                        Priority: {c.priority}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        c.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{c.subject}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{c.description}</p>
                  </div>

                  {c.adminResponse && (
                    <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-xs space-y-1">
                      <p className="font-bold text-indigo-950">FindIt Support Team Resolution:</p>
                      <p className="text-indigo-900">{c.adminResponse}</p>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
                    <span>Submitted on {formatDateTime(c.createdAt)}</span>
                    {c.itemReference && <span>Related Item: {c.itemReference}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Profile Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-xl bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Account & Privacy Settings</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your contact details. These details remain strictly encrypted and masked.
            </p>
          </div>

          {profileSaved && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Profile details updated successfully.</span>
            </div>
          )}

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Display Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50 text-slate-500 rounded-xl cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Account email is bound to your FindIt credentials.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Phone Number</label>
              <input
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Default City / Area</label>
              <input
                type="text"
                value={profileCity}
                onChange={(e) => setProfileCity(e.target.value)}
                placeholder="e.g. Seattle, WA"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setProfileSaved(true);
                  setTimeout(() => setProfileSaved(false), 3000);
                }}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-indigo-600 rounded-xl transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserDashboard() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading your FindIt dashboard...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
