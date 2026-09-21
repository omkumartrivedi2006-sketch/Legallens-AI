import { MessageSquare, Sparkles, ShieldAlert, Bot } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Card, CardContent } from '../components/ui/Card';

export const ChatPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Chat"
        description="Ask questions and query specific terms, obligations, or definitions in plain language."
        badge="Module 5 Ready"
      />

      {/* Trust & AI Boundary Alert */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200">
        <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Responsible AI Guardrails:</span> AI-generated responses are for informational and navigational assistance only. LegalLens AI cannot interpret statutory precedent or establish attorney-client privilege.
        </div>
      </div>

      <Card className="min-h-[500px] flex flex-col justify-between">
        <CardContent className="pt-6 flex-1 flex flex-col justify-center">
          <EmptyState
            icon={Bot}
            title="AI Chat Session is Idle"
            description="The interactive conversational assistant will be activated in Module 5 when Google Gemini API integration and document embeddings are configured."
            badgeText="Gemini LLM Integration Module"
          >
            <div className="mt-8 max-w-lg mx-auto text-left space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
                Upcoming Prompt Capabilities
              </p>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span>"What are my termination notice obligations under this contract?"</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span>"Summarize section 5 indemnification in two non-technical sentences."</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span>"Generate a checklist of questions I should ask a contract lawyer."</span>
              </div>
            </div>
          </EmptyState>
        </CardContent>

        {/* Disabled Chat Input Area */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 rounded-b-xl">
          <div className="flex items-center gap-2">
            <input
              type="text"
              disabled
              placeholder="Chat input is disabled until Gemini LLM integration in Module 5..."
              className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-400 cursor-not-allowed"
            />
            <button
              disabled
              className="px-4 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-400 text-xs font-medium cursor-not-allowed flex items-center gap-1.5"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
