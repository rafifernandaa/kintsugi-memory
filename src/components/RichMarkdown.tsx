import React from 'react';

interface RichMarkdownProps {
  content: string;
  className?: string;
}

/**
 * Format inline markdown: bold, italic, code, links
 */
function renderInline(text: string): React.ReactNode[] {
  // Regex to split by inline markdown tokens
  // Matches: **bold**, *italic*, `code`, [label](url)
  const tokenRegex = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold (**text** or __text__)
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      const inner = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-[#2B2827]">
          {renderInline(inner)}
        </strong>
      );
    }

    // Italic (*text* or _text_)
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      const inner = part.slice(1, -1);
      return (
        <em key={index} className="italic text-[#5A5553] font-serif">
          {renderInline(inner)}
        </em>
      );
    }

    // Inline Code (`code`)
    if (part.startsWith('`') && part.endsWith('`')) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded-md bg-[#FAF3E0] text-[#8F6A00] font-mono text-[11px] border border-[#E8D4A2] font-semibold"
        >
          {inner}
        </code>
      );
    }

    // Markdown Links [text](url)
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const labelMatch = part.match(/\[([^\]]+)\]/);
      const urlMatch = part.match(/\(([^)]+)\)/);
      if (labelMatch && urlMatch) {
        return (
          <a
            key={index}
            href={urlMatch[1]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#152659] hover:text-[#1E357A] underline font-semibold transition-colors"
          >
            {labelMatch[1]}
          </a>
        );
      }
    }

    // Plain text
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

/**
 * RichMarkdown: Elegant, lightweight markdown renderer tailored for Kintsugi Memory
 */
export const RichMarkdown: React.FC<RichMarkdownProps> = ({ content, className = '' }) => {
  if (!content || typeof content !== 'string') {
    return null;
  }

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: { indent: number; text: string }[] } | null = null;
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockLines: string[] = [];

  const flushList = (keyPrefix: string) => {
    if (!currentList) return;
    const isOrdered = currentList.type === 'ol';

    elements.push(
      <div key={`${keyPrefix}_list`} className="space-y-1.5 my-2.5">
        {currentList.items.map((item, idx) => {
          const isSubItem = item.indent > 0;
          return (
            <div
              key={idx}
              className={`flex items-start gap-2 text-xs sm:text-sm text-[#2B2827] leading-relaxed ${
                isSubItem ? 'ml-5 text-[#5A5553]' : ''
              }`}
            >
              {isOrdered ? (
                <span className="font-mono text-[11px] font-bold text-[#8F6A00] px-1.5 py-0.5 rounded bg-[#FAF3E0] shrink-0 mt-0.5">
                  {idx + 1}.
                </span>
              ) : isSubItem ? (
                <span className="w-1.5 h-1.5 rounded-full border border-[#8F6A00] mt-2 shrink-0" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-[#BF9A2A] mt-2 shrink-0" />
              )}
              <div className="flex-1">{renderInline(item.text)}</div>
            </div>
          );
        })}
      </div>
    );
    currentList = null;
  };

  lines.forEach((rawLine, lineIndex) => {
    const trimmedLine = rawLine.trim();

    // Code block toggle (```)
    if (trimmedLine.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        elements.push(
          <div key={`code_${lineIndex}`} className="my-3 rounded-2xl bg-[#2B2827] text-[#FAF8F2] p-4 font-mono text-xs overflow-x-auto shadow-md border border-[#3E3A39]">
            {codeBlockLang && (
              <div className="text-[10px] font-mono uppercase text-[#BF9A2A] pb-1 mb-2 border-b border-[#3E3A39] font-bold">
                {codeBlockLang}
              </div>
            )}
            <pre className="whitespace-pre">{codeBlockLines.join('\n')}</pre>
          </div>
        );
        inCodeBlock = false;
        codeBlockLang = '';
        codeBlockLines = [];
      } else {
        flushList(`before_code_${lineIndex}`);
        inCodeBlock = true;
        codeBlockLang = trimmedLine.replace(/^```/, '').trim();
        codeBlockLines = [];
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine);
      return;
    }

    // Blank line
    if (!trimmedLine) {
      flushList(`blank_${lineIndex}`);
      return;
    }

    // Horizontal Rule (---, ***, ___)
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmedLine)) {
      flushList(`hr_${lineIndex}`);
      elements.push(<hr key={`hr_${lineIndex}`} className="my-4 border-[#DDD7C8]" />);
      return;
    }

    // Headings
    if (trimmedLine.startsWith('# ')) {
      flushList(`h1_${lineIndex}`);
      elements.push(
        <h2 key={`h1_${lineIndex}`} className="text-xl sm:text-2xl font-serif font-bold text-[#2B2827] pb-2 border-b border-[#DDD7C8] mt-4 mb-2">
          {renderInline(trimmedLine.slice(2))}
        </h2>
      );
      return;
    }

    if (trimmedLine.startsWith('## ')) {
      flushList(`h2_${lineIndex}`);
      elements.push(
        <h3 key={`h2_${lineIndex}`} className="text-lg sm:text-xl font-serif font-bold text-[#2B2827] mt-3.5 mb-1.5 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#BF9A2A]" />
          <span>{renderInline(trimmedLine.slice(3))}</span>
        </h3>
      );
      return;
    }

    if (trimmedLine.startsWith('### ')) {
      flushList(`h3_${lineIndex}`);
      elements.push(
        <h4 key={`h3_${lineIndex}`} className="text-sm sm:text-base font-serif font-bold text-[#8F6A00] mt-3 mb-1">
          {renderInline(trimmedLine.slice(4))}
        </h4>
      );
      return;
    }

    if (trimmedLine.startsWith('#### ')) {
      flushList(`h4_${lineIndex}`);
      elements.push(
        <h5 key={`h4_${lineIndex}`} className="text-xs sm:text-sm font-serif font-bold text-[#152659] mt-2 mb-1 uppercase tracking-wide">
          {renderInline(trimmedLine.slice(5))}
        </h5>
      );
      return;
    }

    // Blockquote (> quote)
    if (trimmedLine.startsWith('> ')) {
      flushList(`quote_${lineIndex}`);
      elements.push(
        <div
          key={`quote_${lineIndex}`}
          className="border-l-3 border-[#BF9A2A] pl-3.5 py-2 my-2.5 bg-[#FAF8F2] rounded-r-xl italic font-serif text-xs sm:text-sm text-[#5A5553] shadow-xs"
        >
          {renderInline(trimmedLine.slice(2))}
        </div>
      );
      return;
    }

    // Unordered list item (- item, * item, • item)
    const ulMatch = rawLine.match(/^(\s*)([-*•])\s+(.*)$/);
    if (ulMatch) {
      const indent = ulMatch[1].length;
      const text = ulMatch[3];
      if (!currentList || currentList.type !== 'ul') {
        flushList(`change_list_${lineIndex}`);
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push({ indent, text });
      return;
    }

    // Ordered list item (1. item, 2. item)
    const olMatch = rawLine.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (olMatch) {
      const indent = olMatch[1].length;
      const text = olMatch[3];
      if (!currentList || currentList.type !== 'ol') {
        flushList(`change_list_${lineIndex}`);
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push({ indent, text });
      return;
    }

    // Standard paragraph
    flushList(`p_${lineIndex}`);
    elements.push(
      <p key={`p_${lineIndex}`} className="text-xs sm:text-sm text-[#2B2827] leading-relaxed my-1.5 font-sans">
        {renderInline(trimmedLine)}
      </p>
    );
  });

  flushList('final');

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
};
