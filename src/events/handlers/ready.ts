import { consola } from "consola";
import { Events } from "discord.js";
import { env } from "~/env";
import { version } from "../../../package.json";
import { AppEvent } from "../builder";

// @ts-expect-error - this is a file import
import gitHead from "../../../.git/HEAD" with { type: "file" };
// @ts-expect-error - this is a file import
import gitHeadLog from "../../../.git/logs/HEAD" with { type: "file" };

export const AppReady = new AppEvent({
  name: Events.ClientReady,
  once: true,
  async execute(grad) {
    consola.success(`Client logged in as \`${grad.user?.tag}\``);

    const { commit, branch } = await getGitInfo();
    consola.box({
      message: `Grad v${version}`,
      additional: [
        "--------------------",
        `Start time: \`${new Date().toString()}\``,
        `User: \`${grad.user?.tag}\``,
        `Mode: \`${env.NODE_ENV}\``,
        `Commit: \`${commit} (${branch})\``,
      ],
    });

    const { tick } = globalThis as unknown as { tick: number };
    const tock = performance.now();
    consola.success(
      `Grad is up and running. took \`${((tock - tick) / 1000).toFixed(2)}s\` to start`,
    );
  },
});

const BRANCH_REGEX = /^ref: refs\/heads\//;
async function getGitInfo() {
  const [headLog, head] = await Promise.all([
    Bun.file(gitHeadLog).text(),
    Bun.file(gitHead).text(),
  ]);
  return {
    commit: headLog.split("\n").filter(String).pop()?.split(" ")[1],
    branch: head.replace(BRANCH_REGEX, "").trim(),
  };
}
