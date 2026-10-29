import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#142920] text-[#c5dcce] border-t border-[#1d3d2f] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 space-y-3">
            <span className="font-serif font-black text-2xl tracking-tight text-white block">
              Find<span className="text-[#71a387]">It</span>
            </span>
            <p className="text-xs text-[#9ec2ad] max-w-sm leading-relaxed">
              A calmer, safer lost-and-found noticeboard for campuses and communities.
              Built to eliminate scams and protect student privacy.
            </p>
            <p className="text-[11px] text-[#638f75]">
              Designed with care · Built for your campus
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-[11px] tracking-widest uppercase mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-[#b0cebc]">
              <li>
                <Link href="/listings" className="hover:text-white transition-colors">
                  The Noticeboard
                </Link>
              </li>
              <li>
                <Link href="/report/lost" className="hover:text-white transition-colors">
                  Report Lost Item
                </Link>
              </li>
              <li>
                <Link href="/report/found" className="hover:text-white transition-colors">
                  Report Found Item
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  My Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-[11px] tracking-widest uppercase mb-3">
              Safety
            </h4>
            <ul className="space-y-2 text-[#b0cebc]">
              <li>
                <Link href="/safety" className="hover:text-white transition-colors">
                  Safety Guidelines
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  How FindIt Works
                </Link>
              </li>
              <li>
                <Link href="/report/complaint" className="hover:text-white transition-colors">
                  Report Suspicious User
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-[11px] tracking-widest uppercase mb-3">
              Organization
            </h4>
            <ul className="space-y-2 text-[#b0cebc]">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Team
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#1d3d2f] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#638f75]">
          <p>© {new Date().getFullYear()} FindIt Campus Noticeboard. All rights reserved.</p>
          <p>Protected Handover Protocol</p>
        </div>
      </div>
    </footer>
  );
}
