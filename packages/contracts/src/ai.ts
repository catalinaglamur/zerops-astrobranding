import { z } from "zod";

export const ChatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatCompletionRequestSchema = z.object({
  model: z.string().default("default"),
  messages: z.array(ChatMessageSchema),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().int().positive().optional(),
  stream: z.boolean().default(false),
});

export type ChatCompletionRequest = z.infer<typeof ChatCompletionRequestSchema>;

export const ChatCompletionResponseSchema = z.object({
  id: z.string(),
  model: z.string(),
  provider: z.string().optional(),
  choices: z.array(
    z.object({
      index: z.number(),
      message: ChatMessageSchema,
      finishReason: z.string().nullable(),
    })
  ),
  usage: z
    .object({
      promptTokens: z.number().optional(),
      completionTokens: z.number().optional(),
      totalTokens: z.number().optional(),
    })
    .optional(),
});

export type ChatCompletionResponse = z.infer<typeof ChatCompletionResponseSchema>;
