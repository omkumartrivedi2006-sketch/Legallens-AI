import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { PublicAuthRoute } from '../components/auth/PublicAuthRoute';

import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { DashboardPage } from '../pages/DashboardPage';
import { DocumentsPage } from '../pages/DocumentsPage';
import { DocumentDetailsPage } from '../pages/DocumentDetailsPage';
import { ChatPage } from '../pages/ChatPage';
import { ComparePage } from '../pages/ComparePage';
import { ComparisonDetailsPage } from '../pages/ComparisonDetailsPage';
import { InsightsPage } from '../pages/InsightsPage';
import { DocumentInsightsPage } from '../pages/DocumentInsightsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { PrivacyPage } from '../pages/PrivacyPage';
import { TermsPage } from '../pages/TermsPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages Layout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* Public-only Auth Routes (Redirect to /dashboard if already authenticated) */}
        <Route element={<PublicAuthRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
      </Route>

      {/* Protected Authenticated Dashboard Shell Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/documents/:documentId" element={<DocumentDetailsPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:documentId" element={<ChatPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/comparisons" element={<ComparePage defaultTab="history" />} />
          <Route path="/comparisons/:comparisonId" element={<ComparisonDetailsPage />} />
          <Route path="/compare/:comparisonId" element={<ComparisonDetailsPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/insights/:documentId" element={<DocumentInsightsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Catch-all 404 Route */}
      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
