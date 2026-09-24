'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Lightbulb } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null;

  // Split by line blocks
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' = 'ul';
  let inTable = false;
  let tableRows: string[][] = [];

  const flushList = (key: number) => {
    if (listItems.length > 0) {
      elements.push(
        <Box
          component={listType === 'ul' ? 'ul' : 'ol'}
          key={`list-${key}`}
          sx={{
            pl: 3,
            my: 1.5,
            color: '#334155',
            fontSize: '0.95rem',
            lineHeight: 1.7,
            '& li': { mb: 0.5 },
          }}
        >
          {listItems.map((item, idx) => (
            <li key={idx}>
              <Typography variant='body2' component='span' sx={{ color: '#334155', fontSize: '0.95rem' }}>
                {renderInlineMarkdown(item)}
              </Typography>
            </li>
          ))}
        </Box>,
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = (key: number) => {
    if (tableRows.length > 0) {
      const [headerRow, ...bodyRows] = tableRows;
      elements.push(
        <Box
          key={`table-${key}`}
          sx={{
            overflowX: 'auto',
            my: 2.5,
            borderRadius: '12px',
            border: '1px solid #fecdd3',
            boxShadow: '0 2px 6px rgba(225, 29, 72, 0.04)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            {headerRow && (
              <thead>
                <tr style={{ backgroundColor: '#fff1f2', borderBottom: '2px solid #fecdd3' }}>
                  {headerRow.map((h, i) => (
                    <th
                      key={i}
                      style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        fontWeight: 700,
                        color: '#9f1239',
                      }}
                    >
                      {renderInlineMarkdown(h.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {bodyRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: rIdx % 2 === 1 ? '#fffafb' : '#ffffff',
                  }}
                >
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} style={{ padding: '8px 14px', color: '#334155' }}>
                      {renderInlineMarkdown(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>,
      );
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Table rows
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (trimmed.includes('---')) return; // delimiter line
      flushList(idx);
      inTable = true;
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map(c => c.trim());
      tableRows.push(cells);
      return;
    } else if (inTable) {
      flushTable(idx);
    }

    // List items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList || listType !== 'ul') {
        flushList(idx);
        inList = true;
        listType = 'ul';
      }
      listItems.push(trimmed.slice(2));
      return;
    } else if (/^\d+\.\s/.test(trimmed)) {
      if (!inList || listType !== 'ol') {
        flushList(idx);
        inList = true;
        listType = 'ol';
      }
      listItems.push(trimmed.replace(/^\d+\.\s/, ''));
      return;
    } else if (inList) {
      flushList(idx);
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(
        <Typography
          key={idx}
          variant='h6'
          sx={{ fontWeight: 700, color: '#1e293b', mt: 2.5, mb: 1, fontSize: '1.05rem' }}
        >
          {renderInlineMarkdown(trimmed.slice(4))}
        </Typography>,
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <Typography
          key={idx}
          variant='h5'
          sx={{
            fontWeight: 800,
            color: '#0f172a',
            mt: 3,
            mb: 1.5,
            fontSize: '1.25rem',
            borderBottom: '2px solid #ffe4e6',
            pb: 0.5,
          }}
        >
          {renderInlineMarkdown(trimmed.slice(3))}
        </Typography>,
      );
      return;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(
        <Typography
          key={idx}
          variant='h4'
          sx={{ fontWeight: 900, color: '#e11d48', mt: 3, mb: 2, fontSize: '1.5rem' }}
        >
          {renderInlineMarkdown(trimmed.slice(2))}
        </Typography>,
      );
      return;
    }

    // Blockquote / Tip Callout Box
    if (trimmed.startsWith('> ')) {
      elements.push(
        <Paper
          key={idx}
          elevation={0}
          sx={{
            p: 2,
            my: 2,
            bgcolor: '#fff1f2',
            borderLeft: '4px solid #e11d48',
            borderRadius: '0 12px 12px 0',
            display: 'flex',
            gap: 1.5,
            alignItems: 'flex-start',
          }}
        >
          <Lightbulb size={20} color='#e11d48' style={{ flexShrink: 0, marginTop: 2 }} />
          <Typography variant='body2' sx={{ color: '#881337', fontWeight: 500, lineHeight: 1.6 }}>
            {renderInlineMarkdown(trimmed.slice(2))}
          </Typography>
        </Paper>,
      );
      return;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***') {
      elements.push(
        <Box key={idx} sx={{ my: 2.5, borderBottom: '1px dashed #e2e8f0' }} />,
      );
      return;
    }

    // Empty line / paragraph break
    if (trimmed.length === 0) {
      return;
    }

    // Regular Paragraph
    elements.push(
      <Typography
        key={idx}
        variant='body1'
        sx={{ color: '#334155', my: 1, fontSize: '0.96rem', lineHeight: 1.75 }}
      >
        {renderInlineMarkdown(trimmed)}
      </Typography>,
    );
  });

  flushList(lines.length);
  flushTable(lines.length);

  return <Box className={`markdown-content ${className}`}>{elements}</Box>;
}

// Inline renderer: Bold (**text**), Italic (*text*), Code (`code`), Link ([text](url))
function renderInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} style={{ fontWeight: 700, color: '#0f172a' }}>
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(<em key={match.index}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          style={{
            backgroundColor: '#f1f5f9',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.85em',
            color: '#e11d48',
          }}
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith('[') && token.includes('](')) {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={match.index}
            href={linkMatch[2]}
            target='_blank'
            rel='noopener noreferrer'
            style={{ color: '#e11d48', textDecoration: 'underline', fontWeight: 600 }}
          >
            {linkMatch[1]}
          </a>,
        );
      }
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
