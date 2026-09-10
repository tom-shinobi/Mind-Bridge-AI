import React, { useMemo } from 'react';
import { marked } from 'marked';
import katex from 'katex';
import DOMPurify from 'dompurify';

interface FormattedContentProps {
  content: string;
  className?: string;
}

export const FormattedContent: React.FC<FormattedContentProps> = ({ content, className = '' }) => {
  const html = useMemo(() => {
    if (!content) return '';

    try {
      const mathTokens: { placeholder: string; html: string }[] = [];
      let tokenCounter = 0;

      // 1. Extract Display Math: $$...$$ and \[...\]
      let processed = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
        const placeholder = `KATEXDISPLAYTOKEN${tokenCounter++}END`;
        try {
          const rendered = katex.renderToString(math.trim(), {
            displayMode: true,
            throwOnError: false
          });
          mathTokens.push({ placeholder, html: rendered });
        } catch {
          mathTokens.push({ placeholder, html: `<code class="katex-err">${math}</code>` });
        }
        return placeholder;
      });

      processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
        const placeholder = `KATEXDISPLAYTOKEN${tokenCounter++}END`;
        try {
          const rendered = katex.renderToString(math.trim(), {
            displayMode: true,
            throwOnError: false
          });
          mathTokens.push({ placeholder, html: rendered });
        } catch {
          mathTokens.push({ placeholder, html: `<code class="katex-err">${math}</code>` });
        }
        return placeholder;
      });

      // 2. Extract Inline Math: $...$ and \(...\)
      // Matches $...$ without matching standalone currency like $50 or $ 100
      processed = processed.replace(/(?<!\\)\$([^\$\n]+?)\$(?!\d)/g, (_, math) => {
        const placeholder = `KATEXINLINETOKEN${tokenCounter++}END`;
        try {
          const rendered = katex.renderToString(math.trim(), {
            displayMode: false,
            throwOnError: false
          });
          mathTokens.push({ placeholder, html: rendered });
        } catch {
          mathTokens.push({ placeholder, html: `<code class="katex-err">${math}</code>` });
        }
        return placeholder;
      });

      processed = processed.replace(/\\\(([^\n]*?)\\\)/g, (_, math) => {
        const placeholder = `KATEXINLINETOKEN${tokenCounter++}END`;
        try {
          const rendered = katex.renderToString(math.trim(), {
            displayMode: false,
            throwOnError: false
          });
          mathTokens.push({ placeholder, html: rendered });
        } catch {
          mathTokens.push({ placeholder, html: `<code class="katex-err">${math}</code>` });
        }
        return placeholder;
      });

      // 3. Render Markdown with marked
      let renderedHtml = marked.parse(processed, {
        gfm: true,
        breaks: true
      }) as string;

      // 4. Restore math tokens
      for (const token of mathTokens) {
        renderedHtml = renderedHtml.split(token.placeholder).join(token.html);
      }

      // 5. Sanitize HTML with DOMPurify while preserving KaTeX MathML and SVGs
      const cleanHtml = DOMPurify.sanitize(renderedHtml, {
        ADD_TAGS: [
          'math',
          'semantics',
          'annotation',
          'annotation-xml',
          'mrow',
          'mi',
          'mo',
          'mn',
          'msup',
          'msub',
          'mfrac',
          'mover',
          'munder',
          'msubsup',
          'msqrt',
          'mroot',
          'mtable',
          'mtr',
          'mtd',
          'mspace',
          'mstyle',
          'mpadded',
          'mphantom',
          'svg',
          'path',
          'line'
        ],
        ADD_ATTR: [
          'aria-hidden',
          'encoding',
          'xmlns',
          'viewBox',
          'd',
          'style',
          'class',
          'width',
          'height',
          'preserveAspectRatio'
        ]
      });

      return cleanHtml;
    } catch (e) {
      console.warn('Formatting error:', e);
      return content;
    }
  }, [content]);

  return (
    <div
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
