import React, { useState } from 'react';
import { groqService } from '../../services/groqService';
import { useStore } from '../../store/useStore';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { Send, Loader2, DatabaseZap } from 'lucide-react';

export const DummyDataGenerator = () => {
  const [schema, setSchema] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const { addHistoryItem } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schema.trim()) return;

    setLoading(true);
    setResult('');
    
    try {
      const response = await groqService.generateDummyData(schema);
      setResult(response);
      
      addHistoryItem({
        tool: 'dummy',
        prompt: `Generate data for: ${schema.substring(0, 50)}...`,
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
          <DatabaseZap className="w-5 h-5 text-primary" />
          Generate Dummy Data
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Paste your table schema, and the agent will generate realistic seed data using SQL INSERT statements.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            id="schema"
            name="schema"
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
            placeholder="CREATE TABLE employees (\n  id SERIAL PRIMARY KEY,\n  first_name VARCHAR(50),\n  last_name VARCHAR(50),\n  email VARCHAR(100),\n  hire_date DATE\n);"
            className="w-full bg-background border border-border rounded-xl p-4 text-gray-200 placeholder-gray-600 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none h-32"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !schema.trim()}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:bg-primary/50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? 'Generating...' : 'Generate Data'}
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
