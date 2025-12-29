// Test-only Convex mutations for deterministic E2E setup.
// These seed/reset helpers create stable demo/error projects from fixtures
// and keep the UI + pipeline behavior consistent without external providers.

import { generateHighlightMoments } from '../inngest/steps/ai-generation/highlight-moments';
import { PODCAST_PROCESSING_PHASE_STATUS } from '../lib/constants';
import type { TranscriptWithExtras } from '../lib/types';
import aiOutputsFixture from '../tests/foundation/fixtures/ai_outputs.json';
import transcriptFixture from '../tests/foundation/fixtures/transcript.json';
import { mutation } from './_generated/server';

const MOCK_USER_ID = 'user_test_1';

// Normalize fixture transcript to the Convex schema.
const buildTranscriptForConvex = (transcript: TranscriptWithExtras) => ({
  text: transcript.text,
  segments: transcript.segments,
  speakers: transcript.utterances.map((utterance) => ({
    speaker: utterance.speaker,
    start: utterance.start / 1000,
    end: utterance.end / 1000,
    text: utterance.text,
    confidence: utterance.confidence
  })),
  chapters: transcript.chapters
});

export const reset = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear all projects for a clean test slate.
    const projects = await ctx.db.query('projects').collect();
    await Promise.all(projects.map((project) => ctx.db.delete(project._id)));
    return { deleted: projects.length };
  }
});

export const seedDemoProject = mutation({
  args: {},
  handler: async (ctx) => {
    // Seed a completed project with full outputs.
    const transcript = transcriptFixture as TranscriptWithExtras;
    const highlightMoments = await generateHighlightMoments(transcript);
    const now = Date.now();

    const projectId = await ctx.db.insert('projects', {
      userId: MOCK_USER_ID,
      inputUrl: 'https://mock.blob.local/demo-episode.mp3',
      fileName: 'demo-episode.mp3',
      displayName: 'Demo Episode',
      fileSize: 5242880,
      fileDuration: 180,
      fileFormat: 'mp3',
      mimeType: 'audio/mpeg',
      status: 'completed',
      jobStatus: {
        transcription: PODCAST_PROCESSING_PHASE_STATUS.COMPLETED,
        contentGeneration: PODCAST_PROCESSING_PHASE_STATUS.COMPLETED
      },
      transcript: buildTranscriptForConvex(transcript),
      highlightMoments,
      recaps: aiOutputsFixture.recaps,
      socialPosts: aiOutputsFixture.social_posts,
      titles: aiOutputsFixture.titles,
      hashtags: aiOutputsFixture.hashtags,
      youtubeTimestamps: aiOutputsFixture.youtube_timestamps,
      createdAt: now,
      updatedAt: now,
      completedAt: now
    });

    return { projectId };
  }
});

export const seedErrorProject = mutation({
  args: {},
  handler: async (ctx) => {
    // Seed a completed project with a mock failure for retry flows.
    const transcript = transcriptFixture as TranscriptWithExtras;
    const highlightMoments = await generateHighlightMoments(transcript);
    const now = Date.now();

    const projectId = await ctx.db.insert('projects', {
      userId: MOCK_USER_ID,
      inputUrl: 'https://mock.blob.local/error-episode.mp3',
      fileName: 'error-episode.mp3',
      displayName: 'Error Episode',
      fileSize: 3145728,
      fileDuration: 180,
      fileFormat: 'mp3',
      mimeType: 'audio/mpeg',
      status: 'completed',
      jobStatus: {
        transcription: PODCAST_PROCESSING_PHASE_STATUS.COMPLETED,
        contentGeneration: PODCAST_PROCESSING_PHASE_STATUS.COMPLETED
      },
      transcript: buildTranscriptForConvex(transcript),
      highlightMoments,
      recaps: aiOutputsFixture.recaps,
      titles: aiOutputsFixture.titles,
      hashtags: aiOutputsFixture.hashtags,
      youtubeTimestamps: aiOutputsFixture.youtube_timestamps,
      jobErrors: {
        socialPosts: 'Mock failure: provider timeout'
      },
      createdAt: now,
      updatedAt: now,
      completedAt: now
    });

    return { projectId };
  }
});
