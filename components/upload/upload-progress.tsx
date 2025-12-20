/**
 * Upload Progress Component
 *
 * Displays upload status, progress, and file metadata.
 * Provides visual feedback for upload and processing states.
 *
 * States:
 * - uploading: File being uploaded to Blob (0-100% progress)
 * - processing: Creating project and triggering workflow (100% progress)
 * - completed: Ready to view project (shows success message)
 * - error: Upload or processing failed (shows error message)
 *
 * File Metadata Display:
 * - File name (truncated if long)
 * - File size (formatted: MB, GB, etc.)
 * - Duration (if available, formatted: MM:SS or HH:MM:SS)
 * - Status icon (spinner, check, error)
 *
 * Design Decision: Show duration in upload screen
 * - Helps users verify correct file was selected
 * - Provides context for expected processing time
 * - Duration extraction happens before upload starts
 */
'use client';

import { CheckCircle2, Clock, FileVolume, Loader2, XCircle } from 'lucide-react';
import { formatDuration, formatFileSize } from '@/lib/format';
import type { UploadStatus } from '@/lib/types';
import { PODCAST_UPLOAD_STATUS } from '@/lib/constants';

interface UploadProgressProps {
  fileName: string; // Display name
  fileSize: number; // Bytes
  fileDuration?: number; // Seconds (optional - may not extract successfully)
  progress: number; // 0-100
  status: UploadStatus; // Current state
  error?: string; // Error message if status is "error"
}

export const UploadProgress = ({
  fileName,
  fileSize,
  fileDuration,
  progress,
  status,
  error,
}: UploadProgressProps) => {
  return (
    <div className='glass-card-strong rounded-2xl p-6 hover-lift'>
      <div className='space-y-6'>
        <div className='flex items-start gap-5'>
          <div className='rounded-2xl gradient-sunrise p-4 shadow-lg'>
            <FileVolume className='h-8 w-8 text-white' />
          </div>

          <div className='flex-1 min-w-0'>
            <p className='font-bold text-lg truncate text-gray-900 dark:text-slate-100'>
              {fileName}
            </p>

            <div className='flex items-center gap-3 text-sm text-gray-600 dark:text-slate-300 mt-2'>
              <span className='font-medium'>{formatFileSize(fileSize)}</span>
              {fileDuration && (
                <>
                  <span>•</span>
                  <div className='flex items-center gap-1.5'>
                    <Clock className='h-4 w-4' />
                    <span className='font-medium'>
                      {formatDuration(fileDuration)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Status icon */}
          <div>
            {status === PODCAST_UPLOAD_STATUS.UPLOADING && (
              <Loader2 className='h-7 w-7 animate-spin text-blue-600 dark:text-blue-300' />
            )}
            {status === PODCAST_UPLOAD_STATUS.PROCESSING && (
              <Loader2 className='h-7 w-7 animate-spin text-blue-600 dark:text-blue-300' />
            )}
            {status === PODCAST_UPLOAD_STATUS.COMPLETED && (
              <CheckCircle2 className='h-7 w-7 text-blue-600 dark:text-blue-300' />
            )}
            {status === PODCAST_UPLOAD_STATUS.ERROR && (
              <XCircle className='h-7 w-7 text-red-500 dark:text-red-300' />
            )}
          </div>
        </div>

        {/* Progress bar (only show during upload/processing) */}
        {(status === PODCAST_UPLOAD_STATUS.UPLOADING ||
          status === PODCAST_UPLOAD_STATUS.PROCESSING) && (
          <div className='space-y-3'>
            <div className='relative h-3 bg-gray-200 dark:bg-slate-700/60 rounded-full overflow-hidden'>
              <div
                className='absolute inset-y-0 left-0 progress-sunrise rounded-full transition-all duration-300 ease-out'
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className='flex justify-between text-sm font-medium'>
              <span className='text-gray-700 dark:text-slate-300'>
                {status === PODCAST_UPLOAD_STATUS.UPLOADING
                  ? 'Uploading...'
                  : 'Processing...'}
              </span>
              <span className='text-blue-600 dark:text-blue-300'>
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        )}

        {/* Status message for completed state */}
        {status === PODCAST_UPLOAD_STATUS.COMPLETED && (
          <div className='p-4 rounded-xl bg-blue-50 border-2 border-blue-200 dark:bg-blue-500/15 dark:border-blue-500/30'>
            <p className='text-sm font-semibold text-blue-700 dark:text-blue-200'>
              Upload completed! Redirecting to project dashboard...
            </p>
          </div>
        )}

        {/* Error message display */}
        {status === PODCAST_UPLOAD_STATUS.ERROR && error && (
          <div className='rounded-xl bg-red-50 border-2 border-red-200 dark:bg-red-500/15 dark:border-red-500/30 p-5'>
            <div className='flex items-start gap-4'>
              <XCircle className='h-6 w-6 text-red-600 dark:text-red-300 shrink-0 mt-0.5' />
              <div className='space-y-2 flex-1'>
                <p className='font-bold text-red-900 dark:text-red-200'>Upload Failed</p>
                <p className='text-sm text-red-700 dark:text-red-200 leading-relaxed'>
                  {error}
                </p>

                {/* Helpful hints based on error message */}
                {error.includes('plan limit') && (
                  <p className='text-xs text-gray-600 dark:text-slate-300 mt-3 pt-3 border-t border-red-200 dark:border-red-500/30'>
                    Upgrade your plan to upload larger files or more projects
                  </p>
                )}
                {error.includes('Authentication') && (
                  <p className='text-xs text-gray-600 dark:text-slate-300 mt-3 pt-3 border-t border-red-200 dark:border-red-500/30'>
                    Try refreshing the page or signing in again
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
