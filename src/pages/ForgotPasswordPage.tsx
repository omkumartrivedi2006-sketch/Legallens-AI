import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, ArrowLeft, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { mapFirebaseError } from '../services/authService';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword, isConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword(email.trim());
      setIsSuccess(true);
    } catch (error) {
      setErrorMessage(mapFirebaseError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-bold text-2xl text-slate-900 dark:text-white"
            aria-label="LegalLens AI Home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <Scale className="h-5 w-5" />
            </div>
            <span>
              LegalLens <span className="text-blue-600 dark:text-blue-400">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Reset your password
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your account email and we'll send you instructions to reset your password.
          </p>
        </div>

        {/* Configuration Notice if Firebase environment is missing */}
        {!isConfigured && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Setup Notice:</span> Firebase environment keys have not yet been provided in <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 font-mono">.env.local</code>. Real password reset requires Firebase credentials.
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div
            className="flex items-start gap-2.5 p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-950/20 text-xs text-rose-800 dark:text-rose-200 animate-in fade-in duration-200"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        <Card>
          <CardContent className="pt-6">
            {isSuccess ? (
              <div className="space-y-4 text-center py-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Password reset email sent
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  If an account exists for <span className="font-medium text-slate-900 dark:text-slate-200">{email}</span>, a password reset link has been dispatched. Please check your inbox and spam folder.
                </p>
                <div className="pt-2">
                  <Link to="/login">
                    <Button variant="outline" size="md" className="w-full justify-center">
                      Return to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label
                    htmlFor="reset-email"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Account Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      disabled={isLoading}
                      required
                      className="w-full px-3.5 py-2 pl-9 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                  isLoading={isLoading}
                >
                  {isLoading ? 'Sending reset link...' : 'Send Reset Link'}
                </Button>

                <div className="pt-2 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
