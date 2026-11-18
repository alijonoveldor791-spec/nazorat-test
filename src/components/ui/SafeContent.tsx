import React, { useEffect, useMemo, useRef } from 'react';
import type { ContentFormat } from '../../types/api';
import { renderMathInElement, sanitizeRichHtml } from '../../lib/content';

interface SafeContentProps {
  value?: string | null;
  content?: string | null;
  format?: ContentFormat;
  inline?: boolean;
  className?: string;
}

export function SafeContent({
  value,
  content,
  format,
  inline = false,
  className = '',
}: SafeContentProps) {
  const text = value ?? content ?? '';
  const hostRef = useRef<HTMLDivElement>(null);
  const richHtml = useMemo(
    () => (format === 'rich-html-v1' ? sanitizeRichHtml(text, format) : null),
    [text, format]
  );

  useEffect(() => {
    if (richHtml && hostRef.current) {
      renderMathInElement(hostRef.current);
    }
  }, [richHtml]);

  if (richHtml !== null) {
    return (
      <div
        ref={hostRef}
        className={`rich-content break-words ${inline ? 'inline-block align-top' : ''} ${className}`}
        dangerouslySetInnerHTML={{ __html: richHtml }}
      />
    );
  }

  return <span className={`whitespace-pre-wrap break-words ${className}`}>{text}</span>;
}
