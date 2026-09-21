import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { ShieldCheck } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <PageHeader
        title="Privacy Policy"
        description="LegalLens AI's principles regarding document confidentiality and data governance."
        badge="Placeholder Notice"
      />

      <Card>
        <CardContent className="pt-6 space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold text-base">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            <span>Document Privacy & Data Protection Framework</span>
          </div>
          <p>
            This is a placeholder for the formal LegalLens AI Privacy Policy, to be finalized alongside cloud database provisioning and compliance audits in future modules.
          </p>
          <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <p className="font-semibold text-slate-800 dark:text-slate-200">Core Architecture Commitments:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400">
              <li>Documents will be isolated by user and authenticated tenancy.</li>
              <li>No customer documents will be used to train public foundation models without explicit agreement.</li>
              <li>Deletion controls will allow users to purge uploaded files from cloud storage.</li>
            </ul>
          </div>
          <p className="text-xs text-slate-500">
            Last updated: Phase 1 — Module 1 initialization (2026).
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
