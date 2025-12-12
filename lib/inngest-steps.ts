export const INNGEST_STEPS = {
  UPDATE_STATUS_PROCESSING: 'update-status-processing',
  UPDATE_JOB_STATUS_TRANSCRIPTION_RUNNING:
    'update-job-status-transcription-running',
  TRANSCRIBE_AUDIO: 'transcribe-audio',
  UPDATE_JOB_STATUS_TRANSCRIPTION_COMPLETED:
    'update-job-status-transcription-completed',
  UPDATE_JOB_STATUS_GENERATION_RUNNING: 'update-job-status-generation-running',
  UPDATE_JOB_STATUS_GENERATION_COMPLETED:
    'update-job-status-generation-completed',
  SAVE_RESULTS_TO_CONVEX: 'save-results-to-convex',
  SAVE_JOB_ERRORS: 'save-job-errors',

  // Invoked only by the retry job
  SAVE_HIGHLIGHT_MOMENTS: 'save-highlight-moments',
  SAVE_RECAPS: 'save-recaps',
  SAVE_SOCIAL_POSTS: 'save-social-posts',
  SAVE_TITLES: 'save-titles',
  SAVE_HASHTAGS: 'save-hashtags',
  SAVE_YOUTUBE_TIMESTAMPS: 'save-youtube-timestamps',
  CLEAR_JOB_ERROR: 'clear-job-error',

  // Steps where AI services are used within
  AI: {
    GENERATE_HASHTAGS: 'generate-hashtags-with-gpt',
    GENERATE_RECAPS: 'generate-recaps-with-gpt',
    GENERATE_SOCIAL_POSTS: 'generate-social-posts-with-gpt',
    GENERATE_TITLES: 'generate-titles-with-gpt',
  },
};
