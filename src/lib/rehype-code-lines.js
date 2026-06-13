import { visit } from "unist-util-visit";

export default function rehypeCodeLines() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "code") return;
      const classes = node.properties?.className;
      if (!classes || !Array.isArray(classes)) return;
      if (!classes.some((c) => c === "hljs" || c.startsWith("hljs-"))) return;
      if (!node.children || node.children.length === 0) return;
      const firstChild = node.children[0];
      if (firstChild.type !== "text") return;
      const text = firstChild.value;
      const lines = text.split("\n");
      if (lines.length > 1 && lines[lines.length - 1] === "") {
        lines.pop();
      }
      node.children = lines.map((line) => ({
        type: "element",
        tagName: "span",
        properties: { className: ["code-line"] },
        children: [{ type: "text", value: line || " " }],
      }));
    });
  };
}
