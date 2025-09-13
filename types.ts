
export interface VideoJob {
  id: string;
  prompt: string;
  status: 'idle' | 'generating' | 'success' | 'error';
  videoUrl: string | null;
  error: string | null;
}
