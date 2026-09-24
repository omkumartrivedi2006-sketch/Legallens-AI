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
  Check,
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
        'Identify potential risks, unhedged liabilities, one-sided indemnity, and aggressive termination clauses before signing.',
    },
    {
      icon: FileSearch,
      title: 'Clause Highlighting',
      description:
        'Quickly isolate key contractual provisions, obligations, jurisdiction covenants, and non-compete stipulations.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure & Private',
      description:
        'Client-side session isolation and enterprise security policies ensure your contracts remain strictly confidential.',
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

  const pricingTiers = [
    {
      name: 'Starter',
      description: 'Ideal for individuals reviewing personal leases, NDAs, and basic agreements.',
      price: '$0',
      period: '/ month',
      features: [
        'Up to 10 document analyses / mo',
        'Plain-English clause breakdown',
        'Basic risk & obligation extraction',
        'Standard PDF and DOCX support',
      ],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      name: 'Professional',
      description: 'For founders, freelancers, and businesses managing active vendor agreements.',
      price: '$29',
      period: '/ month',
      features: [
        'Unlimited document analyses',
        'Full semantic contract comparison',
        'Interactive action checklists',
        'Cross-document unified search',
        'Priority Gemini 1.5 Pro processing',
      ],
      cta: 'Start 14-Day Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      description: 'For corporate legal teams and law firms requiring isolated infrastructure.',
      price: '$99',
      period: '/ month',
      features: [
        'Custom team workspace & seats',
        'Private Cloud tenant isolation',
        'Dedicated API access & webhooks',
        'SOC2 compliance reporting',
        'Dedicated legal engineer support',
      ],
      cta: 'Contact Enterprise',
      popular: false,
    },
  ];

  return (
    <div className="space-y-20 md:space-y-28 pb-20 overflow-hidden">
      {/* ========================================================== */}
      {/* 1. HERO SECTION — FULL-BLEED ARTWORK BACKGROUND WITH GLASS */}
      {/* ========================================================== */}
      <section className="relative w-full min-h-[92vh] md:min-h-[88vh] flex items-center bg-[#F7F9FC] dark:bg-[#050505] overflow-hidden pt-24 pb-16 transition-colors duration-500">
        {/* Full-bleed background image — LIGHT MODE */}
        <div
          className="absolute inset-0 bg-cover bg-center md:bg-[center_right] pointer-events-none select-none transition-opacity duration-500 opacity-100 dark:opacity-0"
          style={{
            backgroundImage: `url('/1000858896_light.jpg')`,
          }}
          aria-hidden="true"
        />

        {/* Full-bleed background image — DARK MODE */}
        <div
          className="absolute inset-0 bg-cover bg-center md:bg-[center_right] pointer-events-none select-none transition-opacity duration-500 opacity-0 dark:opacity-100"
          style={{
            backgroundImage: `url('/1000858896.jpg')`,
          }}
          aria-hidden="true"
        />

        {/* Directional gradient overlay: stronger on left for text readability, clear on right */}
        <div
          className="absolute inset-0 pointer-events-none transition-colors duration-500 bg-gradient-to-r from-[#F7F9FC]/95 via-[#F7F9FC]/75 to-transparent dark:from-[#050505]/90 dark:via-[#050505]/50 dark:to-transparent"
          aria-hidden="true"
        />

        {/* Soft bottom blend to transition into the page body */}
        <div
          className="absolute inset-x-0 bottom-0 h-28 pointer-events-none transition-colors duration-500 bg-gradient-to-t from-[#F7F9FC] dark:from-[#050505] to-transparent"
          aria-hidden="true"
        />

        {/* Hero Content — Positioned on the left over natural negative space inside a subtle glass layer */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-xl lg:max-w-2xl text-left">
            {/* Subtle Glass Card Layer for Hero Content */}
            <div className="p-6 sm:p-8 md:p-9 rounded-3xl bg-white/75 dark:bg-black/40 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-xl dark:shadow-2xl space-y-6 transition-all duration-300">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 dark:bg-blue-500/15 backdrop-blur-md text-blue-700 dark:text-blue-300 border border-blue-500/20 dark:border-blue-400/30">
                <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>AI-Powered Legal Intelligence</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.14]">
                Understand Your Legal Documents with <span className="text-blue-600 dark:text-blue-400">Clarity</span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-neutral-200 leading-relaxed font-normal">
                Analyze contracts, identify important clauses, understand obligations, and uncover potential risks with AI-powered document intelligence.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <Link to="/dashboard">
                  <Button size="lg" className="px-6 font-semibold shadow-md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Analyze a Document
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="secondary" size="lg" className="border-slate-300/80 dark:border-white/20 text-slate-800 dark:text-white bg-slate-100/70 dark:bg-white/10 hover:bg-slate-200/80 dark:hover:bg-white/15 backdrop-blur-md">
                    Explore Features
                  </Button>
                </a>
              </div>

              {/* Subtle Mandatory Disclaimer */}
              <div className="pt-3 flex items-start gap-2.5 text-xs text-slate-500 dark:text-neutral-300 border-t border-slate-200/70 dark:border-white/10">
                <Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                <span>
                  <strong>Informational Notice:</strong> LegalLens AI is a document comprehension platform and does not provide formal legal advice or representation.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 2. MINIMAL FEATURE SECTION — TRANSPARENT GLASS CARDS */}
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
                className="group p-6 hover:border-blue-500/40 transition-all duration-200"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
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
      {/* 3. HOW IT WORKS SECTION — LAYERED GLASS WORKFLOW */}
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
              <Card key={item.step} className="p-5 sm:p-6 relative overflow-hidden group">
                <div className="text-2xl font-bold font-mono text-neutral-300 dark:text-white/20 mb-3 group-hover:text-blue-500/60 transition-colors">
                  {item.step}
                </div>
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
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
      {/* 4. PRICING SECTION — GLASS TIERS */}
      {/* ========================================================== */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <SectionHeader
          badge="Transparent Pricing"
          title="Simple, Predictable Plans"
          subtitle="Enterprise-grade legal intelligence for individual reviewers, growth companies, and counsel teams."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.name}
              className={`p-7 flex flex-col justify-between relative ${
                tier.popular
                  ? 'border-blue-500/50 dark:border-blue-500/40 ring-1 ring-blue-500/30'
                  : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-blue-600 text-white shadow-xs">
                  Most Popular
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{tier.name}</h3>
                  <p className="text-xs text-neutral-500 dark:text-[#858585] mt-1 leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-1 pt-1 pb-3 border-b border-slate-200/80 dark:border-white/10">
                  <span className="text-3xl font-extrabold text-neutral-900 dark:text-white font-mono">
                    {tier.price}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-[#858585]">{tier.period}</span>
                </div>

                <ul className="space-y-2.5 text-xs text-neutral-700 dark:text-neutral-300">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <Link to="/register">
                  <Button
                    variant={tier.popular ? 'primary' : 'secondary'}
                    size="md"
                    className="w-full text-xs"
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ========================================================== */}
      {/* 5. SECURITY & TRUST PRINCIPLES — GLASS CONTAINER */}
      {/* ========================================================== */}
      <section id="trust" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="p-8 sm:p-10 rounded-3xl bg-white/70 dark:bg-white/[0.045] backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-sm">
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
                  <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-4 w-4" />
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
      {/* 6. BOTTOM CALL TO ACTION — ELEVATED GLASS CONTAINER */}
      {/* ========================================================== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/90 dark:bg-white/[0.055] backdrop-blur-xl border border-slate-800 dark:border-white/15 text-white shadow-2xl space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white max-w-xl mx-auto">
            Experience Intelligent Contract Comprehension Today
          </h2>
          <p className="text-sm text-neutral-300 dark:text-[#B8B8B8] max-w-lg mx-auto leading-relaxed">
            Upload your contracts to instantly surface affirmative duties, identify hidden risk factors, and compare document revisions.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link to="/dashboard">
              <Button size="lg" className="px-6 font-semibold shadow-md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Get Started with LegalLens AI
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" className="border-white/20 text-white bg-white/10 hover:bg-white/15 backdrop-blur-md">
                Sign In to Workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
