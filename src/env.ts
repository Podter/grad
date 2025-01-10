import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    TOKEN: z.string(),
    APPLICATION_ID: z.string(),
    DEV_GUILD_ID: z.string(),
    BRAD_DATA: z.string().optional().default("./data"),
    NODE_ENV: z.enum(["development", "production"]).default("development"),
  },
  runtimeEnv: Bun.env,
  emptyStringAsUndefined: true,
});
