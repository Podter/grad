import { z } from "zod";
import { Tool } from "../lib/tool";
import { addGradMemories } from "../models/vector";

export const UpsertMemory = new Tool({
  name: "upsert_memory",
  description: "Upsert a memory in the database.",
  schema: z.object({
    content: z.string().describe("The content of the memory."),
    userId: z.string().describe("User ID of the memory owner."),
  }),
  execute({ content, userId }, grad) {
    // biome-ignore lint/suspicious/noEmptyBlockStatements: make this synchronous
    addGradMemories(grad, content, userId).then(() => {});
    return "Memory saved.";
  },
});
