import * as vscode from "vscode";

function findTrail(
  symbols: vscode.DocumentSymbol[],
  pos: vscode.Position
): string[] {
  //find trail
  for (const symbol of symbols) {
    if (symbol.range.contains(pos)) {
      const childTrail = findTrail(symbol.children, pos);
      return [symbol.name, ...childTrail];
    }
  }
  return [];
}

async function getSymbolTrail(): Promise<string> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return "";

  const position = editor.selection.active;

  //get all symbols
  const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
    "vscode.executeDocumentSymbolProvider",
    editor.document.uri
  );

  const trail = findTrail(symbols ?? [], position);

  return trail.join(".");
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "vs-code-translation-extension.copyJsonKey",
    async () => {
      const jsonPath = await getSymbolTrail();

      await vscode.env.clipboard.writeText(`"${jsonPath}"`);
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
