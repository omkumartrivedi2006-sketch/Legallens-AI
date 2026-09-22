import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Trash2,
  FileText,
  FileCode,
  FileCheck2,
  Calendar,
  FileSpreadsheet,
  Copy,
  Check,
  Search,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Database,
  Sparkles,
  RefreshCw,
  MessageSquare,
  GitCompare,
  ListTodo,
} from 'lucide-react';

import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DocumentStatusBadge } from '../components/documents/DocumentStatus';
import { DeleteConfirmModal } from '../components/documents/DeleteConfirmModal';
import { useDocument } from '../hooks/useDocument';
import { useDocumentAnalysis } from '../hooks/useDocumentAnalysis';
import { formatFileSize } from '../types/document';

import { LegalDisclaimerBanner } from '../components/analysis/LegalDisclaimerBanner';
import { AnalysisOverview } from '../components/analysis/AnalysisOverview';
import { PartiesAndDates } from '../components/analysis/PartiesAndDates';
import { KeyObligationsList } from '../components/analysis/KeyObligationsList';
import { ImportantClausesList } from '../components/analysis/ImportantClausesList';
import { ConcernsAndQuestions } from '../components/analysis/ConcernsAndQuestions';

export const DocumentDetailsPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { document, loading, error, downloading, getDownloadUrl, deleteThisDocument } =
    useDocument(documentId);

  const {
    latestAnalysis,
    isAnalyzing,
    error: analysisError,
    triggerAnalysis,
  } = useDocumentAnalysis(documentId);

  const [activeTab, setActiveTab] = useState<'analysis' | 'text'>('analysis');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [localAnalysisError, setLocalAnalysisError] = useState<string | null>(null);

  const handleDownload = async () => {
    try {
      const url = await getDownloadUrl();
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document?.originalFileName || document?.fileName || 'document';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } catch (err: any) {
      alert(err?.message || 'Failed to download file.');
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteThisDocument();
      navigate('/documents');
    } catch (err: any) {
      alert(err?.message || 'Failed to delete document.');
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleCopyText = async () => {
    if (!document?.extractedText) return;
    try {
      await navigator.clipboard.writeText(document.extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert('Failed to copy text to clipboard.');
    }
  };

  const handleStartAnalysis = async () => {
    if (!document) return;
    if (document.processingStatus !== 'ready') {
      alert('Document is still being processed. Please wait until text extraction is complete.');
      return;
    }
    if (!document.extractedText) {
      alert('No extracted text available to analyze.');
      return;
    }

    setLocalAnalysisError(null);
    try {
      await triggerAnalysis({
        fileName: document.originalFileName || document.fileName,
        fileType: document.fileType,
        extractedText: document.extractedText,
        processingStatus: document.processingStatus,
      });
      setActiveTab('analysis');
    } catch (err: any) {
      setLocalAnalysisError(err?.message || 'Failed to analyze document.');
    }
  };

  const filteredText = useMemo(() => {
    if (!document?.extractedText) return '';
    return document.extractedText;
  }, [document?.extractedText]);

  const searchStats = useMemo(() => {
    if (!searchTerm.trim() || !document?.extractedText) return null;
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = document.extractedText.match(regex);
    return matches ? matches.length : 0;
  }, [searchTerm, document?.extractedText]);

  const getFileIcon = (type?: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />;
      case 'docx':
        return <FileCheck2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
      case 'txt':
        return <FileCode className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <FileSpreadsheet className="h-6 w-6 text-slate-500" />;
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 dark:text-blue-400 mb-3" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Loading document details...
        </p>
        <p className="text-xs text-slate-400 mt-1">Verifying access permissions</p>
      </div>
    );
  }

  // Not found or unauthorized
  if (error || !document) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 w-fit mx-auto text-slate-500">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Document not found
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            The requested document could not be found or you do not have permission to view it.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/documents')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Documents
        </Button>
      </div>
    );
  }

  const formattedDate = new Date(document.uploadedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const effectiveAnalysisError = localAnalysisError || analysisError;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Primary Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          to="/documents"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Documents</span>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Analyze / Re-analyze button */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleStartAnalysis}
            isLoading={isAnalyzing}
            disabled={document.processingStatus !== 'ready' || !document.extractedText || isAnalyzing}
          >
            {isAnalyzing ? (
              'Analyzing with Gemini...'
            ) : latestAnalysis ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Re-analyze Document
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Analyze Document
              </>
            )}
          </Button>

          {/* Chat with Document button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/chat/${document.id}`)}
            disabled={document.processingStatus !== 'ready' || !document.extractedText}
            className="border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
            Chat with Document
          </Button>

          {/* Compare Document button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/compare?docA=${document.id}`)}
            disabled={document.processingStatus !== 'ready' || !document.extractedText}
            className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850"
          >
            <GitCompare className="h-3.5 w-3.5 mr-1.5 text-indigo-600 dark:text-indigo-400" />
            Compare
          </Button>

          {/* Legal Insights & Action Center button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/insights/${document.id}`)}
            disabled={document.processingStatus !== 'ready' || !document.extractedText}
            className="border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          >
            <ListTodo className="h-3.5 w-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" />
            Legal Insights
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={downloading}
            isLoading={downloading}
          >
            <Download className="h-4 w-4 mr-1.5" />
            Download Original
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900/60"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Header Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0">
                {getFileIcon(document.fileType)}
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white break-all">
                    {document.originalFileName || document.fileName}
                  </h1>
                  <DocumentStatusBadge
                    status={document.processingStatus}
                    errorMessage={document.errorMessage}
                  />
                  {latestAnalysis && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                      <Sparkles className="h-3 w-3 text-blue-500" /> AI Analyzed
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
                  <span className="font-mono uppercase font-semibold text-slate-700 dark:text-slate-300">
                    {document.fileType}
                  </span>
                  <span>•</span>
                  <span>{formatFileSize(document.fileSize)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formattedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Metadata Summary Pill */}
            <div className="flex items-center gap-3 self-start md:self-auto p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
              {document.pageCount && document.pageCount > 0 && (
                <div className="text-center px-2">
                  <p className="font-bold text-slate-900 dark:text-white">{document.pageCount}</p>
                  <p className="text-[11px] text-slate-400">Pages</p>
                </div>
              )}
              {document.wordCount !== undefined && (
                <div className="text-center px-2 border-l border-slate-200 dark:border-slate-700">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {document.wordCount.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-400">Words</p>
                </div>
              )}
              <div className="text-center px-2 border-l border-slate-200 dark:border-slate-700">
                <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Isolated
                </p>
                <p className="text-[11px] text-slate-400">User Scoped</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Switcher: AI Analysis vs Extracted Text */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'analysis'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Legal Analysis</span>
          {latestAnalysis && (
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('text')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'text'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Database className="h-3.5 w-3.5" />
          <span>Extracted Text</span>
        </button>
      </div>

      {/* Analysis Error Notification */}
      {effectiveAnalysisError && (
        <div className="flex items-start justify-between gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50/90 dark:border-rose-900/60 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 text-xs animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-950 dark:text-rose-100">
                AI Analysis Notice
              </p>
              <p className="mt-0.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                {effectiveAnalysisError}
              </p>
            </div>
          </div>
          <button
            onClick={() => setLocalAnalysisError(null)}
            className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-200 font-bold p-1"
          >
            ×
          </button>
        </div>
      )}

      {/* TAB 1: AI LEGAL ANALYSIS */}
      {activeTab === 'analysis' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Ongoing Analysis Spinner */}
          {isAnalyzing ? (
            <Card className="border-blue-200/80 bg-gradient-to-b from-blue-50/40 to-transparent dark:border-blue-900/50">
              <CardContent className="py-16 text-center space-y-3">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    Analyzing Document with Gemini
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                    LegalLens AI is reading the document text, verifying named parties, structuring
                    dates, translating clauses into plain English, and generating lawyer questions.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100/70 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                  Grounded factual evaluation in progress
                </div>
              </CardContent>
            </Card>
          ) : latestAnalysis?.result ? (
            <div className="space-y-5">
              {/* Disclaimer */}
              <LegalDisclaimerBanner />

              {/* Executive Overview & Classification */}
              <AnalysisOverview analysis={latestAnalysis} />

              {/* Identified Parties & Key Dates */}
              <PartiesAndDates
                parties={latestAnalysis.result.parties}
                importantDates={latestAnalysis.result.importantDates}
              />

              {/* Key Duties & Obligations */}
              <KeyObligationsList obligations={latestAnalysis.result.keyObligations} />

              {/* Core Clauses Breakdown */}
              <ImportantClausesList clauses={latestAnalysis.result.importantClauses} />

              {/* Concerns, Missing Info & Lawyer Questions */}
              <ConcernsAndQuestions
                concerns={latestAnalysis.result.potentialConcerns}
                missingInfo={latestAnalysis.result.missingOrUnclearInformation}
                lawyerQuestions={latestAnalysis.result.lawyerQuestions}
              />
            </div>
          ) : (
            /* No Analysis Yet Empty State */
            <Card>
              <CardContent className="py-16 text-center space-y-4">
                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 w-fit mx-auto border border-blue-100 dark:border-blue-900/40">
                  <Sparkles className="h-8 w-8" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    No AI analysis generated yet
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Run our grounded GenAI analysis on this document to extract an executive summary,
                    named parties, critical deadlines, affirmative obligations, plain-English clause breakdowns,
                    and tailored questions for legal counsel.
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleStartAnalysis}
                    disabled={document.processingStatus !== 'ready' || !document.extractedText}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Document with Gemini
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: EXTRACTED TEXT VIEWER */}
      {activeTab === 'text' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Extracted Document Text
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verbatim machine-readable text extracted from the uploaded file for analysis.
              </p>
            </div>

            {document.extractedText && (
              <div className="flex items-center gap-2">
                {/* In-text search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Find in document..."
                    className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {searchStats !== null && (
                  <span className="text-[11px] font-medium px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900">
                    {searchStats} {searchStats === 1 ? 'match' : 'matches'}
                  </span>
                )}

                {/* Copy Button */}
                <Button variant="outline" size="sm" onClick={handleCopyText}>
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Copy Text
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Text Container */}
          {document.processingStatus === 'uploading' || document.processingStatus === 'processing' ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 dark:text-blue-400 mb-3" />
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Processing document text...
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Parsing document structure, extracting clauses and text strings.
                </p>
              </CardContent>
            </Card>
          ) : document.processingStatus === 'failed' ? (
            <Card className="border-rose-200 bg-rose-50/20 dark:border-rose-900/40 dark:bg-rose-950/10">
              <CardContent className="py-8 text-center text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="h-6 w-6 mx-auto mb-2 text-rose-600" />
                <p className="font-semibold text-sm">Text extraction encountered an issue</p>
                <p className="mt-1 text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  {document.errorMessage ||
                    'The document could not be read. Please ensure the file is not corrupted or password-protected.'}
                </p>
              </CardContent>
            </Card>
          ) : document.extractedText ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-inner overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto p-6 text-xs text-slate-800 dark:text-slate-200 font-mono leading-relaxed whitespace-pre-wrap select-text">
                {filteredText}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-xs text-slate-500">
                <p>No extracted text available for this document.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        documentTitle={document.originalFileName || document.fileName}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
