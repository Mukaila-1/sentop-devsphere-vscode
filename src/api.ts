import * as vscode from 'vscode';

  function getBaseUrl(): string {
    const config = vscode.workspace.getConfiguration('sentop');
    return (config.get<string>('apiBaseUrl') || 'https://sentop.tech').replace(/\/$/g, '');
  }

  async function request<T>(
    apiKey: string,
    path: string,
    options: { method?: string; body?: unknown } = {}
  ): Promise<T> {
    const res = await fetch(`${getBaseUrl()}${path}`, {
      method: options.method || 'GET',
      headers: {
        'X-Sentop-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error((err as any).error || res.statusText);
    }
    return res.json() as Promise<T>;
  }

  export interface SentopUser {
    id: string;
    username: string;
    email: string;
    plan: string;
    credits: number;
  }

  export interface SentopProject {
    id: string;
    name: string;
    description?: string;
    language: string;
  }

  export interface SentopFile {
    id: string;
    name: string;
    path: string;
    content: string;
    language: string;
  }

  export async function getMe(apiKey: string): Promise<SentopUser> {
    return request<SentopUser>(apiKey, '/api/vscode/me');
  }

  export async function getCredits(apiKey: string): Promise<{ credits: number; plan: string }> {
    return request(apiKey, '/api/vscode/credits');
  }

  export async function getProjects(apiKey: string): Promise<SentopProject[]> {
    return request<SentopProject[]>(apiKey, '/api/vscode/projects');
  }

  export async function getProjectFiles(apiKey: string, projectId: string): Promise<SentopFile[]> {
    return request<SentopFile[]>(apiKey, `/api/vscode/projects/${projectId}/files`);
  }

  export async function generateCode(
    apiKey: string,
    prompt: string,
    fileName: string,
    currentCode: string,
    language: string
  ): Promise<{ code: string; explanation: string; creditsUsed: number }> {
    return request(apiKey, '/api/vscode/ai/generate', {
      method: 'POST',
      body: { prompt, fileName, currentCode, language },
    });
  }
  