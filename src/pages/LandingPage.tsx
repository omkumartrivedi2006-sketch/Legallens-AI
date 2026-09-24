import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
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
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SectionHeader } from '../components/ui/SectionHeader';

export const LandingPage: React.FC = () => {
  const coreFeatures = [
    {
      icon: Brain,
      title: 'Smart Analysis',
      description:
        'AI-powered document intelligence that translates complex legal jargon and boilerplate clauses into clear plain English.',
    },
    {
      icon: AlertTriangle,
      title: 'Risk Detection',
      description:
        'Identify potential risks, uncapped indemnity liabilities, non-standard termination penalties, and subtle ambiguities.',
    },
    {
      icon: FileSearch,
      title: 'Clause Highlighting',
      description:
        'Instantly locate key provisions including payment schedules, confidentiality terms, governing laws, and milestone dates.',
    },
    {
      icon: Lock,
      title: 'Secure & Private',
      description:
        'Enterprise-grade session isolation and private storage architecture designed to keep your confidential documents protected.',
    },
    {
      icon: GitCompare,
      title: 'Document Comparison',
      description:
        'Perform semantic diffing between two contract versions to immediately flag modified terms, removed clauses, and new duties.',
    },
    {
      icon: Scale,
      title: 'Lawyer Preparation',
      description:
        'Generate structured question lists, affirmative duty checklists, and organized summaries to make legal consultations efficient.',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Upload Document',
      description:
        'Upload your agreement, NDA, vendor contract, or terms in standard PDF, DOCX, or TXT format.',
      icon: Upload,
    },
    {
      step: '02',
      title: 'Automated Extraction',
      description:
        'Document structure, section hierarchies, dates, and affirmative obligations are processed with strict text grounding.',
      icon: FileText,
    },
    {
      step: '03',
      title: 'Review Key Insights',
      description:
        'Examine executive summaries, risk alerts, and milestone deadlines through our structured Action Center.',
      icon: BookOpen,
    },
    {
      step: '04',
      title: 'Consult with Clarity',
      description:
        'Export structured summaries and lawyer prep questions to save hours during attorney reviews.',
      icon: Scale,
    },
  ];

  const trustPrinciples = [
    {
      title: 'Strict Document Grounding',
      description:
        'Every answer and summary is grounded strictly in the source text with verifiable section references.',
      icon: CheckCircle2,
    },
    {
      title: 'Session & Data Isolation',
      description:
        'Multi-tenant security boundaries guarantee that your documents remain strictly private to your account.',
      icon: Lock,
    },
    {
      title: 'Educational & Informational Role',
      description:
        'Designed as an intelligent comprehension assistant to aid understanding, not replace formal attorney counsel.',
      icon: ShieldCheck,
    },
    {
      title: 'Deterministic Diffing & AI Synthesis',
      description:
        'Combines deterministic structural alignment with semantic AI explanations for accurate version comparisons.',
      icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-20 md:space-y-28 pb-20 overflow-hidden">
      {/* ========================================================== */}
      {/* 1. HERO SECTION — FULL-BLEED ARTWORK BACKGROUND */}
      {/* ========================================================== */}
      <section className="relative w-full min-h-[90vh] md:min-h-[85vh] lg:min-h-[88vh] flex items-center bg-[#050505] overflow-hidden pt-20">
        {/* Full-bleed background image */}
        <div
          className="absolute inset-0 bg-cover bg-center md:bg-[center_right] pointer-events-none select-none transition-opacity duration-300"
          style={{
            backgroundImage: `url('/1000858896.jpg')`,
          }}
          aria-hidden="true"
        />

        {/* Directional neutral black gradient overlay: stronger on left for readability, transparent on right */}
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/85 via-black/50 to-transparent dark:from-[#050505]/95 dark:via-[#050505]/60 dark:to-transparent"
          aria-hidden="true"
        />

        {/* Soft bottom blend to transition smoothly into the page body */}
        <div
          className="absolute inset-x-0 bottom-0 h-28 pointer-events-none bg-gradient-to-t from-white dark:from-[#050505] to-transparent"
          aria-hidden="true"
        />

        {/* Hero Content — Positioned strictly on the left over natural negative space */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-28 w-full">
          <div className="max-w-xl lg:max-w-2xl text-left space-y-6">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium bg-white/10 dark:bg-white/[0.08] backdrop-blur-md text-neutral-200 border border-white/20">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>AI-Powered Legal Intelligence</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold tracking-tight text-white leading-[1.14]">
              Understand Your Legal Documents with <span className="text-blue-400">Clarity</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg md:text-[18px] text-neutral-300 dark:text-[#D1D5DB] leading-relaxed max-w-xl font-normal">
              Analyze contracts, identify important clauses, understand obligations, and uncover potential risks with AI-powered document intelligence.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link to="/dashboard">
                <Button size="lg" className="px-6 font-semibold shadow-xs" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Analyze a Document
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg" className="border-white/25 text-white hover:bg-white/10">
                  Explore Features
                </Button>
              </a>
            </div>

            {/* Subtle Mandatory Disclaimer */}
            <div className="pt-4 flex items-start gap-2.5 text-xs text-neutral-400 dark:text-[#A3A3A3] border-t border-white/15 max-w-lg">
              <Info className="h-4 w-4 shrink-0 text-neutral-400 mt-0.5" />
              <span>
                <strong>Informational Notice:</strong> LegalLens AI is a document comprehension platform and does not provide formal legal advice or representation.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 2. MINIMAL FEATURE SECTION */}
      {/* ========================================================== */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <SectionHeader
          badge="Product Capabilities"
          title="Designed for Clarity in Legal Complexity"
          subtitle="LegalLens AI equips you with structured intelligence tools to unpack agreements, surface affirmative obligations, and accelerate contract reviews."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {coreFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group p-6 hover:border-neutral-300 dark:hover:border-white/20 transition-all duration-150"
              >
                <div className="h-10 w-10 rounded-lg bg-neutral-100 dark:bg-[#151515] border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-neutral-200 flex items-center justify-center mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-[#858585] leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ========================================================== */}
      {/* 3. HOW IT WORKS SECTION */}
      {/* ========================================================== */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <SectionHeader
          badge="Simple Workflow"
          title="From Raw Legal Text to Actionable Insights"
          subtitle="Four straightforward steps to demystify complex agreements and track contractual obligations."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.step} className="p-5 sm:p-6 relative overflow-hidden">
                <div className="text-2xl font-bold font-mono text-neutral-300 dark:text-[#333333] mb-3">
                  {item.step}
                </div>
                <div className="h-8 w-8 rounded-md bg-neutral-100 dark:bg-[#151515] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 flex items-center justify-center mb-3">
                  <Icon className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1.5">
                  {item.title}
                </h4>
                <p className="text-xs text-neutral-600 dark:text-[#858585] leading-relaxed">
                  {item.description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ========================================================== */}
      {/* 4. SECURITY & TRUST PRINCIPLES */}
      {/* ========================================================== */}
      <section id="trust" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="p-8 sm:p-10 rounded-2xl bg-neutral-50 dark:bg-[#0A0A0A] border border-neutral-200 dark:border-white/10">
          <SectionHeader
            badge="Security & Compliance"
            title="Built for Confidentiality and Verifiability"
            subtitle="Engineered with strict isolation boundaries and verifiable text grounding for responsible document analysis."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {trustPrinciples.map((tp) => {
              const Icon = tp.icon;
              return (
                <div key={tp.title} className="flex items-start gap-3.5">
                  <div className="h-8 w-8 rounded-lg bg-neutral-100 dark:bg-[#151515] border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-neutral-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {tp.title}
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-[#858585] leading-relaxed">
                      {tp.description}
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
        <div className="p-8 sm:p-12 rounded-2xl bg-neutral-900 dark:bg-[#101010] text-white border border-neutral-800 dark:border-white/10 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white max-w-xl mx-auto">
            Experience Intelligent Contract Comprehension Today
          </h2>
          <p className="text-sm text-neutral-300 dark:text-[#B8B8B8] max-w-lg mx-auto leading-relaxed">
            Upload your contracts to instantly surface affirmative duties, identify hidden risk factors, and compare document revisions.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link to="/dashboard">
              <Button size="lg" className="px-6 font-semibold" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Get Started with LegalLens AI
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                Sign In to Workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
