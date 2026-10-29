'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Compass,
  Search,
  Shield,
  HelpCircle,
  Mail,
  User as UserIcon,
  Plus,
  Menu,
  X,
  Bell,
  LogOut,
  ShieldAlert,
  ChevronDown,
  LayoutDashboard,
  FileCheck,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, unreadNotifications, pendingRequestsCount } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const totalBadges = (unreadNotifications || 0) + (pendingRequestsCount || 0);

  return (
    <header className="sticky top-0 z-40 bg-[#fbf8f3]/95 backdrop-blur-md border-b border-[#ede7db] transition-all">
      {/* Top Banner exactly as in reference */}
      <div className="bg-[#193227] text-[#d6e5dc] text-[11px] font-semibold tracking-widest uppercase py-2 px-4 text-center select-none">
        <span>A calmer way to find your way back</span>
        <span className="mx-2 text-[#7fa792] font-normal">+</span>
        <span>Built for your campus &amp; community</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-1 group focus:outline-none focus:ring-2 focus:ring-[#193227] rounded-lg p-1"
          >
            <span className="font-serif font-black text-2xl tracking-tight text-[#193227] group-hover:opacity-90 transition-opacity">
              Find<span className="text-[#396950]">It</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#396950] mb-1 ml-0.5" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7" aria-label="Main Navigation">
            <Link
              href="/listings"
              className={`text-sm font-medium transition-colors ${
                isActive('/listings')
                  ? 'text-[#193227] font-semibold underline underline-offset-8 decoration-2 decoration-[#396950]'
                  : 'text-[#4d5d54] hover:text-[#193227]'
              }`}
            >
              Explore
            </Link>

            <Link
              href="/how-it-works"
              className={`text-sm font-medium transition-colors ${
                isActive('/how-it-works')
                  ? 'text-[#193227] font-semibold'
                  : 'text-[#4d5d54] hover:text-[#193227]'
              }`}
            >
              How it works
            </Link>

            <Link
              href="/safety"
              className={`text-sm font-medium transition-colors ${
                isActive('/safety')
                  ? 'text-[#193227] font-semibold'
                  : 'text-[#4d5d54] hover:text-[#193227]'
              }`}
            >
              Safety
            </Link>

            {/* Prominent Pill: Report an item */}
            <Link
              href="/report"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white bg-[#193227] hover:bg-[#254536] rounded-full transition-all shadow-xs hover:shadow-sm"
            >
              <span>Report an item</span>
            </Link>

            {/* Auth / Profile Hub */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 text-sm font-medium text-[#193227] hover:bg-[#ede7db]/50 rounded-full transition-colors border border-[#e2dacf]"
                  aria-expanded={profileDropdownOpen}
                >
                  <div className="w-7 h-7 rounded-full bg-[#193227] text-white flex items-center justify-center text-xs font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate text-xs">{user.name.split(' ')[0]}</span>
                  {user.role === 'ADMIN' && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#faedd9] text-[#894323] rounded-sm">
                      Staff
                    </span>
                  )}
                  {totalBadges > 0 && (
                    <span className="w-2 h-2 rounded-full bg-[#df8937] animate-pulse" />
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-[#5e7065]" />
                </button>

                {/* Dropdown */}
                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white border border-[#e2dacf] rounded-2xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#f2eee6]">
                      <p className="text-[11px] font-medium text-[#7a8a80]">Signed in as</p>
                      <p className="text-xs font-bold text-[#193227] truncate">{user.name}</p>
                      <p className="text-[10px] text-[#7a8a80] truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center justify-between px-4 py-2 text-xs text-[#2c3d33] hover:bg-[#f6f2e9] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <LayoutDashboard className="w-3.5 h-3.5 text-[#6c8074]" />
                        My Dashboard
                      </span>
                      {totalBadges > 0 && (
                        <span className="px-1.5 py-0.2 text-[10px] font-bold bg-[#193227] text-white rounded-full">
                          {totalBadges}
                        </span>
                      )}
                    </Link>

                    <Link
                      href="/dashboard?tab=reports"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-[#2c3d33] hover:bg-[#f6f2e9] transition-colors"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-[#6c8074]" />
                      My Reports
                    </Link>

                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-[#894323] hover:bg-[#faedd9] font-medium transition-colors border-t border-[#f2eee6]"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Admin Control Panel
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-[#6c8074] hover:bg-[#f6f2e9] hover:text-[#193227] transition-colors border-t border-[#f2eee6]"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-[#193227] hover:opacity-80 transition-opacity"
              >
                Sign in
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-2">
            <Link
              href="/report"
              className="px-3 py-1.5 text-xs font-semibold bg-[#193227] text-white rounded-full"
            >
              Report
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#193227] hover:bg-[#ede7db] rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#ede7db] bg-[#fbf8f3] px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/listings"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-[#193227] rounded-lg hover:bg-[#f4efe4]"
          >
            Explore Listings
          </Link>
          <Link
            href="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-[#193227] rounded-lg hover:bg-[#f4efe4]"
          >
            How it works
          </Link>
          <Link
            href="/safety"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-[#193227] rounded-lg hover:bg-[#f4efe4]"
          >
            Safety Guidelines
          </Link>

          <div className="pt-3 border-t border-[#ede7db]">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-[#f4efe4] rounded-lg">
                  <p className="text-xs font-bold text-[#193227]">{user.name}</p>
                  <p className="text-[10px] text-[#6c8074]">{user.email}</p>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-xs font-medium text-[#193227] hover:bg-[#f4efe4] rounded-lg"
                >
                  Dashboard & Messages {totalBadges > 0 && `(${totalBadges})`}
                </Link>
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-xs font-medium text-[#894323] bg-[#faedd9] rounded-lg"
                  >
                    Admin Control Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-[#6c8074] hover:bg-[#f4efe4] rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-1 flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-semibold text-[#193227] border border-[#e2dacf] rounded-full hover:bg-[#ede7db]"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-semibold text-white bg-[#193227] rounded-full hover:bg-[#254536]"
                >
                  Join FindIt
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
