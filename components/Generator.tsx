import React, { useState } from 'react';
import { generateJsonPrompts } from '../services/geminiService';
import { SparklesIcon, CopyIcon, CheckCircleIcon, AlertIcon, RefreshIcon } from './icons';

interface GeneratorProps {
  geminiApiKey: string;
  onPromptsGenerated: (prompts: string[]) => void;
}

const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
    {children}
  </div>
);

const Generator: React.FC<GeneratorProps> = ({ geminiApiKey, onPromptsGenerated }) => {
  const [mainIdea, setMainIdea] = useState('A brave cloud bear goes on an adventure to find a fallen star.');
  const [numScenes, setNumScenes] = useState(3);
  const [includeDialog, setIncludeDialog] = useState(true);
  const [visualStyle, setVisualStyle] = useState('3D Cartoon');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
  const [copiedStates, setCopiedStates] = useState<Record<number, boolean>>({});
  
  const isReadyToGenerate = mainIdea.trim() !== '' && !!geminiApiKey;

  const handleGenerate = async () => {
    if (!geminiApiKey) {
        setError("Gemini API Key is not configured in the Setup tab.");
        return;
    }
    if (!mainIdea.trim()) {
      setError("Main Idea cannot be empty.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedPrompts([]);
    try {
      const prompts = await generateJsonPrompts(mainIdea, numScenes, includeDialog, visualStyle, geminiApiKey);
      setGeneratedPrompts(prompts);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setMainIdea('');
    setGeneratedPrompts([]);
    setError(null);
    setNumScenes(3);
    setIncludeDialog(true);
    setVisualStyle('3D Cartoon');
  };

  const handleCopyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [index]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [index]: false }));
    }, 2000);
  };

  const commonInputClass = "w-full bg-gray-900 text-gray-200 p-3 rounded-lg border-2 border-gray-700 focus:border-[#4fd1c5] focus:ring-[#4fd1c5] transition-colors";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* LEFT COLUMN: FORM */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white flex items-center">
                <SparklesIcon className="w-6 h-6 mr-3 text-[#4fd1c5]" />Prompt Generator
            </h2>
            <button 
                onClick={handleReset}
                className="flex items-center text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white px-3 py-2 rounded-lg transition-colors"
                title="Reset Form and Output"
            >
                <RefreshIcon className="w-4 h-4 mr-2" />
                Reset
            </button>
        </div>
        
        <FormField label="Main Idea">
          <textarea
            value={mainIdea}
            onChange={(e) => setMainIdea(e.target.value)}
            placeholder="e.g., A lonely robot discovers a magical garden in a post-apocalyptic city."
            className={`${commonInputClass} min-h-[120px] resize-y`}
            rows={5}
            required
          />
        </FormField>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Number of Scenes">
            <input
              type="number"
              value={numScenes}
              onChange={(e) => setNumScenes(Math.max(1, Math.min(10, parseInt(e.target.value, 10) || 1)))}
              min="1" max="10"
              className={commonInputClass}
            />
          </FormField>
          <FormField label="Visual Style">
            <select value={visualStyle} onChange={e => setVisualStyle(e.target.value)} className={commonInputClass}>
              <option>Cinematic Realistic</option>
              <option>Anime</option>
              <option>3D Cartoon</option>
              <option>Watercolor Painting</option>
              <option>Pixel Art</option>
              <option>Cyberpunk Neon</option>
            </select>
          </FormField>
        </div>

        <FormField label="Dialog (Bahasa Indonesia)">
           <select value={String(includeDialog)} onChange={e => setIncludeDialog(e.target.value === 'true')} className={commonInputClass}>
              <option value="true">Ya, sertakan dialog</option>
              <option value="false">Tidak ada dialog (bisu)</option>
            </select>
        </FormField>
        
        <button
          onClick={handleGenerate}
          disabled={isLoading || !isReadyToGenerate}
          className="w-full bg-[#4fd1c5] text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-[#38b2ac] disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-[#4fd1c5]/20 flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-t-transparent border-gray-900 rounded-full animate-spin mr-3"></div>
              Generating...
            </>
          ) : (
            'Generate Prompts'
          )}
        </button>
      </div>

      {/* RIGHT COLUMN: OUTPUT */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-[75vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Generated Scenes</h2>
             {generatedPrompts.length > 0 && (
                <button 
                  onClick={() => onPromptsGenerated(generatedPrompts)}
                  className="bg-[#f687b3] text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-[#f687b3]/80 transition-colors"
                >
                  Add JSON Prompts to Video Creation
                </button>
            )}
          </div>
          <div className="flex-grow overflow-y-auto pr-2 space-y-4">
            {isLoading && (
               <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <div className="w-16 h-16 border-4 border-t-transparent border-[#4fd1c5] rounded-full animate-spin mb-4"></div>
                  <p className="text-lg font-semibold">AI is crafting your story...</p>
               </div>
            )}
            {error && (
                <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-center space-x-3">
                    <AlertIcon className="w-8 h-8 text-red-400 flex-shrink-0" />
                    <div>
                        <p className="font-bold text-red-400">An Error Occurred</p>
                        <p className="text-sm text-red-300">{error}</p>
                    </div>
                </div>
            )}
            {!isLoading && !error && generatedPrompts.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
                    <SparklesIcon className="w-16 h-16 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400">Your generated prompts will appear here.</h3>
                    <p className="mt-1">Fill out the form and click "Generate Prompts" to begin.</p>
                </div>
            )}
            {generatedPrompts.map((prompt, index) => (
                <div key={index} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-lg text-white">Scene {index + 1}</h3>
                        <button 
                          onClick={() => handleCopyToClipboard(prompt, index)} 
                          className="flex items-center text-sm font-medium bg-gray-700 text-gray-300 hover:bg-[#f687b3] hover:text-gray-900 px-3 py-1 rounded-md transition-colors"
                        >
                          {copiedStates[index] ? <CheckCircleIcon className="w-4 h-4 mr-2" /> : <CopyIcon className="w-4 h-4 mr-2" />}
                          {copiedStates[index] ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <pre className="text-xs text-gray-300 bg-black p-3 rounded-md overflow-x-auto">
                      <code>{JSON.stringify(JSON.parse(prompt), null, 2)}</code>
                    </pre>
                </div>
            ))}
          </div>
      </div>
    </div>
  );
};

export default Generator;