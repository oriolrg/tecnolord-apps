import type { ImportedActivityRecord } from "@/lib/domain/types/training";

export interface ParseActivityInput {
  content: string;
  filename?: string;
}

export interface ActivityProvider {
  providerType: string;
  supports(filename: string): boolean;
  parse(input: ParseActivityInput): ImportedActivityRecord[];
}
