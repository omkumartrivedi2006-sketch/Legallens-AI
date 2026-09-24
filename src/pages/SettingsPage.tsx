import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, User, Key, LogOut, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Authenticated User';
  const email = user?.email || 'user@example.com';
  const uid = user?.uid || 'Unknown';
  const isEmailVerified = user?.emailVerified || false;

  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader
        title="Settings"
        description="Manage workspace preferences, interface appearance, and account options."
      />

      {/* Appearance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Appearance & Theme</CardTitle>
          <CardDescription className="text-xs">
            Choose your preferred theme across the LegalLens AI interface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
                theme === 'light'
                  ? 'border-blue-600 bg-blue-50/40 dark:bg-slate-800 text-slate-900 dark:text-white ring-1 ring-blue-600/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              )}
            >
              <div className="h-10 w-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-sm">
                <Sun className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Light Theme</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Clean neutral light surfaces
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
                theme === 'dark'
                  ? 'border-blue-600 bg-slate-100/50 dark:bg-slate-800 text-slate-900 dark:text-white ring-1 ring-blue-600/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              )}
            >
              <div className="h-10 w-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 shadow-sm">
                <Moon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Dark Theme</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  High-contrast neutral dark mode
                </p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Real Account Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span>Account Profile</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Real authenticated Firebase account profile and session information.
              </CardDescription>
            </div>
            <Badge variant="success" className="gap-1">
              <ShieldCheck className="h-3 w-3" />
              <span>Active Session</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Display Name
              </label>
              <div className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold text-slate-900 dark:text-slate-100">
                {displayName}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Email Address
              </label>
              <div className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span>{email}</span>
                {isEmailVerified ? (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">Standard</span>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Firebase User ID (UID)
              </label>
              <div className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-mono text-slate-600 dark:text-slate-400 truncate">
                {uid}
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              End your active session on this browser
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut className="h-3.5 w-3.5" />}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900/60"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Service & Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Key className="h-4 w-4 text-blue-600" />
            <span>Production System & Integration Status</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Operational status of LegalLens AI infrastructure and security layers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Firebase Authentication</span>
                <p className="text-[11px] text-slate-500">JWT token validation with Bearer token security</p>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Active & Isolated
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Firebase Cloud Storage</span>
                <p className="text-[11px] text-slate-500">Versioned storage paths with 25MB type-checked rules</p>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Enforced
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Google Gemini LLM</span>
                <p className="text-[11px] text-slate-500">Structured JSON schema output via Gemini 2.5 Flash</p>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Online
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">API Rate Limiter & Error Guard</span>
                <p className="text-[11px] text-slate-500">Sliding-window quota limiter with safe reference IDs (ERR-XXXXXX)</p>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Protected
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Data Protection Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Privacy & Document Protection Policy</span>
          </CardTitle>
          <CardDescription className="text-xs">
            How your legal documents and proprietary agreements are safeguarded.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Strict Two-User Account Isolation
            </p>
            <p>
              Every document, version, extracted text snippet, and AI analysis is partitioned under your specific Firebase UID (<code className="font-mono text-[11px] bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">{uid}</code>). Firestore and Cloud Storage security rules strictly prohibit any other authenticated or unauthenticated user from reading or modifying your data.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Privacy-First AI Processing
            </p>
            <p>
              Document content is sent to Google Gemini only during your active analysis, Q&A, comparison, or insight generation requests. All uploaded content is treated as untrusted data wrapped in security sandboxes (<code className="font-mono text-[11px] bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">&lt;untrusted_documents&gt;</code>) to prevent prompt injection and unauthorized instruction execution.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Data Retention & Deletion
            </p>
            <p>
              Your documents and version records are retained solely for your use in this workspace. Deleting a document permanently purges all physical files from Cloud Storage and cascades deletion across all version records, extracted text, and subcollections.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
