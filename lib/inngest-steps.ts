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

  AI: {
    GENERATE_HASHTAGS: 'generate-hashtags-with-gpt',
    GENERATE_RECAPS: 'generate-recaps-with-gpt',
    GENERATE_SOCIAL_POSTS: 'generate-social-posts-with-gpt',
    GENERATE_TITLES: 'generate-titles-with-gpt',
  },
};
