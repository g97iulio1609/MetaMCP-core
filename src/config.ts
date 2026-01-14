import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const envSchema = z.object({
  FACEBOOK_ACCESS_TOKEN: z.string().min(1),
  FACEBOOK_PAGE_ID: z.string().min(1),
  FACEBOOK_GRAPH_VERSION: z.string().min(1).default("v24.0"),
  FACEBOOK_GRAPH_BASE_URL: z.string().url().optional(),
  FACEBOOK_REQUEST_TIMEOUT_MS: z.coerce.number().default(10000),
  FACEBOOK_REQUEST_RETRIES: z.coerce.number().default(3),

  // Instagram
  INSTAGRAM_ACCOUNT_ID: z.string().optional(),

  // Threads
  THREADS_ACCESS_TOKEN: z.string().optional(),
  THREADS_USER_ID: z.string().optional(),

  // WhatsApp
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().optional(),
});

type EnvConfig = z.infer<typeof envSchema>;

const env = envSchema.parse(process.env) as EnvConfig;

export const graphConfig = {
  accessToken: env.FACEBOOK_ACCESS_TOKEN,
  pageId: env.FACEBOOK_PAGE_ID,
  baseUrl:
    env.FACEBOOK_GRAPH_BASE_URL ??
    `https://graph.facebook.com/${env.FACEBOOK_GRAPH_VERSION}`,
  timeoutMs: env.FACEBOOK_REQUEST_TIMEOUT_MS,
  retries: env.FACEBOOK_REQUEST_RETRIES,
  // Instagram
  instagramAccountId: env.INSTAGRAM_ACCOUNT_ID,
  // Threads
  threadsAccessToken: env.THREADS_ACCESS_TOKEN,
  threadsUserId: env.THREADS_USER_ID,
  // WhatsApp
  whatsappAccessToken: env.WHATSAPP_ACCESS_TOKEN,
  whatsappPhoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
  whatsappBusinessAccountId: env.WHATSAPP_BUSINESS_ACCOUNT_ID,
};
