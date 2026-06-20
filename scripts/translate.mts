import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as deepl from "deepl-node";
import * as dotenv from "dotenv";

const scriptDir = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: resolve(scriptDir, "../.env.local") });

const localesDir = resolve(scriptDir, "../src/locales");

const SOURCE: { folder: string; deepl: deepl.SourceLanguageCode } = {
  folder: "uk",
  deepl: "uk",
};

const TARGETS: ReadonlyArray<{
  folder: string;
  deepl: deepl.TargetLanguageCode;
  name: string;
}> = [{ folder: "en", deepl: "en-US", name: "English" }];

const DEEPL_BATCH = 50;

const PLURAL_SUFFIXES = new Set([
  "zero",
  "one",
  "two",
  "few",
  "many",
  "other",
]);

const dryRun = process.argv.includes("--dry") || process.argv.includes("--dry-run");

type NestedJson = { [key: string]: string | NestedJson };

const flatten = (obj: NestedJson, prefix = ""): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix === "" ? key : `${prefix}.${key}`;
    if (typeof value === "string") result[fullKey] = value;
    else Object.assign(result, flatten(value, fullKey));
  }
  return result;
};

const unflatten = (flat: Record<string, string>): NestedJson => {
  const result: NestedJson = {};
  for (const key of Object.keys(flat).sort()) {
    const value = flat[key];
    if (value === undefined) continue;
    const parts = key.split(".");
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (part === undefined) continue;
      const next = current[part];
      if (typeof next !== "object" || next === null) current[part] = {};
      current = current[part] as NestedJson;
    }
    const leaf = parts[parts.length - 1];
    if (leaf !== undefined) current[leaf] = value;
  }
  return result;
};

const loadJson = (filePath: string): NestedJson => {
  if (!existsSync(filePath)) return {};
  try {
    return JSON.parse(readFileSync(filePath, "utf-8")) as NestedJson;
  } catch {
    return {};
  }
};

const saveJson = (filePath: string, data: NestedJson): void => {
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
};

const chunk = <T,>(items: readonly T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

const pluralCategory = (key: string): string | null => {
  const idx = key.lastIndexOf("_");
  if (idx < 0) return null;
  const suffix = key.slice(idx + 1);
  return PLURAL_SUFFIXES.has(suffix) ? suffix : null;
};

const targetCategories = (folder: string): Set<string> =>
  new Set(new Intl.PluralRules(folder).resolvedOptions().pluralCategories);

const isWantedByTarget = (key: string, categories: Set<string>): boolean => {
  const category = pluralCategory(key);
  return category === null || categories.has(category);
};

const wrapTokens = (text: string): string =>
  text.replace(/(\{\{[^}]+\}\})/g, "<x>$1</x>");

const unwrapTokens = (text: string): string => text.replace(/<\/?x>/g, "");

const translateBatchDeepl = async (
  translator: deepl.Translator,
  texts: readonly string[],
  target: deepl.TargetLanguageCode,
): Promise<string[]> => {
  const out: string[] = [];
  for (const part of chunk(texts, DEEPL_BATCH)) {
    const wrapped = part.map(wrapTokens);
    const results = await translator.translateText(wrapped, SOURCE.deepl, target, {
      tagHandling: "xml",
      ignoreTags: ["x"],
    });
    for (const r of results) out.push(unwrapTokens(r.text));
  }
  return out;
};

const main = async (): Promise<void> => {
  const sourceDir = resolve(localesDir, SOURCE.folder);
  const namespaceFiles = readdirSync(sourceDir).filter((f) => f.endsWith(".json"));
  const sourceFlat: Record<string, Record<string, string>> = {};
  for (const file of namespaceFiles) {
    const ns = file.replace(/\.json$/, "");
    sourceFlat[ns] = flatten(loadJson(resolve(sourceDir, file)));
  }

  const plan: Array<{ target: string; ns: string; keys: string[]; texts: string[] }> = [];
  for (const target of TARGETS) {
    const categories = targetCategories(target.folder);
    for (const file of namespaceFiles) {
      const ns = file.replace(/\.json$/, "");
      const source = sourceFlat[ns];
      if (source === undefined) continue;

      const existing = flatten(loadJson(resolve(localesDir, target.folder, file)));
      const missingKeys = Object.keys(source).filter(
        (k) => existing[k] === undefined && isWantedByTarget(k, categories),
      );
      if (missingKeys.length === 0) continue;

      plan.push({
        target: target.folder,
        ns,
        keys: missingKeys,
        texts: missingKeys.map((k) => source[k] ?? ""),
      });
    }
  }

  const totalKeys = plan.reduce((sum, item) => sum + item.keys.length, 0);
  if (totalKeys === 0) {
    console.log(
      `Nothing to translate - ${TARGETS.map((t) => t.folder).join(", ")} already match ${SOURCE.folder}.`,
    );
    return;
  }

  for (const item of plan) {
    console.log(`[${item.target}] ${item.ns}: ${item.keys.length} keys`);
    if (dryRun) for (const key of item.keys) console.log(`    ${key}`);
  }

  if (dryRun) {
    console.log(`\nDry run - ${totalKeys} keys would be translated. No API calls, no writes.`);
    return;
  }

  const deeplKey = process.env.DEEPL_API_KEY;
  if (deeplKey === undefined || deeplKey === "") {
    console.error("DEEPL_API_KEY missing - add it to .env.local.");
    process.exitCode = 1;
    return;
  }
  const translator = new deepl.Translator(deeplKey);

  for (const target of TARGETS) {
    const items = plan.filter((p) => p.target === target.folder);
    for (const item of items) {
      const file = `${item.ns}.json`;
      let translated: string[];
      try {
        translated = await translateBatchDeepl(translator, item.texts, target.deepl);
      } catch (error) {
        console.error(
          `[${target.folder}] ${item.ns} failed:`,
          error instanceof Error ? error.message : error,
        );
        continue;
      }

      const targetPath = resolve(localesDir, target.folder, file);
      const merged: Record<string, string> = { ...flatten(loadJson(targetPath)) };
      item.keys.forEach((key, i) => {
        const value = translated[i];
        if (value !== undefined && value !== "") merged[key] = value;
      });
      saveJson(targetPath, unflatten(merged));
    }
  }

  console.log("\nTranslation complete.");
};

void main();
