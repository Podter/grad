import path from "node:path";
import { OllamaEmbeddings } from "@langchain/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { create } from "xmlbuilder2";
import { env } from "~/env";
import type { Grad } from "~/lib/grad";
import { GRAD_INFO, GRAD_INFO_PATH, MEMORIES_PATH } from "../constants";
import { UpsertMemory } from "../tools/upsert-memory";

const embeddings = new OllamaEmbeddings({
  model: env.EMBEDDING_MODEL,
  baseUrl: env.OLLAMA_API,
});

export async function createEmbeddings() {
  return {
    gradInfo: await createGradInfo(),
    memories: await createMemoriesDb(),
  };
}

// Class
class FileVectorStore extends MemoryVectorStore {
  async save(path: Parameters<typeof Bun.write>[0]) {
    await Bun.write(path, JSON.stringify(this.memoryVectors));
  }

  static async fromJSONFile(path: string, embeddings: OllamaEmbeddings) {
    // biome-ignore lint/complexity/noThisInStatic: langchain source code pattern
    const instance = new this(embeddings);
    const data: MemoryVectorStore["memoryVectors"] =
      await Bun.file(path).json();
    await Promise.all(
      data.map(async (memory) => {
        await instance.addVectors(
          [memory.embedding],
          [
            {
              id: memory.id,
              metadata: memory.metadata,
              pageContent: memory.content,
            },
          ],
        );
      }),
    );
    return instance;
  }
}

// Grad
async function createGradInfo() {
  let gradInfo: FileVectorStore;
  try {
    gradInfo = await FileVectorStore.fromJSONFile(
      path.join(GRAD_INFO_PATH),
      embeddings,
    );
  } catch {
    gradInfo = new FileVectorStore(embeddings);
  }

  const cachedInfo = gradInfo.memoryVectors.map((memory) => memory.content);
  if (
    cachedInfo.length !== GRAD_INFO.length ||
    !GRAD_INFO.every((info) => cachedInfo.includes(info))
  ) {
    gradInfo = new FileVectorStore(embeddings);
    await gradInfo.addDocuments(
      GRAD_INFO.map((content) => ({
        pageContent: content,
        metadata: {},
      })),
    );
    await gradInfo.save(GRAD_INFO_PATH);
  }

  return gradInfo;
}

export async function getGradInfo(grad: Grad, content: string) {
  const results = await grad.infoMemories.similaritySearch(content, 5);

  const doc = create().ele("grad_information");
  for (const { pageContent } of results) {
    doc.ele("content").txt(pageContent);
  }
  const xml = doc.end({ prettyPrint: true, headless: true });

  return xml;
}

// User
async function createMemoriesDb() {
  try {
    return await FileVectorStore.fromJSONFile(MEMORIES_PATH, embeddings);
  } catch {
    const memories = new FileVectorStore(embeddings);
    await memories.save(MEMORIES_PATH);
    return memories;
  }
}

export async function getGradMemories(
  grad: Grad,
  content: string,
  userIds: string[],
) {
  const results = await Promise.all(
    userIds.map(async (id) => {
      const user = await grad.users.fetch(id);
      const results = await grad.memories.similaritySearch(
        content,
        5,
        (doc) => doc.metadata.userId === user.id,
      );
      return {
        username: user.displayName,
        userId: user.id,
        contents: results.map((result) => result.pageContent),
      };
    }),
  );

  const doc = create().ele("memories");
  for (const result of results) {
    const item = doc
      .ele("memory")
      .ele("username")
      .txt(result.username)
      .up()
      .ele("user_id")
      .txt(result.userId)
      .up()
      .ele("contents");

    if (result.contents.length > 0) {
      for (const content of result.contents) {
        item.ele("content").txt(content);
      }
    } else {
      item
        .ele("content")
        .txt(
          `No memories for this user yet. Use \`${UpsertMemory.name}\` tool to add memories.`,
        );
    }
  }
  const xml = doc.end({ prettyPrint: true, headless: true });

  return xml;
}

export async function addGradMemories(
  grad: Grad,
  content: string,
  userId: string,
) {
  await grad.memories.addDocuments([
    {
      pageContent: content,
      metadata: { userId },
    },
  ]);
  await grad.memories.save(MEMORIES_PATH);
}
