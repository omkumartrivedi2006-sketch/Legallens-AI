import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-slate-900 dark:text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                <Scale className="h-4 w-4" />
              </div>
              <span>
                LegalLens <span className="text-blue-600 dark:text-blue-400">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Empowering individuals and teams to navigate complex legal documents with AI-assisted clarity, structure, and actionable insights.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Built for responsible AI-driven document understanding</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider text-slate-900 dark:text-slate-200 uppercase">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <a href="/#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Policy Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider text-slate-900 dark:text-slate-200 uppercase">
              Legal & Trust
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="/#trust" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Responsible AI
                </a>
              </li>
              <li>
                <a href="mailto:support@legallens.ai" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar with Copyright & Disclaimer */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-850 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 LegalLens AI. All rights reserved.</p>
          <p className="text-center md:text-right max-w-xl">
            Disclaimer: For informational purposes only. LegalLens AI does not provide professional legal advice or legal representation.
          </p>
        </div>
      </div>
    </footer>
  );
};
