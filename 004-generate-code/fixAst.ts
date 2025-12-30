import type { AstNode } from "./createAst.ts";
import type { Config } from "./formatterCli.ts";
import { debug, info } from "./console.ts";

/**
 * ASTノードを設定に基づいて修正する関数
 * @param astNode 修正対象のASTノード
 * @param depth 現在の深さ（デバッグ出力用）
 * @param config フォーマッタの設定
 * @param root ASTのルートノード（再代入検索用）
 * @returns 修正後のASTノード
 */
export function fixAst(
  astNode: AstNode,
  depth = 0,
  config: Config,
  root: AstNode
): AstNode {
  // デバッグ出力用のインデント文字列を生成
  const indent = "  ".repeat(depth);
  debug(
    `${indent}Kind: ${astNode.kind}, Text: ${astNode.text.replaceAll(
      "\n",
      " "
    )}`
  );

  // ルール1: use-let-never-reassigned
  // 再代入されない let 宣言を const に変換する
  if (config["use-let-never-reassigned"] !== "off") {
    // let で始まる変数宣言を検出する正規表現（インデントも考慮）
    const letHead = /^(\s*)let\b/;

    // 現在のノードが let による変数宣言リストかチェック
    if (
      astNode.kind === "VariableDeclarationList" &&
      letHead.test(astNode.text)
    ) {
      // 宣言に含まれる識別子名を抽出します
      // 例: "let x = 1" から "x" を抽出
      const identifiers = astNode.children
        .filter((c) => c.kind === "VariableDeclaration")
        .map(
          (v) =>
            v.children.find((n) => n.kind === "Identifier")?.text || "__dummy__"
        );

      // AST全体を走査して、これらの変数が後続で再代入されていないかチェック
      // 再代入が無ければ const に置換します
      if (isNeverReassigned(root, astNode, identifiers)) {
        // "let" を "const" に置き換え（インデントは保持）
        astNode.text = astNode.text.replace(letHead, "$1const");
        info("[use-let-never-reassigned] letをconstに置換しました");
      }
    }
  }

  // ルール2: double-quotes
  // ダブルクォートで囲まれた文字列リテラルをシングルクォートに変換する
  if (config["double-quotes"] !== "off") {
    if (astNode.kind === "StringLiteral") {
      const text = astNode.text.trim();
      // ダブルクォートで囲まれている文字列リテラルかチェック
      if (text.startsWith('"') && text.endsWith('"')) {
        // クォート記号を除いた本体を取り出し、シングルクォートをエスケープします
        // 例: "hello" → 'hello', "it's" → 'it\'s'
        const inner = text.slice(1, -1).replace(/'/g, "\\'");
        astNode.text = `'${inner}'`;

        info("[double-quotes] ダブルクオートをシングルクオートに修正しました");
      }
    }
  }

  // 子ノードを再帰的に処理
  // ASTは木構造なので、すべてのノードを訪問するために再帰的に処理します
  for (const child of astNode.children) {
    fixAst(child, depth + 1, config, root);
  }

  return astNode;
}

/**
 * let → const に変換して良いか判定するユーティリティ関数
 *
 * AST全体を走査して、指定された変数が再代入されているかをチェックします
 *
 * @param root ASTのルートノード（走査開始位置）
 * @param declNode 変数宣言ノード（このノード自身は検索対象外）
 * @param identifiers チェック対象の変数名の配列
 * @returns 再代入されていない場合はtrue、再代入されている場合はfalse
 */
function isNeverReassigned(
  root: AstNode,
  declNode: AstNode,
  identifiers: string[]
): boolean {
  /**
   * ASTを再帰的に走査して再代入を探す内部関数
   * @param node 現在のノード
   * @returns 再代入が見つかった場合はtrue
   */
  const walk = (node: AstNode): boolean => {
    // 変数宣言ノード自身は検索対象から除外（宣言は再代入ではない）
    if (node === declNode) return false;

    // `変数名 = ...` という BinaryExpression があれば再代入とみなします
    // 例: x = 10 のような代入式を検出
    if (
      node.kind === "BinaryExpression" &&
      node.children.length >= 1 &&
      node.children[0].kind === "Identifier" &&
      identifiers.includes(node.children[0].text)
    ) {
      return true; // 再代入が見つかった
    }

    // 子ノードを再帰的に探索（どれか一つでも再代入があればtrue）
    return node.children.some(walk);
  };

  // 再代入が見つからなければtrue（const に変換可能）
  return !walk(root);
}
