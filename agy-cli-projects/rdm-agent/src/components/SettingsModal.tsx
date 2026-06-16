import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Key, Save, X } from 'lucide-react';

export const SettingsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { apiKey, setApiKey } = useStore();
  const [inputKey, setInputKey] = useState(apiKey);

  const handleSave = () => {
    setApiKey(inputKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-surface-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="p-6">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
            Groq API Key
          </label>
          <input
            id="apiKey"
            name="apiKey"
            type="password"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="gsk_..."
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          <p className="text-xs text-gray-400 mt-2">
            Your API key is stored locally in your browser and never sent to our servers.
          </p>
        </div>
        
        <div className="p-4 border-t border-border bg-black/20 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
