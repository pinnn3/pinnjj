import React, { useState, useCallback, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Generator from './components/Generator';
import Setup from './components/Setup';
import { VideoIcon, SparklesIcon, SettingsIcon } from './components/icons';
import type { VideoJob } from './types';
import { v4 as uuidv4 } from 'uuid';

type Tab = 'dashboard' | 'generator' | 'setup';

const TabButton: React.FC<{
  tabName: Tab;
  icon: React.ReactNode;
  label: string;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}> = ({ tabName, icon, label, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(tabName)}
    className={`flex items-center space-x-2 px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${
      activeTab === tabName
        ? 'bg-[#4fd1c5] text-white'
        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('generator');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [veoApiKey, setVeoApiKey] = useState<string>('');
  
  const [videoJobs, setVideoJobs] = useState<VideoJob[]>([]);

  useEffect(() => {
    const storedGeminiKey = localStorage.getItem('geminiApiKey');
    const storedVeoKey = localStorage.getItem('veoApiKey');
    if (storedGeminiKey) setGeminiApiKey(storedGeminiKey);
    if (storedVeoKey) setVeoApiKey(storedVeoKey);
  }, []);


  const handleKeysSave = useCallback((newGeminiKey: string, newVeoKey: string) => {
    setGeminiApiKey(newGeminiKey);
    setVeoApiKey(newVeoKey);
    localStorage.setItem('geminiApiKey', newGeminiKey);
    localStorage.setItem('veoApiKey', newVeoKey);
  }, []);

  const updateJob = useCallback((id: string, updatedJob: Partial<VideoJob>) => {
    setVideoJobs(prevJobs =>
      prevJobs.map(job => (job.id === id ? { ...job, ...updatedJob } : job))
    );
  }, []);

  const addJob = useCallback(() => {
    if (videoJobs.length < 10) {
      setVideoJobs(prevJobs => [...prevJobs, {
        id: uuidv4(),
        prompt: '',
        status: 'idle',
        videoUrl: null,
        error: null,
      }]);
    }
  }, [videoJobs.length]);

  const removeJob = useCallback((id: string) => {
    setVideoJobs(prevJobs => prevJobs.filter(job => job.id !== id));
  }, []);

  const handlePromptsGenerated = useCallback((prompts: string[]) => {
    const newJobs: VideoJob[] = prompts.map(prompt => ({
      id: uuidv4(),
      prompt,
      status: 'idle',
      videoUrl: null,
      error: null
    }));
    setVideoJobs(newJobs);
    setActiveTab('dashboard'); // Switch to dashboard to see the new jobs
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
       <style>{`
        :root {
          --color-tosca-500: #4fd1c5;
          --color-pink-500: #f687b3;
        }
      `}</style>
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-20">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">PINN STUDIO</h1>
          </div>
          <div className="flex items-center space-x-2 bg-gray-800 p-1 rounded-lg">
            <TabButton tabName="generator" label="Generator" icon={<SparklesIcon className="w-5 h-5" />} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton tabName="dashboard" label="Dashboard" icon={<VideoIcon className="w-5 h-5" />} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton tabName="setup" label="Setup" icon={<SettingsIcon className="w-5 h-5" />} activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-6 py-8">
        <div style={{ display: activeTab === 'generator' ? 'block' : 'none' }}>
          <Generator geminiApiKey={geminiApiKey} onPromptsGenerated={handlePromptsGenerated} />
        </div>
        <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
          <Dashboard veoApiKey={veoApiKey} jobs={videoJobs} updateJob={updateJob} addJob={addJob} removeJob={removeJob} />
        </div>
        <div style={{ display: activeTab === 'setup' ? 'block' : 'none' }}>
          <Setup 
            geminiApiKey={geminiApiKey} 
            veoApiKey={veoApiKey} 
            onSave={handleKeysSave} 
          />
        </div>
      </main>
    </div>
  );
};

export default App;