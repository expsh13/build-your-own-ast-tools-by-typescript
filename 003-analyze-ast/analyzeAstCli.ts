#!/usr/bin/env node

// Node.jsのモジュールをインポート
import fs from "node:fs/promises";
import path from "node:path";
// カスタムコンソールモジュールをインポート
import { debug, error, info } from "./console.ts";
import { createAst } from "./createAst.ts";
import { traverseAst } from "./traverseAst.ts";

console.log("Welcome to the Analyze AST CLI!");

const helpMessage = "Usage: analyze-ast-cli <file-path> [--debug]";

// コマンドの引数を取得(0番目はnodeの実行パス、1番目はスクリプトのパスなので省く)
const args = process.argv.slice(2);
// 引数が不足している場合はヘルプメッセージを表示
if (args.length === 0) {
  info(helpMessage);
  process.exit(1);
}

let [inputFilePath, ...restArgs] = args;
// コマンドの1つ目の引数に、入力ファイルパスが指定されていない場合はエラーにする
if (!inputFilePath || inputFilePath.startsWith("--")) {
  error("Input file path is required");
  info(helpMessage);
  process.exit(1);
}

for (let i = 0; i < restArgs.length; i++) {
  const arg = restArgs[i];

  if (arg === "--debug") {
    // --debugオプションが指定された場合、デバッグモードを有効にする
    process.env.DEBUG = "true";
  } else {
    error(`Unknown argument: ${arg}`);
    process.exit(1);
  }
}

// 入力ファイルを読み込む
try {
  const absoluteInputPath = path.resolve(inputFilePath);
  const data = (await fs.readFile(absoluteInputPath)).toString();

  debug(`Input file path: ${absoluteInputPath}`);
  debug(`Input file content:\n${data}`);

  const ast = await createAst(absoluteInputPath);

  // AST を走査して情報を出力する
  traverseAst(ast);
} catch (err) {
  if (err instanceof Error) {
    error(err.message);
  } else {
    error("An unknown error occurred");
  }
  process.exit(1);
}
