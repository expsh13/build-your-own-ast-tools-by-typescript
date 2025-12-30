#!/usr/bin/env node

// Node.jsのモジュールをインポートします
import fs from "node:fs/promises";
import path from "node:path";
// カスタムコンソールモジュールをインポートします
import { debug, error, info } from "./console.ts";
import { createAst } from "./createAst.ts";
import { createSourceFromAst } from "./createSourceFromAst.ts";
import { fixAst } from "./fixAst.ts";

// configの型を定義します
export type Config = {
  "use-let-never-reassigned": "error" | "warn" | "off";
  "double-quotes": "error" | "warn" | "off";
};

console.log("Welcome to the Formatter CLI!");

const helpMessage =
  "Usage: formatter-cli <file-path> [--out <output-path>] [--debug]";

// コマンドの引数を取得(0番目はnodeの実行パス、1番目はスクリプトのパスなので省きます)
const args = process.argv.slice(2);
// 引数が不足している場合はヘルプメッセージを表示します
if (args.length === 0) {
  info(helpMessage);
  process.exit(1);
}

let [inputFilePath, ...restArgs] = args;
// コマンドの1つ目の引数に、入力ファイルパスが指定されていない場合はエラーにします
if (!inputFilePath || inputFilePath.startsWith("--")) {
  error("Input file path is required");
  info(helpMessage);
  process.exit(1);
}

let outputFilePath = "";
for (let i = 0; i < restArgs.length; i++) {
  const arg = restArgs[i];

  if (arg === "--out") {
    // --outオプションが指定された場合、次の引数を出力ファイルパスとして取得します
    // 次の引数がない、または次の引数がオプション形式(--で始まる)ならエラーにします
    if (i + 1 >= args.length || restArgs[i + 1].startsWith("--")) {
      error("--out requires a file path");
      process.exit(1);
    }
    outputFilePath = restArgs[++i];
  } else if (arg === "--debug") {
    // --debugオプションが指定された場合、デバッグモードを有効にします
    process.env.DEBUG = "true";
  } else {
    error(`Unknown argument: ${arg}`);
    process.exit(1);
  }
}

// コマンドが実行されたディレクトリにconfigファイルがない場合はエラーにします
const configFilePath = path.resolve("config.json");
const isConfigFileExists = await fs
  .access(configFilePath)
  .then(() => true)
  .catch(() => false);
if (!isConfigFileExists) {
  error("Config file not found: config.json");
  process.exit(1);
}

// 入力ファイルを読み込む
try {
  const absoluteInputPath = path.resolve(inputFilePath);
  const data = (await fs.readFile(absoluteInputPath)).toString();

  debug(`Input file path: ${absoluteInputPath}`);
  debug(`Input file content:\n${data}`);

  // configファイルを読み込みます
  const config: Config = JSON.parse(
    (await fs.readFile(configFilePath)).toString()
  );
  debug(`Config file content:\n${JSON.stringify(config, null, 2)}`);

  const ast = await createAst(absoluteInputPath);

  // AST を走査してルールを元に修正します
  const fixedAst = fixAst(ast, 0, config, ast);

  // AST をソースコードに変換し、ファイルに書き込みます
  const source = createSourceFromAst(fixedAst);
  if (outputFilePath) {
    const absoluteOutputPath = path.resolve(outputFilePath);
    await fs.writeFile(absoluteOutputPath, source);
    debug(`Output written to: ${absoluteOutputPath}`);
  } else {
    // 出力ファイルパスが指定されていない場合、コンソールに出力します
    info(`Formatted source:\n${source}`);
  }
} catch (err) {
  if (err instanceof Error) {
    error(err.message);
  } else {
    error("An unknown error occurred");
  }
  process.exit(1);
}
