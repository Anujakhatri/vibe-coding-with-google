import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Check, Copy } from 'lucide-react';

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="prose prose-invert prose-blue max-w-none">
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const isJson = language === 'json';
            
            // For inline code
            if (inline) {
              return (
                <code className="bg-surface-hover px-1.5 py-0.5 rounded text-sm font-mono text-primary" {...props}>
                  {children}
                </code>
              );
            }

            // Hide json blocks if they contain the ERD data
            if (isJson && String(children).includes('"tables":')) {
              return null; // hide ERD json block from visual output
            }

            return (
              <CodeBlock value={String(children).replace(/\n$/, '')} />
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const CodeBlock: React.FC<{ value: string }> = ({ value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4">
      <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={handleCopy}
          className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-gray-300 transition-colors"
          title="Copy code"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-gray-800">
        <code>{value}</code>
      </pre>
    </div>
  );
};
