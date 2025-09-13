import React, { useState, useEffect } from 'react';
import type { VideoJob } from '../types';
import Modal from './Modal';
import VideoPlayer from './VideoPlayer';
import { ViewIcon, TrashIcon, AlertIcon, RefreshIcon, DownloadIcon } from './icons';

interface PromptInputProps {
  job: VideoJob;
  sceneNumber: number;
  updateJob: (id: string, updatedJob: Partial<VideoJob>) => void;
  removeJob: (id: string) => void;
  regenerateJob: (id: string) => void;
  isGenerating: boolean;
}

const loadingMessages = [
  "Warming up the digital director...",
  "Assembling pixels into a masterpiece...",
  "Choreographing virtual actors...",
  "Rendering cinematic magic...",
  "Finalizing the special effects...",
  "This can take a few minutes, please wait...",
];

const PromptInput: React.FC<PromptInputProps> = ({ job, sceneNumber, updateJob, removeJob, regenerateJob, isGenerating }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(loadingMessages[0]);
  
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (job.status === 'generating') {
      setCurrentLoadingMessage(loadingMessages[0]); // Reset message on new generation
      interval = setInterval(() => {
        setCurrentLoadingMessage(prev => {
          const currentIndex = loadingMessages.indexOf(prev);
          return loadingMessages[(currentIndex + 1) % loadingMessages.length];
        });
      }, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [job.status]);
  
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateJob(job.id, { prompt: e.target.value });
  };

  const handleDownload = () => {
    if (!job.videoUrl) return;
    const link = document.createElement('a');
    link.href = job.videoUrl;
    link.setAttribute('download', `scene_${sceneNumber}.mp4`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formattedPrompt = () => {
    try {
      const parsed = JSON.parse(job.prompt);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return job.prompt;
    }
  };

  const renderContent = () => {
    switch (job.status) {
      case 'generating':
        return (
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-xl p-8 text-center">
            <div className="w-16 h-16 border-4 border-t-transparent border-[#4fd1c5] rounded-full animate-spin mb-6"></div>
            <div className="w-full max-w-xs">
                <p className="text-lg font-semibold text-white mb-4">{currentLoadingMessage}</p>
                <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-transparent via-[#4fd1c5] to-transparent"
                        style={{
                            backgroundSize: '200% 100%',
                            animation: 'slide-progress 2s linear infinite',
                        }}
                    ></div>
                </div>
            </div>
          </div>
        );
      case 'success':
        return job.videoUrl ? <VideoPlayer src={job.videoUrl} /> : null;
      case 'error':
        return (
          <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-center space-x-3 h-full">
            <AlertIcon className="w-8 h-8 text-red-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-red-400">Generation Failed</p>
              <p className="text-sm text-red-300">{job.error}</p>
            </div>
          </div>
        );
      case 'idle':
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-lg relative h-full flex flex-col border border-gray-700">
      {renderContent()}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-bold text-white">Scene {sceneNumber}</h3>
        <div className="flex items-center space-x-2">
          {job.status === 'success' && job.videoUrl && (
              <button
                onClick={handleDownload}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
                title="Download Video"
              >
                <DownloadIcon className="w-5 h-5" />
              </button>
          )}
          {(job.status === 'success' || job.status === 'error') && (
            <button
              onClick={() => regenerateJob(job.id)}
              disabled={isGenerating}
              className="text-gray-400 hover:text-[#4fd1c5] transition-colors p-1 rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Recreate Video"
            >
              <RefreshIcon className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => setIsModalOpen(true)} className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700">
            <ViewIcon className="w-5 h-5" />
          </button>
          <button onClick={() => removeJob(job.id)} disabled={isGenerating} className="text-gray-400 hover:text-[#f687b3] transition-colors p-1 rounded-full hover:bg-gray-700 disabled:opacity-50">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="flex-grow flex flex-col">
        <label htmlFor={`prompt-${job.id}`} className="text-sm font-medium text-gray-400 mb-1">
          JSON Prompt
        </label>
        <textarea
          id={`prompt-${job.id}`}
          value={job.prompt}
          onChange={handlePromptChange}
          placeholder="Paste your scene's JSON prompt here..."
          className="w-full h-full flex-grow bg-gray-900 text-gray-300 p-3 rounded-lg border-2 border-gray-700 focus:border-[#4fd1c5] focus:ring-[#4fd1c5] transition-colors resize-none font-mono text-xs"
          rows={10}
        />
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-2xl font-bold mb-4 text-white">Full Prompt for Scene {sceneNumber}</h2>
        <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-200 max-h-[60vh] overflow-auto">
          <code>{formattedPrompt()}</code>
        </pre>
      </Modal>
    </div>
  );
};

export default PromptInput;