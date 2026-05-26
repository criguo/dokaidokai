"use client";

import { useState, useEffect, useRef } from "react";
import type { Highlight } from "@/types";

interface AnnotationPopoverProps {
  highlight: Highlight;
  position: { x: number; y: number };
  onSave: (note: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function AnnotationPopover({
  highlight,
  position,
  onSave,
  onDelete,
  onClose,
}: AnnotationPopoverProps) {
  const [note, setNote] = useState(highlight.note);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const borderColor = "var(--color-border)";

  return (
    <div
      ref={popoverRef}
      className="absolute z-50 rounded-xl border shadow-xl p-4 w-72"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, 0)",
        backgroundColor: "var(--color-surface)",
        borderColor,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
          批注
        </span>
        <button
          className="text-lg leading-none hover:opacity-70"
          style={{ color: "var(--color-text-muted)" }}
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <textarea
        ref={inputRef}
        className="w-full rounded-md p-2 text-sm resize-none focus:outline-none mb-3"
        style={{
          backgroundColor: "var(--color-bg)",
          border: `1px solid ${borderColor}`,
          color: "var(--color-text)",
        }}
        rows={3}
        placeholder="添加你的批注..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <div className="flex justify-between">
        <button
          className="text-xs px-2 py-1 rounded hover:opacity-80"
          style={{ color: "var(--color-error)" }}
          onClick={onDelete}
        >
          删除
        </button>
        <button
          className="text-xs px-3 py-1 rounded font-medium transition-opacity hover:opacity-85"
          style={{
            backgroundColor: "var(--color-accent)",
            color: "var(--color-accent-text)",
          }}
          onClick={() => onSave(note)}
        >
          保存
        </button>
      </div>
    </div>
  );
}
