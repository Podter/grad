import type { Awaitable, MessageReference, User } from "discord.js";
import { Message as DiscordMessage } from "discord.js";
import type {
  ChatCompletionMessage,
  ChatCompletionMessageParam,
} from "openai/resources/index";
import type { Grad } from "~/lib/grad";
import {
  extractResponse,
  inputPromptTemplate,
  systemPromptTemplate,
} from "../models/chat";
import { getGradInfo, getGradMemories } from "../models/vector";

export class BaseMessage {
  toJSON(): Awaitable<ChatCompletionMessageParam> {
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

  async toJSON(): Promise<ChatCompletionMessageParam> {
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
  readonly content: ChatCompletionMessage;

  constructor(content: ChatCompletionMessage) {
    super();
    this.content = content;
  }

  get message(): string {
    return extractResponse(this.content.content ?? "");
  }

  toJSON(): ChatCompletionMessageParam {
    return this.content;
  }
}

export interface ToolResult {
  id: string;
  content: string | object;
}

export class ToolResultMessage extends BaseMessage {
  readonly result: ToolResult;

  constructor(result: ToolResult) {
    super();
    this.result = result;
  }

  toJSON(): ChatCompletionMessageParam {
    return {
      role: "tool",
      tool_call_id: this.result.id,
      content: JSON.stringify(this.result.content, null, 2),
    };
  }
}

export class ChatMessagesStore {
  readonly messages: BaseMessage[];
  readonly searchIndexes: string[];

  constructor() {
    this.messages = [];
    this.searchIndexes = [];
  }

  add(message: BaseMessage) {
    this.messages.push(message);
  }

  addSearchIndex(message: DiscordMessage | MessageReference) {
    const searchIndex =
      ChatMessagesStore.messageToChatMessagesStoreSearch(message);
    this.searchIndexes.push(searchIndex);
  }

  static messageToChatMessagesStoreSearch(
    message: DiscordMessage | MessageReference,
  ) {
    if (message instanceof DiscordMessage) {
      return `${message.channel.id}:${message.id}`;
    }
    return `${message.channelId}:${message.messageId}`;
  }

  get lastUserMessage(): UserMessage | undefined {
    const lastUserMessage = this.messages.findLast((message) =>
      message.isUserMessage(),
    );
    return lastUserMessage;
  }

  get users(): User[] {
    return this.messages
      .filter((message) => message.isUserMessage())
      .map(({ user }) => user)
      .filter((value, index, self) => self.indexOf(value) === index);
  }

  async generateSystemPrompt(grad: Grad) {
    const lastUserMessageContent = this.lastUserMessage?.message ?? "";
    const [gradInformation, memories] = await Promise.all([
      getGradInfo(grad, lastUserMessageContent),
      getGradMemories(
        grad,
        lastUserMessageContent,
        this.users.map((user) => user.id),
      ),
    ]);

    const prompt = await systemPromptTemplate.invoke({
      gradInformation,
      memories,
    });

    return prompt.value;
  }

  async toOpenAIMessages(grad: Grad): Promise<ChatCompletionMessageParam[]> {
    const [systemPrompt, ...messages] = await Promise.all([
      this.generateSystemPrompt(grad),
      ...this.messages.map(async (message) => await message.toJSON()),
    ]);

    return [
      {
        role: "system",
        content: systemPrompt,
      },
      ...messages,
    ];
  }
}
