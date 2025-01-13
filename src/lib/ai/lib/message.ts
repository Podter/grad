import type { Awaitable, User } from "discord.js";
import type { Message, ToolCall } from "ollama";
import {
  extractResponse,
  inputPromptTemplate,
  systemPromptTemplate,
} from "../models/chat";

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

  async toJSON(): Promise<Message> {
    const { value } = await inputPromptTemplate.invoke({
      content: this.message,
      username: this.user.displayName,
      userId: this.user.id,
    });
    return {
      role: "user",
      content: value,
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

  get message(): string {
    return extractResponse(this.content);
  }

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
    const [systemPrompt, ...messages] = await Promise.all([
      // TODO: replace with actual data
      systemPromptTemplate.invoke({
        gradInformation: "Likes pizza",
        memories: "Users are nice",
      }),
      ...this.messages.map(async (message) => await message.toJSON()),
    ]);

    return [
      {
        role: "system",
        content: systemPrompt.value,
      },
      ...messages,
    ];
  }
}
