import React, { useState } from 'react';
import { groqService } from '../../services/groqService';
import { useStore } from '../../store/useStore';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { ERDViewer } from '../ERDViewer';
import { Send, Loader2, Database, LayoutTemplate } from 'lucide-react';
import clsx from 'clsx';

export const SchemaDesigner = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [erdJson, setErdJson] = useState('');
  const [activeTab, setActiveTab] = useState<'explanation' | 'erd'>('explanation');
  const { addHistoryItem } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResult('');
    setErdJson('');
    
    try {
      const response = await groqService.generateSchema(prompt);
      setResult(response);
      
      // Extract JSON block for ERD
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        setErdJson(jsonMatch[1]);
      }
      
      addHistoryItem({
        tool: 'schema',
        prompt,
        response
      });
      
      setPrompt('');
    } catch (error: any) {
      setResult(`**Error:** ${error.message || 'Something went wrong. Have you set your API key?'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          Describe your application
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Describe the data model for your application in plain text (English or Nepali), and the agent will design the relational database schema.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            id="prompt"
            name="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., I need a database for a library management system with books, members, and borrowing records. एउटा लाइब्रेरी म्यानेजमेन्ट सिस्टमको डाटाबेस बनाइदिनुस्..."
            className="w-full bg-background border border-border rounded-xl p-4 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none h-32"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:bg-primary/50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? 'Designing...' : 'Generate Schema'}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="flex-1 flex flex-col min-h-0 bg-surface border border-border rounded-2xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center border-b border-border bg-background/50">
            <button
              onClick={() => setActiveTab('explanation')}
              className={clsx(
                "flex-1 py-3 px-6 text-sm font-medium transition-colors border-b-2",
                activeTab === 'explanation' 
                  ? "border-primary text-primary bg-primary/5" 
                  : "border-transparent text-gray-400 hover:bg-surface hover:text-gray-200"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <Database className="w-4 h-4" />
                Explanation & SQL
              </div>
            </button>
            <button
              onClick={() => setActiveTab('erd')}
              disabled={!erdJson}
              className={clsx(
                "flex-1 py-3 px-6 text-sm font-medium transition-colors border-b-2",
                activeTab === 'erd' 
                  ? "border-primary text-primary bg-primary/5" 
                  : !erdJson 
                    ? "border-transparent text-gray-600 cursor-not-allowed" 
                    : "border-transparent text-gray-400 hover:bg-surface hover:text-gray-200"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <LayoutTemplate className="w-4 h-4" />
                Visual ERD
              </div>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'explanation' ? (
              <MarkdownRenderer content={result} />
            ) : (
              <div className="h-full min-h-[500px]">
                <ERDViewer json={erdJson} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
