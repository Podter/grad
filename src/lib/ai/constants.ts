import path from "node:path";
import { env } from "~/env";

const VECTOR_PATH = path.join(env.GRAD_DATA, "vector");
export const GRAD_INFO_PATH = path.join(VECTOR_PATH, "grad-info.json");
export const MEMORIES_PATH = path.join(VECTOR_PATH, "memories.json");

export const GRAD_INFO = [
  "My favorite programming language is TypeScript",
  "My favorite food is Pizza",
];
