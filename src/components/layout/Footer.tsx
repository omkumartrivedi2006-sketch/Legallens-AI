import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-neutral-200 dark:border-white/10 bg-[#F7F8FA] dark:bg-[#0A0A0A] text-neutral-600 dark:text-[#858585] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-3.5">
            <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-neutral-900 dark:text-white">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                <Scale className="h-4 w-4" />
              </div>
              <span>
                LegalLens <span className="text-blue-600 dark:text-blue-500">AI</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-[#858585] max-w-sm leading-relaxed">
              Enterprise legal document intelligence. Unpack contract ambiguity, track critical obligations, and prepare for legal review with clarity.
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-[#858585]">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500" />
              <span>Engineered for grounded, verifiable legal understanding</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider text-neutral-900 dark:text-white uppercase">
              Platform
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/" className="hover:text-blue-600 dark:hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <a href="/#features" className="hover:text-blue-600 dark:hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-blue-600 dark:hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-blue-600 dark:hover:text-white transition-colors">
                  Workspace Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Policy Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider text-neutral-900 dark:text-white uppercase">
              Legal & Compliance
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a href="/#trust" className="hover:text-blue-600 dark:hover:text-white transition-colors">
                  Security & Trust
                </a>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-blue-600 dark:hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-blue-600 dark:hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="mailto:support@legallens.ai" className="hover:text-blue-600 dark:hover:text-white transition-colors">
                  Support Inquiries
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Disclaimer */}
        <div className="pt-6 border-t border-neutral-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-neutral-500 dark:text-[#858585]">
          <p>© 2026 LegalLens AI. All rights reserved.</p>
          <p className="text-center md:text-right max-w-xl">
            Informational Disclaimer: LegalLens AI provides automated document comprehension assistance. It is not a licensed attorney and does not provide formal legal advice.
          </p>
        </div>
      </div>
    </footer>
  );
};
