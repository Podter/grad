import { Parser } from "expr-eval";
import { z } from "zod";
import { Tool } from "../lib/tool";

export const Calculator = new Tool({
  name: "calculator",
  description: "Useful for getting the result of a math expression.",
  schema: z.object({
    input: z
      .string()
      .describe(
        "A valid mathematical expression that could be executed by a simple calculator.",
      ),
  }),
  execute({ input }) {
    return Parser.evaluate(input).toString();
  },
});
