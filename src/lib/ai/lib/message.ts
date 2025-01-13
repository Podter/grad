import type { Awaitable, User } from "discord.js";
import type { Message, ToolCall } from "ollama";

export class BaseMessage {
  toJSON(): Awaitable<Message> {
    throw new Error("Method not implemented.");
  }

  isUserMessage(): this is UserMessage {
    return this instanceof UserMessage;
  }

  isAssistantMessage(): this is AssistantMessage {
    return this instanceof AssistantMessage;
  }

  isToolResultMessage(): this is ToolResultMessage {
    return this instanceof ToolResultMessage;
  }
}

export class UserMessage extends BaseMessage {
  readonly user: User;
  readonly message: string;

  constructor(user: User, message: string) {
    super();
    this.user = user;
    this.message = message;
  }

  toJSON(): Message {
    return {
      role: "user",
      content: this.message,
    };
  }
}

export class AssistantMessage extends BaseMessage {
  readonly content: string;
  readonly toolCalls?: ToolCall[];

  constructor(content: string, toolCalls?: ToolCall[]) {
    super();
    this.content = content;
    this.toolCalls = toolCalls;
  }

  // get message(): string {
  //   if (typeof this.content === "string") {
  //     return extractResponse(this.content);
  //   }
  //   const message = this.content.find((block) => block.type === "text");
  //   return extractResponse(message?.text ?? "");
  // }

  toJSON(): Message {
    return {
      role: "assistant",
      content: this.content,
      tool_calls: this.toolCalls,
    };
  }
}

export class ToolResultMessage extends BaseMessage {
  readonly result: string | object;

  constructor(result: string | object) {
    super();
    this.result = result;
  }

  toJSON(): Message {
    return {
      role: "tool",
      content: JSON.stringify(this.result, null, 2),
    };
  }
}

export class ChatMessagesStore {
  readonly messages: BaseMessage[];

  constructor() {
    this.messages = [];
  }

  add(message: BaseMessage) {
    this.messages.push(message);
  }

  async toOllamaMessages(): Promise<Message[]> {
    const result = await Promise.all(
      this.messages.map(async (message) => await message.toJSON()),
    );
    return result;
  }
}
