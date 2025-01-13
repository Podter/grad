import consola from "consola";
import { env } from "~/env";
import type { Grad } from "../lib/grad";
import {
  AssistantMessage,
  type ChatMessagesStore,
  type ToolResult,
  ToolResultMessage,
} from "./lib/message";
import { openai } from "./openai";
import { tools } from "./tools";

export async function generateChat(
  grad: Grad,
  store: ChatMessagesStore,
  toolUseCount = 0,
): Promise<AssistantMessage> {
  const res = await openai.chat.completions.create({
    model: env.CHAT_MODEL,
    stream: false,
    temperature: 0.7,
    max_tokens: 1024,
    tool_choice: toolUseCount > 5 ? "none" : "auto",
    parallel_tool_calls: false,
    tools: tools.map((tool) => tool.toJSON()),
    messages: await store.toOpenAIMessages(grad),
  });
  const result = res.choices[0];

  const message = new AssistantMessage(result.message);
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
          return {
            id: call.id,
            content: result,
          } as ToolResult;
        }

        return {
          id: call.id,
          content: {
            error: `Unknown tool: \`${call.function.name}\``,
          },
        } as ToolResult;
      }),
    );

    for (const result of results) {
      const toolMessage = new ToolResultMessage(result);
      store.add(toolMessage);
    }

    return await generateChat(grad, store, toolUseCount + 1);
  }

  return message;
}
