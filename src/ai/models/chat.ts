import { PromptTemplate } from "@langchain/core/prompts";
import { create } from "xmlbuilder2";
// @ts-expect-error - this is a file import
import systemPrompt from "./prompts/chat.md" with { type: "file" };

export const systemPromptTemplate = PromptTemplate.fromTemplate<{
  gradInformation: string;
  memories: string;
}>(await Bun.file(systemPrompt).text());

export const inputPromptTemplate = PromptTemplate.fromTemplate<{
  content: string;
  username: string;
  userId: string;
}>(
  create({
    user_message: {
      message_content: "{content}",
      username: "{username}",
      user_id: "{userId}",
    },
  }).end({ prettyPrint: true, headless: true }),
);

const responseRegex = /<grad_response>(.*?)<\/grad_response>/s;
export function extractResponse(content: string): string {
  const match = content.match(responseRegex);
  const result = match ? match[1].trim() : "";
  return result;
}
