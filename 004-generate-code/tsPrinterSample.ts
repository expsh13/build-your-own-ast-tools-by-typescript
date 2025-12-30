// TypeScript Compiler APIをインポート
// このAPIを使用してプログラマティックにTypeScriptのASTを操作できます
import * as ts from "typescript";

// ts.factoryはASTノードを作成するためのファクトリーオブジェクト
// 頻繁に使用するため、短い変数名に代入しています
const f = ts.factory;

// const greeting: string = "Hello, World!"; というコードを表すASTを作成します
const ast = f.createVariableStatement(
  undefined, // モディファイア（export, declareなど）なし
  f.createVariableDeclarationList(
    [
      f.createVariableDeclaration(
        "greeting", // 変数名
        undefined, // 型注釈の前の感嘆符（!）なし
        f.createKeywordTypeNode(ts.SyntaxKind.StringKeyword), // 型: string
        f.createStringLiteral("Hello, World!") // 初期値: "Hello, World!"
      ),
    ],
    ts.NodeFlags.Const // const宣言を指定
  )
);

// ASTをTypeScriptコードに変換するためのプリンターを作成します
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

// プリンターが参照するためのダミーのSourceFileを作成
// 実際のファイルではなく、プリンターが必要とするコンテキスト情報を提供します
const source = ts.createSourceFile("sample.ts", "", ts.ScriptTarget.Latest);

// ASTノードを実際のTypeScriptコード（文字列）に変換
const code = printer.printNode(ts.EmitHint.Unspecified, ast, source);

// 生成されたコードを出力（結果: const greeting: string = "Hello, World!";）
console.log(code);
