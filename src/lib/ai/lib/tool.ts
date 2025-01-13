import type { Awaitable } from "discord.js";
import type { Tool as OllamaTool } from "ollama";
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

  async run(args: unknown, grad: Grad): Promise<string | object | ToolError> {
    try {
      // @ts-expect-error - this is fine
      const result = await this.execute(args, grad);
      return result;
    } catch (e) {
      return {
        error: `Something went wrong while executing \`${this.name}\` tool.`,
        stack: e,
      } as ToolError;
    }
  }

  toJSON(): OllamaTool {
    return {
      type: "function",
      function: {
        name: this.name,
        description: this.description,
        // @ts-expect-error - type is incorrect
        parameters: zodToJsonSchema(this.schema),
      },
    };
  }
}
