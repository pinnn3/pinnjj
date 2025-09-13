import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, SettingsIcon, AlertIcon } from './icons';

interface SetupProps {
  geminiApiKey: string;
  veoApiKey: string;
  onSave: (geminiKey: string, veoKey: string) => void;
}

const ApiKeyInputSection: React.FC<{
    title: string;
    description: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isConfigured: boolean;
}> = ({ title, description, value, onChange, isConfigured }) => (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-400 mt-2 mb-4">{description}</p>
        <input
            type="password"
            value={value}
            onChange={onChange}
            placeholder="Enter your API Key..."
            className="w-full bg-gray-900 text-gray-200 p-3 rounded-lg border-2 border-gray-700 focus:border-[#4fd1c5] focus:ring-[#4fd1c5] transition-colors"
        />
        <div className={`mt-4 p-3 rounded-lg text-sm flex items-center ${isConfigured ? 'bg-cyan-900/30 text-cyan-300' : 'bg-yellow-900/30 text-yellow-300'}`}>
            {isConfigured ? <CheckCircleIcon className="w-5 h-5 mr-2" /> : <AlertIcon className="w-5 h-5 mr-2" />}
            <span>{isConfigured ? 'API Key is configured.' : 'API Key is not configured.'}</span>
        </div>
    </div>
);

const Setup: React.FC<SetupProps> = ({ geminiApiKey, veoApiKey, onSave }) => {
  const [localGeminiKey, setLocalGeminiKey] = useState('');
  const [localVeoKey, setLocalVeoKey] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setLocalGeminiKey(geminiApiKey);
    setLocalVeoKey(veoApiKey);
  }, [geminiApiKey, veoApiKey]);

  const handleSave = () => {
    onSave(localGeminiKey, localVeoKey);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center">
        <SettingsIcon className="w-8 h-8 mr-4 text-[#4fd1c5]" />
        <h2 className="text-3xl font-bold text-white">API Key Setup</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ApiKeyInputSection
          title="Gemini API Key"
          description="Used for generating JSON prompts in the 'Generator' tab."
          value={localGeminiKey}
          onChange={(e) => setLocalGeminiKey(e.target.value)}
          isConfigured={!!geminiApiKey}
        />
        <ApiKeyInputSection
          title="VEO API Key"
          description="Used for creating videos from prompts in the 'Dashboard' tab."
          value={localVeoKey}
          onChange={(e) => setLocalVeoKey(e.target.value)}
          isConfigured={!!veoApiKey}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-[#4fd1c5] text-gray-900 font-bold py-2 px-6 rounded-lg hover:bg-[#38b2ac] transition-colors duration-300 shadow-lg shadow-[#4fd1c5]/20"
        >
          {showSuccess ? 'Saved Successfully!' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
};

export default Setup;