// Client-side blob upload helper used by the upload UI.
// In normal mode it streams files to Vercel Blob and reports progress.
// In mock pipeline mode it simulates a short upload and returns a deterministic URL
// so E2E and local dev can run without external services.
'use client';

import { upload } from '@vercel/blob/client';
import { isMockPipelineClient } from '@/lib/_tests_/mock-flags-client';

// Small delay helper for mock progress steps.
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const uploadPodcastBlob = async (
  file: File,
  onProgress: (percentage: number) => void
): Promise<{ url: string }> => {
  // Mock upload path for deterministic tests.
  if (isMockPipelineClient()) {
    onProgress(15);
    await pause(60);
    onProgress(55);
    await pause(60);
    onProgress(100);
    return {
      url: `https://mock.blob.local/${encodeURIComponent(file.name)}`
    };
  }

  return upload(file.name, file, {
    access: 'public',
    handleUploadUrl: '/api/upload',
    onUploadProgress: ({ percentage }) => {
      onProgress(percentage);
    }
  });
};
