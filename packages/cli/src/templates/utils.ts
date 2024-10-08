import { Collection, ImportDeclaration, JSCodeshift } from "jscodeshift";

export const appendImport = (
  j: JSCodeshift,
  root: Collection<unknown>,
  newImport: ImportDeclaration
) => {
  // Find the last import declaration in the file
  const lastImport = root.find(j.ImportDeclaration).at(-1);

  // If there are import declarations, add the new import after the last one
  if (lastImport.size() > 0) {
    lastImport.insertAfter(newImport);
  } else {
    // If there are no import declarations, add the new import at the beginning
    root.get().node.program.body.unshift(newImport);
  }
};

export const addImport = (
  j: JSCodeshift,
  root: Collection<unknown>,
  imports: string[],
  from: string
) => {
  const newImport = j.importDeclaration(
    imports.map((i) => j.importSpecifier(j.identifier(i))),
    j.literal(from)
  );

  appendImport(j, root, newImport);
};

export const addGlobal = (
  j: JSCodeshift,
  root: Collection<unknown>,
  code: string
) => {
  root.find(j.ImportDeclaration).at(-1).insertAfter(code);
};

export const wrapReactComponentChildren = (
  j: JSCodeshift,
  root: Collection<unknown>,
  componentName: string,
  wrapperName: string,
  props: Record<string, { type: "expression" | "value"; value: string }> = {}
) => {
  root.findJSXElements(componentName).forEach((el) => {
    const newElement = j.jsxElement(
      j.jsxOpeningElement(
        j.jsxIdentifier(wrapperName),
        Object.entries(props).map(([k, { type, value }]) =>
          j.jsxAttribute(
            j.jsxIdentifier(k),
            type === "expression"
              ? j.jsxExpressionContainer(j.identifier(value))
              : j.stringLiteral(value)
          )
        )
      ),
      j.jsxClosingElement(j.jsxIdentifier(wrapperName)),
      [j.jsxText("\n"), el.node, j.jsxText("\n")]
    );

    el.replace(newElement);
  });
};
