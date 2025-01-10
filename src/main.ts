import consola from "consola";
import { env } from "./env";
import { Grad } from "./lib/grad";
import { mkdir } from "./lib/utils/mkdir";

consola.start("Starting Grad...");

(globalThis as unknown as { tick: number }).tick = performance.now();

mkdir(env.BRAD_DATA);

(globalThis as unknown as { brad: Grad }).brad = new Grad();
