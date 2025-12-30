import type { AstNode } from "./createAst.ts";
import { debug } from "./console.ts";

export function traverseAst(astNode: AstNode, depth = 0) {
  const indent = "  ".repeat(depth);
  debug(
    `${indent}Kind: ${astNode.kind}, Text: ${astNode.text
      .replaceAll("\n", " ")
      .slice(0, 20)}`
  );

  for (const child of astNode.children) {
    traverseAst(child, depth + 1);
  }
}
