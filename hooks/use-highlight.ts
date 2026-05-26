"use client";

import { useCallback, useRef } from "react";
import { v4 as uuid } from "uuid";
import { useArticleStore } from "@/stores/article-store";
import type { Highlight, HighlightColor } from "@/types";

/**
 * Computes character offset of a DOM node within a container's textContent.
 */
function getTextOffset(root: Node, target: Node, nodeOffset: number): number {
  let offset = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (node === target) {
      return offset + nodeOffset;
    }
    offset += node.textContent?.length ?? 0;
    node = walker.nextNode();
  }
  return offset;
}

export function useHighlight(articleId: string) {
  const addHighlight = useArticleStore((s) => s.addHighlight);
  const removeHighlight = useArticleStore((s) => s.removeHighlight);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Capture text selection as a Highlight.
   * Accepts an optional pre-saved Range (to survive browser deselection on toolbar click).
   * textRoot: the pure text container node for offset calculation (avoids toolbar text pollution).
   */
  const captureSelection = useCallback(
    (color: HighlightColor, note: string = "", savedRange?: Range | null, textRoot?: Node | null): Highlight | null => {
      let range: Range | null = null;

      // Use saved range if provided, otherwise try live selection
      if (savedRange) {
        range = savedRange;
      } else {
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
          range = sel.getRangeAt(0);
        }
      }

      if (!range || range.collapsed) return null;

      const container = containerRef.current;
      if (!container) return null;

      if (
        !container.contains(range.startContainer) ||
        !container.contains(range.endContainer)
      ) {
        return null;
      }

      // Use textRoot for accurate offset (avoids toolbar/annotation text nodes)
      const root = textRoot && container.contains(textRoot) ? textRoot : container;

      const startOffset = getTextOffset(
        root,
        range.startContainer,
        range.startOffset
      );
      const endOffset = getTextOffset(
        root,
        range.endContainer,
        range.endOffset
      );

      if (startOffset === endOffset) return null;

      const hl: Highlight = {
        id: uuid(),
        articleId,
        startOffset,
        endOffset,
        color,
        note,
        createdAt: new Date().toISOString(),
      };

      addHighlight(articleId, hl);
      window.getSelection()?.removeAllRanges();
      return hl;
    },
    [articleId, addHighlight]
  );

  const deleteHighlight = useCallback(
    (highlightId: string) => {
      removeHighlight(articleId, highlightId);
    },
    [articleId, removeHighlight]
  );

  return { containerRef, captureSelection, deleteHighlight };
}
