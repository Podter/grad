import type { Awaitable } from "discord.js";
import type { ChatCompletionTool } from "openai/resources/index";
import type { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { Grad } from "~/lib/grad";

export interface ToolError {
  error: string;
  stack?: string;
}

// biome-ignore lint/suspicious/noExplicitAny: generic type is necessary for schema inference
interface ToolOptions<T extends z.ZodObject<any>> {
  name: string;
  description: string;
  schema: T;
  execute: (
    args: z.infer<T>,
    grad: Grad,
  ) => Awaitable<string | object | ToolError>;
}

// biome-ignore lint/suspicious/noExplicitAny: generic type is necessary for schema inference
export class Tool<T extends z.ZodObject<any>> {
  readonly name: string;
  readonly description: string;
  readonly schema: T;
  readonly execute: (
    args: z.infer<T>,
    grad: Grad,
  ) => Awaitable<string | object | ToolError>;

  constructor({ name, description, schema, execute }: ToolOptions<T>) {
    this.name = name;
    this.description = description;
    this.schema = schema;
    this.execute = execute;
  }

  async run(args: string, grad: Grad): Promise<string | object | ToolError> {
    try {
      const parsed = this.schema.parse(JSON.parse(args));
      const result = await this.execute(parsed, grad);
      return result;
    } catch (e) {
      return {
        error: `Something went wrong while executing \`${this.name}\` tool.`,
        stack: e,
      } as ToolError;
    }
  }

  toJSON(): ChatCompletionTool {
    return {
      type: "function",
      function: {
        name: this.name,
        description: this.description,
        parameters: zodToJsonSchema(this.schema),
      },
    };
  }
}
