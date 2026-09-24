import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  CheckCircle2,
  Clock,
  Upload,
  GitCompare,
  FileText,
  Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { DocumentRecord, DocumentVersion, formatFileSize } from '../../types/document';
import { documentService } from '../../services/documentService';
import { useAuth } from '../../hooks/useAuth';
import { UploadVersionModal } from './UploadVersionModal';

interface VersionHistoryPanelProps {
  document: DocumentRecord;
  versions: DocumentVersion[];
  onRefresh: () => void;
}

export const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({
  document,
  versions,
  onRefresh,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [settingCurrentId, setSettingCurrentId] = useState<string | null>(null);

  const handleSetCurrent = async (versionId: string) => {
    if (!user) return;
    try {
      setSettingCurrentId(versionId);
      await documentService.setCurrentVersion(user.uid, document.id, versionId);
      onRefresh();
    } catch (err: any) {
      alert(err?.message || 'Failed to switch current version.');
    } finally {
      setSettingCurrentId(null);
    }
  };

  const handleCompare = (versionAId: string, versionBId: string) => {
    navigate(
      `/compare?docA=${document.id}&versionA=${versionAId}&docB=${document.id}&versionB=${versionBId}`
    );
  };

  // Find the current active version
  const currentVersion =
    versions.find((v) => v.isCurrent) ||
    versions.find((v) => v.id === document.currentVersionId) ||
    versions[0];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <History className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Document Version History</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Full version audit trail for <strong>{document.originalFileName || document.fileName}</strong>.
              </CardDescription>
            </div>

            <Button
              size="sm"
              onClick={() => setIsUploadModalOpen(true)}
              leftIcon={<Upload className="h-3.5 w-3.5" />}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Upload New Version
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {versions.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <FileText className="h-8 w-8 mx-auto text-slate-400" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Primary Initial Version (v1)
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                This document is operating on its original uploaded revision. Upload an updated contract draft or revision to maintain an immutable version history.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUploadModalOpen(true)}
                leftIcon={<Upload className="h-3.5 w-3.5" />}
                className="mt-3 text-xs"
              >
                Upload Revision
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              {versions.map((version) => {
                const isCurrent =
                  version.isCurrent ||
                  version.id === document.currentVersionId ||
                  (versions.length === 1 && version.versionNumber === 1);

                return (
                  <div
                    key={version.id}
                    className={`p-4 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isCurrent
                        ? 'bg-blue-50/40 dark:bg-blue-950/20'
                        : 'bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    {/* Left: Version Info */}
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                          Version {version.versionNumber}
                        </span>

                        {isCurrent ? (
                          <Badge variant="success" className="gap-1 text-[10px] py-0.5">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Current Active Version</span>
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] py-0.5 text-slate-500">
                            Revision Archive
                          </Badge>
                        )}

                        {version.processingStatus === 'ready' && (
                          <Badge variant="default" className="text-[10px] py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200">
                            Ready
                          </Badge>
                        )}

                        {version.processingStatus === 'processing' && (
                          <Badge variant="warning" className="text-[10px] py-0.5 gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Processing
                          </Badge>
                        )}

                        {version.processingStatus === 'failed' && (
                          <Badge variant="danger" className="text-[10px] py-0.5">
                            Failed
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                        {version.fileName || version.originalFileName}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Uploaded on {new Date(version.uploadedAt || version.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <span>{formatFileSize(version.fileSize)}</span>
                        {version.contentHash && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              SHA: {version.contentHash.slice(0, 10)}...
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Set as current button */}
                      {!isCurrent && version.processingStatus === 'ready' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetCurrent(version.id)}
                          isLoading={settingCurrentId === version.id}
                          className="text-xs"
                        >
                          Make Current
                        </Button>
                      )}

                      {/* Compare with current */}
                      {!isCurrent && currentVersion && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCompare(version.id, currentVersion.id)}
                          leftIcon={<GitCompare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                        >
                          Compare with Current
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload New Version Modal */}
      <UploadVersionModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        documentId={document.id}
        existingVersions={versions}
        onVersionUploaded={() => {
          onRefresh();
          setIsUploadModalOpen(false);
        }}
      />
    </div>
  );
};
