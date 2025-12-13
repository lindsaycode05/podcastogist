/**
 * Upload Dropzone Component
 *
 * Drag-and-drop file selector with validation and visual feedback.
 * Built on react-dropzone for cross-browser compatibility.
 *
 * Features:
 * - Drag and drop support
 * - Click to browse files
 * - File type validation (audio formats only)
 * - File size validation
 * - Visual feedback (drag state, errors)
 * - Accessible file input
 *
 * Supported Audio Formats:
 * - MP3, M4A, WAV, AAC, FLAC, OGG, Opus, WebM
 * - 3GP, 3G2 (mobile formats)
 * - Multiple MIME type variants for cross-browser support
 *
 * Design Decision: Why so many MIME types?
 * - Browsers report different MIME types for same format
 * - x-m4a vs. mp4 vs. m4a inconsistencies
 * - Ensures consistent behavior across Chrome, Firefox, Safari
 */
'use client';

import { AudioLines, Upload } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { ErrorCode, useDropzone } from 'react-dropzone';
import { ALLOWED_AUDIO_TYPES_EXTENSION_MAP } from '@/lib/constants';
import { cn } from '@/lib/utils/utils';
import { useAuth } from '@clerk/nextjs';
import { PLAN_LIMITS, PODCASTOGIST_USER_PLANS } from '@/lib/tier-config';

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void; // Callback when valid file is selected
  disabled?: boolean; // Disable during upload
}

export const UploadDropzone = ({
  onFileSelect,
  disabled = false,
}: UploadDropzoneProps) => {
  const { has } = useAuth();

  // Determine user's plan using Clerk's has() method
  const userPlan = useMemo(() => {
    if (has?.({ plan: PODCASTOGIST_USER_PLANS.MAX }))
      return PODCASTOGIST_USER_PLANS.MAX;
    if (has?.({ plan: PODCASTOGIST_USER_PLANS.PLUS }))
      return PODCASTOGIST_USER_PLANS.PLUS;
    return PODCASTOGIST_USER_PLANS.FREE;
  }, [has]);
  const maxFileSize = PLAN_LIMITS[userPlan].maxFileSize;
  const maxFileSizeLabel = PLAN_LIMITS[userPlan].maxFileSizeLabel;

  /**
   * Handle accepted files from dropzone
   *
   * Only takes first file (maxFiles: 1 enforced)
   * Rejected files are handled by react-dropzone
   */
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  // react-dropzone configuration and state
  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: ALLOWED_AUDIO_TYPES_EXTENSION_MAP,
      maxSize: maxFileSize, // File size limit (validates before upload)
      maxFiles: 1, // Only allow single file selection
      disabled, // Disable dropzone during upload
    });

  // Extract first rejection error for display
  const errorMessage = fileRejections[0]?.errors[0]?.message;
  const errorCode = fileRejections[0]?.errors[0]?.code;

  return (
    <div className='w-full'>
      <div
        {...getRootProps()}
        className={cn(
          // Base styles: Dashed border, clickable, transitions
          'border-3 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all',
          'border-blue-300 hover:border-blue-500 hover:bg-blue-50/50',
          // Drag active state (file hovering over dropzone)
          isDragActive && 'border-blue-600 bg-blue-50 scale-[1.02] shadow-xl',
          // Disabled state
          disabled && 'opacity-50 cursor-not-allowed',
          // Error state
          errorMessage && 'border-red-400 bg-red-50/30',
          !disabled && 'hover-glow'
        )}
      >
        <input {...getInputProps()} />

        <div className='flex flex-col items-center gap-6'>
          <div
            className={cn(
              'rounded-3xl p-8 transition-all',
              isDragActive
                ? 'gradient-sunrise animate-pulse-sunrise shadow-2xl scale-110'
                : 'glass-card'
            )}
          >
            {isDragActive ? (
              <Upload className='h-16 w-16 text-white animate-bounce' />
            ) : (
              <AudioLines className='h-16 w-16 text-blue-600' />
            )}
          </div>

          {/* Instructions and info */}
          <div className='space-y-3'>
            <p className='text-2xl font-bold text-gray-900'>
              {isDragActive
                ? 'Drop your podcast file here'
                : 'Drag & drop your podcast file'}
            </p>
            <p className='text-base text-gray-600'>or click to browse files</p>
            <div className='pt-2 space-y-1'>
              <p className='text-sm text-gray-500 font-medium'>
                Supports: MP3, WAV, M4A, FLAC, OGG, AAC, and more
              </p>
              <p className='text-sm text-gray-500 font-semibold'>
                Maximum file size: {maxFileSizeLabel}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error message display */}
      {errorMessage && (
        <div className='mt-4 p-4 rounded-xl bg-red-50 border border-red-200'>
          <p className='text-sm text-red-600 font-medium'>
            {errorCode === ErrorCode.FileTooLarge
              ? `File is larger than ${maxFileSizeLabel}`
              : errorMessage}
          </p>
        </div>
      )}
    </div>
  );
};
