import React, { useState } from 'react';
import { groqService } from '../../services/groqService';
import { useStore } from '../../store/useStore';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { Send, Loader2, Bug, Code2 } from 'lucide-react';

export const SQLDebugger = () => {
  const [brokenQuery, setBrokenQuery] = useState('');
  const [schemaContext, setSchemaContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const { addHistoryItem } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brokenQuery.trim()) return;

    setLoading(true);
    setResult('');
    
    try {
      const response = await groqService.debugQuery(brokenQuery, schemaContext);
      setResult(response);
      
      addHistoryItem({
        tool: 'debugger',
        prompt: `Debug: ${brokenQuery.substring(0, 50)}...`,
        response
      });
      
    } catch (error: any) {
      setResult(`**Error:** ${error.message || 'Something went wrong.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Bug className="w-5 h-5 text-primary" />
          Fix broken SQL
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Paste your broken SQL query below. Optionally, provide the schema context to help the agent find the bug faster.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="brokenQuery" className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                Broken SQL Query <span className="text-red-400">*</span>
              </label>
              <textarea
                id="brokenQuery"
                name="brokenQuery"
                value={brokenQuery}
                onChange={(e) => setBrokenQuery(e.target.value)}
                placeholder="SELECT * FROM users JOIN orders ON users.id = orders.user_id GROUP BY users.id"
                className="w-full bg-background border border-border rounded-xl p-4 text-gray-200 placeholder-gray-600 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none h-40"
                required
              />
            </div>
            <div>
              <label htmlFor="schemaContext" className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Schema Context (Optional)
              </label>
              <textarea
                id="schemaContext"
                name="schemaContext"
                value={schemaContext}
                onChange={(e) => setSchemaContext(e.target.value)}
                placeholder="CREATE TABLE users (id INT, name VARCHAR);\nCREATE TABLE orders (id INT, user_id INT, total DECIMAL);"
                className="w-full bg-background border border-border rounded-xl p-4 text-gray-200 placeholder-gray-600 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none h-40"
              />
            </div>
          </div>
          
          <div className="flex justify-end border-t border-border pt-4">
            <button
              type="submit"
              disabled={loading || !brokenQuery.trim()}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:bg-primary/50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? 'Debugging...' : 'Debug Query'}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="flex-1 bg-surface border border-border p-6 rounded-2xl shadow-sm overflow-y-auto animate-in slide-in-from-bottom-4 duration-500">
          <MarkdownRenderer content={result} />
        </div>
      )}
    </div>
  );
};

// Re-import missing Database icon above
import { Database } from 'lucide-react';
