import React, { useState } from 'react';
import { groqService } from '../../services/groqService';
import { useStore } from '../../store/useStore';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { Send, Loader2, TerminalSquare } from 'lucide-react';

export const QueryGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const { addHistoryItem } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResult('');
    
    try {
      const response = await groqService.generateQuery(prompt);
      setResult(response);
      
      addHistoryItem({
        tool: 'query',
        prompt,
        response
      });
      
      setPrompt('');
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
          <TerminalSquare className="w-5 h-5 text-primary" />
          What data do you need?
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Describe the data you want to retrieve in plain text, and the agent will write the correct SQL query for you.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            id="prompt"
            name="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Get all users who joined last month and have more than 5 orders. पछिल्लो महिना जोडिएका र ५ भन्दा बढी अर्डर भएका सबै प्रयोगकर्ताहरू दिनुहोस्..."
            className="w-full bg-background border border-border rounded-xl p-4 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none h-24"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:bg-primary/50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? 'Generating...' : 'Generate Query'}
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
