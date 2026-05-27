export function safeParseJson<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    throw new Error(`JSON invalid: ${(error as Error).message}`);
  }
}
