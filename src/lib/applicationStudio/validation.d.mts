export class ServiceError extends Error { constructor(message: string, status?: number); status: number; }
export function limitedText(request: Request): Promise<string>;
export function vacancySourceMap(text: string): Record<string, string>;
export function sourceMap(cv: string, linkedin?: string): Record<string, string>;
export function validate(action: string, result: unknown, context: Record<string, unknown>, sources: Record<string, string>): unknown;
export function fetchPublic(url: string): Promise<{ text: string; url: string; retrievedAt: string }>;

export function extractVacancyText(html:string):string;
