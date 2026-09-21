import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  MessageSquare,
  GitCompare,
  AlertTriangle,
  Upload,
  Brain,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  FileSearch,
  Scale,
  Lock,
  Sparkles,
  Info,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';

export const LandingPage: React.FC = () => {
  const features = [
    {
      icon: FileText,
      title: 'Understand Documents',
      description:
        'Turn complex legal jargon and dense boilerplate clauses into straightforward, accessible explanations.',
      badge: 'Core Analysis',
    },
    {
      icon: MessageSquare,
      title: 'Ask Questions',
      description:
        'Interact with uploaded documents in natural language to locate specific definitions, terms, and context-aware answers.',
      badge: 'Contextual AI',
    },
    {
      icon: GitCompare,
      title: 'Compare Documents',
      description:
        'Compare two agreements, contract drafts, or terms of service to highlight structural additions, deletions, and deviations.',
      badge: 'Diffing Engine',
    },
    {
      icon: FileSearch,
      title: 'Identify Important Clauses',
      description:
        'Surface essential obligations, conditions, notice periods, renewal dates, and payment schedules at a glance.',
      badge: 'Clause Extraction',
    },
    {
      icon: AlertTriangle,
      title: 'Find Potential Risks',
      description:
        'Detect unusual indemnity terms, unilateral termination clauses, or aggressive non-compete provisions for closer review.',
      badge: 'Risk Review',
    },
    {
      icon: Scale,
      title: 'Prepare for a Lawyer',
      description:
        'Organize key ambiguities into structured question lists and prioritized checklists for productive legal consultations.',
      badge: 'Consultation Prep',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Upload',
      description:
        'Select your contract, agreement, or policy in supported formats (PDF, DOCX).',
      icon: Upload,
    },
    {
      step: '02',
      title: 'Analyze',
      description:
        'LegalLens AI processes document structure, terminology, and clause relationships.',
      icon: Brain,
    },
    {
      step: '03',
      title: 'Understand',
      description:
        'Examine structured clause summaries, risk indicators, and ask targeted questions.',
      icon: BookOpen,
    },
    {
      step: '04',
      title: 'Take the Next Step',
      description:
        'Export key summaries and prepare targeted questions for a qualified legal practitioner.',
      icon: Scale,
    },
  ];

  const trustPrinciples = [
    {
      title: 'Responsible AI & Verifiable Insights',
      description:
        'AI output can produce errors or omissions. Every summary connects back to document text so you can verify each point.',
      icon: Sparkles,
    },
    {
      title: 'Legal Information, Not Representation',
      description:
        'LegalLens AI is an educational document comprehension platform. It is not an attorney and does not formulate legal strategy.',
      icon: Info,
    },
    {
      title: 'Confidentiality By Design',
      description:
        'Your documents belong to you. We design for secure storage, strict access control, and user data privacy.',
      icon: Lock,
    },
    {
      title: 'Consult Qualified Professionals',
      description:
        'High-stakes agreements and court proceedings require licensed legal counsel. Use our checklists to reduce billing hours.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-24 md:space-y-32 pb-24 overflow-hidden">
      {/* ========================================================== */}
      {/* 1. HERO SECTION */}
      {/* ========================================================== */}
      <section className="relative pt-8 md:pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Hero Copy */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen Legal Document Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Understand Legal Documents.{' '}
              <span className="text-blue-600 dark:text-blue-400">Clearly.</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              LegalLens AI helps you understand, compare, and navigate legal documents
              using AI-powered analysis — in simpler, clearer language.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/dashboard">
                <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Get Started
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg">
                  Explore Features
                </Button>
              </a>
            </div>

            {/* Subtle Mandatory Disclaimer */}
            <div className="pt-4 flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-slate-800">
              <Info className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
              <span>
                <strong>Informational Notice:</strong> LegalLens AI is a document
                comprehension assistant and does not provide formal legal advice or
                attorney-client representation.
              </span>
            </div>
          </div>

          {/* Hero Visual: Real CSS/React Interactive Legal Card Breakdown */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl dark:shadow-blue-950/20">
              {/* Card Titlebar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Master_Services_Agreement.pdf
                  </span>
                </div>
                <Badge variant="primary">AI Breakdown</Badge>
              </div>

              {/* Document Clause Mock Item 1 */}
              <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 mb-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                    Clause 14.2 — Termination for Convenience
                  </span>
                  <Badge variant="warning">30-Day Notice</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Plain English:</span> Either party may cancel this agreement without cause upon providing 30 calendar days written notice.
                </p>
              </div>

              {/* Document Clause Mock Item 2: Risk Flag */}
              <div className="rounded-lg border border-rose-200/70 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 p-3.5 mb-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                    Clause 8.1 — Uncapped Indemnification
                  </span>
                  <Badge variant="danger">Review Advised</Badge>
                </div>
                <p className="text-xs text-rose-800/80 dark:text-rose-300/80 leading-normal">
                  Vendor liability is uncapped regarding indirect and consequential third-party claims. Discuss liability ceiling with your lawyer.
                </p>
              </div>

              {/* AI Q&A Mock Snippet */}
              <div className="rounded-lg border border-blue-200/60 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900 dark:text-blue-300">
                  <MessageSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  Q: Does this contract renew automatically?
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <strong>A:</strong> Yes. It renews for consecutive 12-month periods unless written non-renewal is submitted 60 days prior.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 2. FEATURES SECTION */}
      {/* ========================================================== */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <SectionHeader
          badge="Product Capabilities"
          title="Designed for Clarity in Legal Complexity"
          subtitle="LegalLens AI equips you with structured analysis tools to unpack contracts, highlight risk factors, and accelerate legal review."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 hover:-translate-y-1"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="default" className="text-[11px]">
                      {feature.badge}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ========================================================== */}
      {/* 3. HOW IT WORKS */}
      {/* ========================================================== */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <SectionHeader
          badge="Step-by-Step Workflow"
          title="From Raw Document to Actionable Understanding"
          subtitle="A clear, structured workflow designed to demystify complex agreements without guessing."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-200 dark:text-slate-800 tracking-tight">
                      {step.step}
                    </span>
                    <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="h-5 w-5 text-slate-300 dark:text-slate-700" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================== */}
      {/* 4. TRUST & SAFETY SECTION */}
      {/* ========================================================== */}
      <section id="trust" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/60 p-8 sm:p-12">
          <SectionHeader
            badge="Responsible Technology"
            title="Our Commitment to Responsible Legal AI"
            subtitle="We build tools that inform, structure, and clarify — while maintaining rigorous ethical and realistic boundaries."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {trustPrinciples.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex gap-4 p-5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-sm"
                >
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center mt-0.5">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 5. BOTTOM CALL TO ACTION */}
      {/* ========================================================== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-gradient-to-b from-blue-50/80 to-white dark:from-blue-950/40 dark:to-slate-900 p-8 sm:p-12 shadow-sm space-y-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow">
            <Scale className="h-6 w-6" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Ready to Navigate Your Legal Documents with Confidence?
          </h2>

          <p className="text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Experience plain-English clause analysis, structured comparison tools, and intelligent document navigation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link to="/dashboard">
              <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Launch LegalLens AI
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">
                Account Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
