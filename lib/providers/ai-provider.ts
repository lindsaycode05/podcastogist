// AI provider wrapper for chat completions.
// Handles mock outputs for deterministic tests and real OpenAI calls in prod.
import type OpenAI from 'openai';
import { isMockAI } from '@/lib/_tests_/mock-flags';
import { getOpenAI } from '@/lib/openai-client';
import aiOutputsFixture from '../../tests/foundation/fixtures/ai_outputs.json';

type ChatCompletionParams =
  OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming;
type ChatCompletion = OpenAI.Chat.Completions.ChatCompletion;

// Read schema name from response_format for structured output fixtures.
const getMockSchemaName = (params: ChatCompletionParams): string | undefined =>
  (params.response_format as { json_schema?: { name?: string } })?.json_schema
    ?.name;

// Select deterministic fixture content based on the schema name.
const buildMockContent = (schemaName?: string): string => {
  if (!schemaName) {
    return JSON.stringify(aiOutputsFixture.recaps);
  }

  switch (schemaName) {
    case 'recaps':
      return JSON.stringify(aiOutputsFixture.recaps);
    case 'social_posts':
      return JSON.stringify(aiOutputsFixture.social_posts);
    case 'titles':
      return JSON.stringify(aiOutputsFixture.titles);
    case 'hashtags':
      return JSON.stringify(aiOutputsFixture.hashtags);
    case 'youtube_chapter_titles':
      return JSON.stringify(aiOutputsFixture.youtube_chapter_titles);
    default:
      return JSON.stringify(aiOutputsFixture.recaps);
  }
};

// Build a minimal ChatCompletion payload for mock mode.
const buildMockCompletion = (params: ChatCompletionParams): ChatCompletion => {
  const schemaName = getMockSchemaName(params);
  const content = buildMockContent(schemaName);
  const now = Math.floor(Date.now() / 1000);

  return {
    id: `mock-chatcmpl-${schemaName || 'default'}`,
    object: 'chat.completion',
    created: now,
    model: params.model || 'mock',
    choices: [
      {
        index: 0,
        finish_reason: 'stop',
        message: {
          role: 'assistant',
          content
        }
      }
    ],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0
    }
  } as ChatCompletion;
};

export const aiProvider = {
  createChatCompletion: async (
    params: ChatCompletionParams
  ): Promise<ChatCompletion> => {
    if (isMockAI()) {
      return buildMockCompletion(params);
    }

    // Bind OpenAI method to preserve `this` context for step.ai.wrap
    return getOpenAI().chat.completions.create(params);
  }
};
