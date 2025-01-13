import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    TOKEN: z.string(),
    APPLICATION_ID: z.string(),
    DEV_GUILD_ID: z.string(),

    OPENAI_BASE_URL: z.string().optional(),
    OPENAI_API_KEY: z.string(),

    SEARXNG_API: z.string(),

    CHAT_MODEL: z.string(),
    EMBEDDING_MODEL: z.string(),

    GRAD_DATA: z.string().optional().default("./data"),
    NODE_ENV: z.enum(["development", "production"]).default("development"),
  },
  runtimeEnv: Bun.env,
  emptyStringAsUndefined: true,
});
