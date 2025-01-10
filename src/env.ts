import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    TOKEN: z.string(),
    APPLICATION_ID: z.string(),
    DEV_GUILD_ID: z.string(),

    OLLAMA_API: z.string().default("http://localhost:11434"),
    SEARXNG_API: z.string().default("http://localhost:8080"),

    GRAD_DATA: z.string().optional().default("./data"),
    NODE_ENV: z.enum(["development", "production"]).default("development"),
  },
  runtimeEnv: Bun.env,
  emptyStringAsUndefined: true,
});
