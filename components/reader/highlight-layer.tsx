"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { useArticleStore } from "@/stores/article-store";
import type { Highlight, HighlightColor } from "@/types";
import { AnnotationPopover } from "./annotation-popover";

interface HighlightLayerProps {
  articleId: string;
  text: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCaptureHighlight: (color: HighlightColor, note: string, range?: Range | null, textRoot?: Node | null) => Highlight | null;
  fontSize?: string;
}

export function HighlightLayer({
  articleId,
  text,
  containerRef,
  onCaptureHighlight,
  fontSize = "text-base",
}: HighlightLayerProps) {
  const highlightsRaw = useArticleStore((s) => s.highlights[articleId]);
  const highlights = useMemo(() => highlightsRaw ?? [], [highlightsRaw]);
  const updateAnnotation = useArticleStore((s) => s.updateAnnotation);
  const removeHighlight = useArticleStore((s) => s.removeHighlight);

  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 });
  const [activeAnnotation, setActiveAnnotation] = useState<Highlight | null>(null);
  const [annotationPos, setAnnotationPos] = useState({ x: 0, y: 0 });
  const savedRangeRef = useRef<Range | null>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  const sortedHighlights = [...highlights].sort(
    (a, b) => a.startOffset - b.startOffset
  );

  const segments: { text: string; hl?: Highlight }[] = [];
  let cursor = 0;
  for (const hl of sortedHighlights) {
    const start = Math.max(hl.startOffset, cursor);
    const end = Math.max(hl.endOffset, start);
    if (start > cursor) segments.push({ text: text.slice(cursor, start) });
    if (end > start) segments.push({ text: text.slice(start, end), hl });
    cursor = end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });

  const handleTextSelection = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      // Skip if clicking on an existing underlined area (annotation edit)
      const target = e.target as HTMLElement;
      if (target.closest("[data-underline]")) {
        return;
      }

      // Small delay for touch devices to finalize selection
      const doCapture = () => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.rangeCount) {
          setShowToolbar(false);
          savedRangeRef.current = null;
          return;
        }
        const range = sel.getRangeAt(0);

        const container = containerRef as React.RefObject<HTMLDivElement | null>;
        if (
          container.current &&
          (!container.current.contains(range.startContainer) ||
            !container.current.contains(range.endContainer))
        ) {
          setShowToolbar(false);
          return;
        }

        savedRangeRef.current = range.cloneRange();
        const rect = range.getBoundingClientRect();
        setToolbarPos({
          x: rect.left + rect.width / 2,
          y: rect.top - 4 + window.scrollY,
        });
        setShowToolbar(true);
      };

      if (e.type === "touchend") {
        setTimeout(doCapture, 50);
      } else {
        doCapture();
      }
    },
    []
  );

  const handleHighlightClick = useCallback(
    (hl: Highlight, e: React.MouseEvent) => {
      e.stopPropagation();
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setAnnotationPos({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 2 + window.scrollY,
      });
      setActiveAnnotation(hl);
    },
    []
  );

  return (
    <div ref={containerRef} className="relative">
      {showToolbar && (
        <div
          className="absolute z-50 flex items-center gap-1 rounded-lg shadow-xl p-2 border"
          style={{
            left: toolbarPos.x,
            top: toolbarPos.y,
            transform: "translate(-50%, -100%)",
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <button
            className="text-sm px-3 py-1.5 rounded transition-opacity hover:opacity-85 flex items-center gap-1"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "var(--color-accent-text)",
            }}
            onClick={() => {
              const hl = onCaptureHighlight(
                "underline",
                "",
                savedRangeRef.current,
                textContainerRef.current
              );
              if (hl) {
                setShowToolbar(false);
                savedRangeRef.current = null;
              }
            }}
          >
            S̳ 划线
          </button>
        </div>
      )}

      <div
        ref={textContainerRef}
        className={`whitespace-pre-wrap leading-relaxed ${fontSize}`}
        onMouseUp={handleTextSelection}
        onTouchEnd={handleTextSelection}
        style={{ color: "var(--color-text)" }}
      >
        {segments.map((seg, i) =>
          seg.hl ? (
            <span
              key={`${seg.hl.id}-${i}`}
              data-underline="true"
              className="cursor-pointer hover:opacity-70 transition-opacity"
              style={{ textDecoration: "underline wavy", textDecorationColor: "var(--color-accent)", textUnderlineOffset: "4px" }}
              onClick={(e) => handleHighlightClick(seg.hl!, e)}
              onMouseUp={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              title={seg.hl.note || "点击编辑批注"}
            >
              {seg.text}
            </span>
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
      </div>

      {activeAnnotation && (
        <AnnotationPopover
          highlight={activeAnnotation}
          position={annotationPos}
          onSave={(note) => {
            updateAnnotation(articleId, activeAnnotation.id, note);
            setActiveAnnotation(null);
          }}
          onDelete={() => {
            removeHighlight(articleId, activeAnnotation.id);
            setActiveAnnotation(null);
          }}
          onClose={() => setActiveAnnotation(null)}
        />
      )}
    </div>
  );
}
