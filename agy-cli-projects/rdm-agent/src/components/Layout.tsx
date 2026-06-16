import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { SettingsModal } from './SettingsModal';
import { 
  Database, 
  TerminalSquare, 
  Bug, 
  DatabaseZap, 
  Settings,
  History,
  Trash2,
  X,
  Key
} from 'lucide-react';
import clsx from 'clsx';
import type { ToolType } from '../types';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeTool, setActiveTool, apiKey, history, clearHistory } = useStore();
  const [showSettings, setShowSettings] = useState(!apiKey);
  const [showHistory, setShowHistory] = useState(false);

  const navItems: { id: ToolType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'schema', label: 'Schema Designer', icon: Database },
    { id: 'query', label: 'Query Generator', icon: TerminalSquare },
    { id: 'debugger', label: 'SQL Debugger', icon: Bug },
    { id: 'dummy', label: 'Data Generator', icon: DatabaseZap },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 border-r border-border bg-surface flex flex-col transition-all duration-300">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-border">
          <div className="bg-primary/20 p-2 rounded-xl">
            <Database className="w-6 h-6 text-primary" />
          </div>
          <span className="ml-3 font-bold text-lg hidden lg:block bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            RDM Agent
          </span>
        </div>
        
        <nav className="flex-1 py-6 px-3 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTool === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTool(item.id)}
                className={clsx(
                  "flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-gray-400 hover:bg-surface-hover hover:text-gray-200"
                )}
                title={item.label}
              >
                <Icon className={clsx("w-6 h-6", isActive && "drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]")} />
                <span className="ml-3 font-medium hidden lg:block">{item.label}</span>
                
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>
        
        <div className="p-3 border-t border-border flex flex-col gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={clsx(
              "flex items-center px-3 py-3 rounded-xl transition-colors",
              showHistory ? "bg-surface-hover text-white" : "text-gray-400 hover:bg-surface-hover hover:text-gray-200"
            )}
            title="History"
          >
            <History className="w-6 h-6" />
            <span className="ml-3 font-medium hidden lg:block">History</span>
          </button>
          
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center px-3 py-3 rounded-xl text-gray-400 hover:bg-surface-hover hover:text-gray-200 transition-colors"
            title="Settings"
          >
            <Settings className="w-6 h-6" />
            <span className="ml-3 font-medium hidden lg:block">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border bg-surface/50 backdrop-blur flex items-center px-6 sticky top-0 z-10">
          <h1 className="text-xl font-semibold capitalize text-gray-100">
            {navItems.find(i => i.id === activeTool)?.label}
          </h1>
          
          {!apiKey && (
            <div className="ml-auto px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-sm flex items-center gap-2 cursor-pointer hover:bg-red-500/20 transition-colors" onClick={() => setShowSettings(true)}>
              <Key className="w-4 h-4" />
              API Key Required
            </div>
          )}
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          <div className="max-w-6xl mx-auto w-full h-full">
            {children}
          </div>
        </div>
      </main>

      {/* History Slide-out Panel */}
      <div 
        className={clsx(
          "w-80 border-l border-border bg-surface flex flex-col absolute right-0 top-0 bottom-0 z-20 transition-transform duration-300 shadow-2xl",
          showHistory ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <History className="w-4 h-4" />
            Activity History
          </h2>
          <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-surface-hover rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {history.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <History className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No history yet</p>
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="bg-background border border-border p-3 rounded-xl hover:border-primary/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">{item.tool}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-300 line-clamp-2">{item.prompt}</p>
              </div>
            ))
          )}
        </div>
        
        {history.length > 0 && (
          <div className="p-4 border-t border-border">
            <button 
              onClick={clearHistory}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear History
            </button>
          </div>
        )}
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
};
