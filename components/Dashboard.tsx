import React, { useState, useCallback } from 'react';
import type { VideoJob } from '../types';
import PromptInput from './PromptInput';
import { generateVideo } from '../services/geminiService';
import { PlusIcon, VideoIcon } from './icons';

interface DashboardProps {
  veoApiKey: string;
  jobs: VideoJob[];
  updateJob: (id: string, updatedJob: Partial<VideoJob>) => void;
  addJob: () => void;
  removeJob: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ veoApiKey, jobs, updateJob, addJob, removeJob }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const processJob = useCallback(async (job: VideoJob) => {
    if (!veoApiKey) {
        updateJob(job.id, { status: 'error', error: 'VEO API Key is not configured in the Setup tab.' });
        return;
    }
    if (!job.prompt.trim()) {
        return;
    }
    
    try {
      JSON.parse(job.prompt);
    } catch (e) {
      updateJob(job.id, { status: 'error', error: 'Invalid JSON format.' });
      return;
    }
    
    updateJob(job.id, { status: 'generating', error: null, videoUrl: null });
    try {
      const videoUrl = await generateVideo(job.prompt, veoApiKey);
      updateJob(job.id, { status: 'success', videoUrl });
    } catch (error) {
      console.error('Generation failed for job:', job.id, error);
      updateJob(job.id, { status: 'error', error: error instanceof Error ? error.message : 'An unknown error occurred.' });
    }
  }, [updateJob, veoApiKey]);

  const handleGenerateAll = useCallback(async () => {
    setIsGenerating(true);
    for (const job of jobs) {
      // Only process jobs that haven't been successful yet
      if (job.status !== 'success') {
        await processJob(job);
      }
    }
    setIsGenerating(false);
  }, [jobs, processJob]);

  const handleRegenerate = useCallback(async (jobId: string) => {
    const jobToRegenerate = jobs.find(j => j.id === jobId);
    if (!jobToRegenerate) return;

    setIsGenerating(true);
    await processJob(jobToRegenerate);
    setIsGenerating(false);
  }, [jobs, processJob]);


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Video Generation Dashboard</h2>
        <button
          onClick={handleGenerateAll}
          disabled={isGenerating || jobs.length === 0}
          className="bg-[#4fd1c5] text-gray-900 font-bold py-2 px-6 rounded-lg hover:bg-[#38b2ac] disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-[#4fd1c5]/20"
        >
          {isGenerating ? 'Generating...' : 'Generate All Videos'}
        </button>
      </div>
      
      {jobs.length === 0 && (
          <div className="text-center py-16 px-6 border-2 border-dashed border-gray-700 rounded-xl">
              <VideoIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-300">Your video scenes will appear here.</h3>
              <p className="text-gray-500 mt-2">
                  Go to the "Generator" tab to create new JSON prompts, or click "Add New Scene" to start manually.
              </p>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.map((job, index) => (
          <PromptInput
            key={job.id}
            job={job}
            sceneNumber={index + 1}
            updateJob={updateJob}
            removeJob={removeJob}
            regenerateJob={handleRegenerate}
            isGenerating={isGenerating}
          />
        ))}
        {jobs.length < 10 && (
          <button
            onClick={addJob}
            disabled={isGenerating}
            className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-gray-700 rounded-xl text-gray-500 hover:bg-gray-800 hover:border-[#4fd1c5] hover:text-[#4fd1c5] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="w-12 h-12 mb-4" />
            <span className="text-lg font-semibold">Add New Scene</span>
            <span className="text-sm">({10 - jobs.length} remaining)</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;