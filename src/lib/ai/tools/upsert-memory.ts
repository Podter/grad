import { z } from "zod";
import { Tool } from "../lib/tool";

export const UpsertMemory = new Tool({
  name: "upsert_memory",
  description: "Upsert a memory in the database.",
  schema: z.object({
    content: z.string().describe("The content of the memory."),
    userId: z.string().describe("User ID of the memory owner."),
  }),
  execute({ content, userId }) {
    // TODO: implement memory upsertion
    console.log({ content, userId });
    return "Memory saved.";
  },
});
