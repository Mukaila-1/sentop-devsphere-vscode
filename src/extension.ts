import * as vscode from 'vscode';
import { storeApiKey, getApiKey, clearApiKey } from './auth';
import { getMe, getCredits, getProjects, getProjectFiles, generateCode } from './api';

let statusBarItem: vscode.StatusBarItem;

export async function activate(context: vscode.ExtensionContext) {
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'sentop.viewCredits';
  statusBarItem.tooltip = 'Sentop DevSphere — click to view credit balance';
  context.subscriptions.push(statusBarItem);
  await refreshStatusBar(context);

  // Sign In
  context.subscriptions.push(vscode.commands.registerCommand('sentop.signIn', async () => {
    const key = await vscode.window.showInputBox({
      prompt: 'Paste your Sentop DevSphere API key',
      placeHolder: 'sdvs_••••••••••••••••••••••••••••••••••••••••••••',
      password: true,
      ignoreFocusOut: true,
      validateInput: (v) => v.startsWith('sdvs_') ? null : 'Key must start with sdvs_',
    });
    if (!key) { return; }
    try {
      const user = await getMe(key);
      await storeApiKey(context, key);
      await refreshStatusBar(context);
      vscode.window.showInformationMessage(
        'Sentop DevSphere: Signed in as ' + user.email + ' — ' + user.credits + ' credits (Plan: ' + user.plan + ')'
      );
    } catch (err: any) {
      vscode.window.showErrorMessage('Sign in failed: ' + err.message);
    }
  }));

  // Sign Out
  context.subscriptions.push(vscode.commands.registerCommand('sentop.signOut', async () => {
    await clearApiKey(context);
    statusBarItem.hide();
    vscode.window.showInformationMessage('Sentop DevSphere: Signed out.');
  }));

  // Generate AI Code
  context.subscriptions.push(vscode.commands.registerCommand('sentop.generateCode', async () => {
    const apiKey = await getApiKey(context);
    if (!apiKey) {
      const action = await vscode.window.showWarningMessage('Not signed in to Sentop DevSphere.', 'Sign In');
      if (action === 'Sign In') { await vscode.commands.executeCommand('sentop.signIn'); }
      return;
    }
    const editor = vscode.window.activeTextEditor;
    const prompt = await vscode.window.showInputBox({
      prompt: 'What would you like Alex to do?',
      placeHolder: 'e.g. Add input validation, refactor this function, add error handling...',
      ignoreFocusOut: true,
    });
    if (!prompt) { return; }
    const fileName = editor?.document.fileName.split('/').pop() || 'untitled';
    const currentCode = editor?.document.getText() || '';
    const language = editor?.document.languageId || 'javascript';
    await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: 'Alex is generating code...', cancellable: false },
      async () => {
        try {
          const result = await generateCode(apiKey, prompt, fileName, currentCode, language);
          if (editor && result.code) {
            const edit = new vscode.WorkspaceEdit();
            const fullRange = new vscode.Range(
              editor.document.positionAt(0),
              editor.document.positionAt(editor.document.getText().length)
            );
            edit.replace(editor.document.uri, fullRange, result.code);
            await vscode.workspace.applyEdit(edit);
          }
          vscode.window.showInformationMessage('Alex: ' + result.explanation + ' (−' + result.creditsUsed + ' credits)');
          await refreshStatusBar(context);
        } catch (err: any) {
          vscode.window.showErrorMessage('Generation failed: ' + err.message);
        }
      }
    );
  }));

  // View Credits
  context.subscriptions.push(vscode.commands.registerCommand('sentop.viewCredits', async () => {
    const apiKey = await getApiKey(context);
    if (!apiKey) { vscode.window.showWarningMessage('Not signed in to Sentop DevSphere.'); return; }
    try {
      const data = await getCredits(apiKey);
      vscode.window.showInformationMessage('Sentop DevSphere: ' + data.credits + ' credits remaining — Plan: ' + data.plan);
    } catch (err: any) {
      vscode.window.showErrorMessage('Failed to fetch credits: ' + err.message);
    }
  }));

  // Open Project
  context.subscriptions.push(vscode.commands.registerCommand('sentop.openProject', async () => {
    const apiKey = await getApiKey(context);
    if (!apiKey) { vscode.window.showWarningMessage('Not signed in to Sentop DevSphere.'); return; }
    try {
      const projects = await getProjects(apiKey);
      if (projects.length === 0) { vscode.window.showInformationMessage('No projects found on Sentop DevSphere.'); return; }
      const picked = await vscode.window.showQuickPick(
        projects.map(p => ({ label: p.name, description: p.language, detail: p.description || '', id: p.id })),
        { placeHolder: 'Select a Sentop DevSphere project to open' }
      );
      if (!picked) { return; }
      const files = await getProjectFiles(apiKey, picked.id);
      if (files.length === 0) { vscode.window.showInformationMessage('This project has no files yet.'); return; }
      const filePicked = await vscode.window.showQuickPick(
        files.map(f => ({ label: f.name, description: f.language, detail: f.path, content: f.content })),
        { placeHolder: 'Select a file to open' }
      );
      if (!filePicked) { return; }
      const doc = await vscode.workspace.openTextDocument({ content: filePicked.content, language: filePicked.description });
      await vscode.window.showTextDocument(doc);
    } catch (err: any) {
      vscode.window.showErrorMessage('Failed to load projects: ' + err.message);
    }
  }));

  // Deploy
  context.subscriptions.push(vscode.commands.registerCommand('sentop.deploy', async () => {
    const apiKey = await getApiKey(context);
    if (!apiKey) { vscode.window.showWarningMessage('Not signed in to Sentop DevSphere.'); return; }
    vscode.window.showInformationMessage('Deployment from VS Code is coming in v0.2.0. Visit sentop.tech to deploy your project.');
  }));
}

async function refreshStatusBar(context: vscode.ExtensionContext) {
  const apiKey = await getApiKey(context);
  if (!apiKey) { statusBarItem.hide(); return; }
  try {
    const data = await getCredits(apiKey);
    statusBarItem.text = '$(zap) ' + data.credits + ' credits';
    statusBarItem.show();
  } catch {
    statusBarItem.hide();
  }
}

export function deactivate() {}