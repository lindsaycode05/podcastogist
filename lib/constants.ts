/**
 * Application Constants
 *
 * Centralized configuration values used across the application.
 * Includes file size limits, allowed formats, timing constants, and UI config.
 */
import type { LucideIcon } from 'lucide-react';
import { FileText, Hash, Type, Share2, Crosshair, Youtube } from 'lucide-react';
import type { PhaseStatus, UploadStatus } from '@/lib/types';

/**
 * Allowed audio MIME types for upload validation
 *
 * Comprehensive list for cross-browser compatibility:
 * - Different browsers report different MIME types for same format
 * - Includes both standard and vendor-specific types
 * - Validated both client-side (dropzone) and server-side (API route)
 */
export const ALLOWED_AUDIO_TYPES_LIST = [
  'audio/mpeg', // MP3 (standard)
  'audio/mp3', // MP3 (alternate)
  'audio/mp4', // M4A (standard)
  'audio/m4a', // M4A (alternate)
  'audio/x-m4a', // M4A (Apple)
  'audio/wav', // WAV (standard)
  'audio/x-wav', // WAV (Microsoft)
  'audio/wave', // WAV (alternate)
  'audio/aac', // AAC
  'audio/aacp', // AAC+
  'audio/ogg', // OGG Vorbis
  'audio/opus', // Opus
  'audio/webm', // WebM Audio
  'audio/flac', // FLAC (standard)
  'audio/x-flac', // FLAC (alternate)
  'audio/3gpp', // 3GP
  'audio/3gpp2', // 3G2
];

export const ALLOWED_AUDIO_TYPES_EXTENSION_MAP = {
  'audio/mpeg': ['.mp3'], // MP3 (standard)
  'audio/mp3': ['.mp3'], // MP3 (alternate)
  'audio/mp4': ['.m4a'], // M4A (standard)
  'audio/m4a': ['.m4a'], // M4A (alternate)
  'audio/x-m4a': ['.m4a'], // M4A (Apple)
  'audio/wav': ['.wav', '.wave'], // WAV (standard)
  'audio/x-wav': ['.wav', '.wave'], // WAV (Microsoft)
  'audio/wave': ['.wav', '.wave'], // WAV (alternate)
  'audio/aac': ['.aac'], // AAC
  'audio/aacp': ['.aac'], // AAC+
  'audio/ogg': ['.ogg', '.oga'], // OGG Vorbis
  'audio/opus': ['.opus'], // Opus
  'audio/webm': ['.webm'], // WebM Audio
  'audio/flac': ['.flac'], // FLAC (standard)
  'audio/x-flac': ['.flac'], // FLAC (alternate)
  'audio/3gpp': ['.3gp'], // 3GP
  'audio/3gpp2': ['.3g2'], // 3G2
};

/**
 * Progress animation constants
 *
 * Used in processing flow for smooth progress indication:
 * - PROGRESS_CAP_PERCENTAGE: Stop at 95% until actual completion (UX best practice)
 * - ANIMATION_INTERVAL_MS: Speed of progress bar animation
 * - PROGRESS_UPDATE_INTERVAL_MS: How often to recalculate progress
 */
export const PROGRESS_CAP_PERCENTAGE = 95;
export const ANIMATION_INTERVAL_MS = 4000;
export const PROGRESS_UPDATE_INTERVAL_MS = 1000;

/**
 * Time conversion constants
 *
 * Used for duration formatting and time calculations
 */
export const MS_PER_MINUTE = 60000;
export const MS_PER_HOUR = 3600000;
export const MS_PER_DAY = 86400000;

/**
 * UI configuration for generation outputs
 *
 * Defines the 6 AI generation tasks displayed during processing:
 * - Name: Display name for UI
 * - Icon: Lucide icon component
 * - Description: What the task generates
 *
 * Used in ProcessingFlow component to show progress
 */
export interface GenerationOutput {
  name: string;
  icon: LucideIcon;
  description: string;
}

export const GENERATION_OUTPUTS: GenerationOutput[] = [
  {
    name: 'Recaps',
    icon: FileText,
    description:
      'Producing rich episode overviews packed with key insights and takeaways',
  },
  {
    name: 'Highlight Moments',
    icon: Crosshair,
    description:
      'Spotting standout segments, key timestamps, and quotable moments',
  },
  {
    name: 'Social Posts',
    icon: Share2,
    description:
      'Writing channel-ready social copy for Twitter, LinkedIn, Instagram, TikTok, YouTube, and Facebook',
  },
  {
    name: 'Titles',
    icon: Type,
    description:
      'Creating scroll-stopping, SEO-friendly titles and keywords to boost reach',
  },
  {
    name: 'Hashtags',
    icon: Hash,
    description:
      'Creating trending platform-specific hashtag strategies for better discoverability',
  },
  {
    name: 'YouTube Timestamps',
    icon: Youtube,
    description:
      'Formatting clickable chapter markers for YouTube video descriptions',
  },
];

export const PODCAST_UPLOAD_STATUS: {
  IDLE: UploadStatus;
  UPLOADING: UploadStatus;
  PROCESSING: UploadStatus;
  COMPLETED: UploadStatus;
  ERROR: UploadStatus;
} = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error',
};

export const PODCAST_PROCESSING_PHASE_STATUS: {
  PENDING: PhaseStatus;
  RUNNING: PhaseStatus;
  COMPLETED: PhaseStatus;
  FAILED: PhaseStatus;
} = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
};
