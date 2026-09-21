import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { FileText, AlertTriangle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <PageHeader
        title="Terms of Service"
        description="General terms of usage for the LegalLens AI document intelligence platform."
        badge="Placeholder Notice"
      />

      <Card>
        <CardContent className="pt-6 space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold text-base">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Platform Usage & Legal Notice</span>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Crucial Disclaimer on Legal Representation</span>
            </div>
            <p>
              LegalLens AI provides automated document analysis and natural language processing for informational purposes only. Use of this application does not create an attorney-client relationship, nor should it substitute for licensed counsel.
            </p>
          </div>

          <p>
            This document will be updated with detailed commercial terms, acceptable use policies, and jurisdiction clauses prior to production deployment.
          </p>

          <p className="text-xs text-slate-500">
            © 2026 LegalLens AI. All rights reserved.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
