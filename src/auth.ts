import * as vscode from 'vscode';

  const SECRET_KEY = 'sentop.apiKey';

  export async function storeApiKey(context: vscode.ExtensionContext, key: string): Promise<void> {
    await context.secrets.store(SECRET_KEY, key);
  }

  export async function getApiKey(context: vscode.ExtensionContext): Promise<string | undefined> {
    return await context.secrets.get(SECRET_KEY);
  }

  export async function clearApiKey(context: vscode.ExtensionContext): Promise<void> {
    await context.secrets.delete(SECRET_KEY);
  }
  