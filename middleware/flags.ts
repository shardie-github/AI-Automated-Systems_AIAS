import fs from "fs";
import path from "path";

const FLAGS_PATH = path.join(process.cwd(), "featureflags", "flags.json");

export function loadFlags(): Record<string, any> {
  try {
    const content = fs.readFileSync(FLAGS_PATH, "utf8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}

export function getFlag(key: string, defaultValue: any = false): any {
  const flags = loadFlags();
  return flags[key] ?? defaultValue;
}
