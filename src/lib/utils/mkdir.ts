import fs from "node:fs";

export function mkdir(path: string) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}
