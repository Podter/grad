import consola from "consola";
import { env } from "~/env";
import type { Grad } from "../grad";
import {
  AssistantMessage,
  type ChatMessagesStore,
  ToolResultMessage,
} from "./lib/message";
import type { ToolError } from "./lib/tool";
import { ollama } from "./ollama";
import { tools } from "./tools";

export async function generateChat(
  grad: Grad,
  store: ChatMessagesStore,
): Promise<AssistantMessage> {
  const result = await ollama.chat({
    model: env.CHAT_MODEL,
    stream: false,
    options: {
      temperature: 0.7,
      num_ctx: 1024, // Max tokens
    },
    tools: tools.map((tool) => tool.toJSON()),
    messages: await store.toOllamaMessages(),
  });

  const message = new AssistantMessage(
    result.message.content,
    result.message.tool_calls,
  );
  store.add(message);

  if (result.message.tool_calls && result.message.tool_calls.length > 0) {
    const results = await Promise.all(
      result.message.tool_calls.map(async (call) => {
        const tool = tools.find((tool) => tool.name === call.function.name);

        if (tool) {
          consola.info(`ai executing \`${call.function.name}\` tool`);

          const tick = performance.now();
          const result = await tool.run(call.function.arguments, grad);
          const tock = performance.now();

          consola.info(
            `ai executed \`${call.function.name}\` took \`${((tock - tick) / 1000).toFixed(2)}s\``,
          );
          return result;
        }

        return {
          error: `Unknown tool: \`${call.function.name}\``,
        } as ToolError;
      }),
    );

    for (const result of results) {
      const toolMessage = new ToolResultMessage(result);
      store.add(toolMessage);
    }

    return await generateChat(grad, store);
  }

  return message;
}
