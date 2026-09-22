import { retrievalService, DocumentChunk } from './retrievalService';

export interface AlignedSectionDiff {
  sectionKey: string;
  headingA?: string;
  headingB?: string;
  textA?: string;
  textB?: string;
  pageA?: number;
  pageB?: number;
  status: 'added' | 'removed' | 'modified' | 'unchanged';
}

export const diffService = {
  /**
   * Normalizes document text while preserving legal distinctions, numbers, and punctuation.
   */
  normalizeText(text: string): string {
    if (!text) return '';
    return text
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
      .trim();
  },

  /**
   * Normalizes a heading for semantic cross-document alignment (e.g. "Section 4. Termination" -> "termination").
   */
  normalizeHeading(heading?: string): string {
    if (!heading) return '';
    return heading
      .toLowerCase()
      .replace(/^(section|article|clause|paragraph)\s+[\dA-Z.]+/i, '')
      .replace(/^[\d.]+\s*/, '')
      .replace(/[:\-_\s]+/g, ' ')
      .trim();
  },

  /**
   * Aligns sections between Document A and Document B and deterministically classifies them.
   */
  alignAndDiffSections(
    extractedTextA: string,
    extractedTextB: string,
    docAId = 'doc-a',
    docBId = 'doc-b'
  ): {
    alignedSections: AlignedSectionDiff[];
    hasDifferences: boolean;
    modifiedCount: number;
    addedCount: number;
    removedCount: number;
    unchangedCount: number;
  } {
    const normA = this.normalizeText(extractedTextA);
    const normB = this.normalizeText(extractedTextB);

    if (normA === normB) {
      const chunks = retrievalService.chunkDocument(normA, docAId);
      const sections = chunks.map((chunk, idx) => ({
        sectionKey: `align-${idx}`,
        headingA: chunk.sectionHeading || 'Provision',
        headingB: chunk.sectionHeading || 'Provision',
        textA: chunk.text.trim(),
        textB: chunk.text.trim(),
        pageA: chunk.pageNumber,
        pageB: chunk.pageNumber,
        status: 'unchanged' as const,
      }));

      return {
        alignedSections: sections.length > 0 ? sections : [
          {
            sectionKey: 'align-0',
            headingA: 'Full Document Content',
            headingB: 'Full Document Content',
            textA: normA,
            textB: normB,
            status: 'unchanged' as const,
          },
        ],
        hasDifferences: false,
        modifiedCount: 0,
        addedCount: 0,
        removedCount: 0,
        unchangedCount: sections.length > 0 ? sections.length : 1,
      };
    }

    const chunksA = retrievalService.chunkDocument(normA, docAId);
    const chunksB = retrievalService.chunkDocument(normB, docBId);

    const alignedSections: AlignedSectionDiff[] = [];
    const usedBIndices = new Set<number>();

    // 1. Iterate over chunks in Document A and match with Document B
    for (let i = 0; i < chunksA.length; i++) {
      const chunkA = chunksA[i];
      const normHeadA = this.normalizeHeading(chunkA.sectionHeading);

      // Find best matching candidate in B
      let bestMatchIdx = -1;
      let highestSimilarity = 0;

      for (let j = 0; j < chunksB.length; j++) {
        if (usedBIndices.has(j)) continue;
        const chunkB = chunksB[j];
        const normHeadB = this.normalizeHeading(chunkB.sectionHeading);

        // Exact normalized heading match
        if (normHeadA && normHeadB && normHeadA === normHeadB) {
          bestMatchIdx = j;
          highestSimilarity = 1.0;
          break;
        }

        // Substring / Keyword heading match
        if (normHeadA && normHeadB) {
          if (normHeadA.includes(normHeadB) || normHeadB.includes(normHeadA)) {
            bestMatchIdx = j;
            highestSimilarity = 0.8;
          }
        }
      }

      // If no heading match, only match positionally if neither has a heading
      if (bestMatchIdx === -1 && !normHeadA && chunksA.length === chunksB.length && !usedBIndices.has(i)) {
        const candidateB = chunksB[i];
        if (!this.normalizeHeading(candidateB.sectionHeading)) {
          bestMatchIdx = i;
        }
      }

      if (bestMatchIdx !== -1) {
        usedBIndices.add(bestMatchIdx);
        const matchedB = chunksB[bestMatchIdx];
        const textA = chunkA.text.trim();
        const textB = matchedB.text.trim();

        const isUnchanged = textA === textB;

        alignedSections.push({
          sectionKey: `align-${alignedSections.length}`,
          headingA: chunkA.sectionHeading || 'General Section',
          headingB: matchedB.sectionHeading || 'General Section',
          textA,
          textB,
          pageA: chunkA.pageNumber,
          pageB: matchedB.pageNumber,
          status: isUnchanged ? 'unchanged' : 'modified',
        });
      } else {
        // Section in A has no counterpart in B -> REMOVED
        alignedSections.push({
          sectionKey: `align-${alignedSections.length}`,
          headingA: chunkA.sectionHeading || 'General Section',
          textA: chunkA.text.trim(),
          pageA: chunkA.pageNumber,
          status: 'removed',
        });
      }
    }

    // 2. Remaining chunks in B that were not matched -> ADDED
    for (let j = 0; j < chunksB.length; j++) {
      if (!usedBIndices.has(j)) {
        const chunkB = chunksB[j];
        alignedSections.push({
          sectionKey: `align-${alignedSections.length}`,
          headingB: chunkB.sectionHeading || 'General Section',
          textB: chunkB.text.trim(),
          pageB: chunkB.pageNumber,
          status: 'added',
        });
      }
    }

    const modifiedCount = alignedSections.filter((s) => s.status === 'modified').length;
    const addedCount = alignedSections.filter((s) => s.status === 'added').length;
    const removedCount = alignedSections.filter((s) => s.status === 'removed').length;
    const unchangedCount = alignedSections.filter((s) => s.status === 'unchanged').length;

    const hasDifferences = modifiedCount > 0 || addedCount > 0 || removedCount > 0;

    return {
      alignedSections,
      hasDifferences,
      modifiedCount,
      addedCount,
      removedCount,
      unchangedCount,
    };
  },
};
