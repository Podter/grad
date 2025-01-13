import consola from "consola";
import { Ollama } from "ollama";
import { env } from "~/env";

export const ollama = new Ollama({
  host: env.OLLAMA_API,
});

export const pullModel = (model: string) =>
  new Promise<void>((resolve, reject) => {
    consola.start(`Pulling model \`${model}\``);
    ollama
      .pull({
        model,
        stream: true,
      })
      .then(async (response) => {
        for await (const part of response) {
          if (part.status === "success") {
            resolve();
          }
        }
      })
      .catch(reject);
  });
