import type { ImportedActivityRecord } from "@/lib/domain/types/training";
import type { ActivityProvider, ParseActivityInput } from "@/lib/providers/activity-provider";

export class JsonActivityProvider implements ActivityProvider {
  providerType = "json";

  supports(filename: string) {
    return filename.toLowerCase().endsWith(".json");
  }

  parse({ content }: ParseActivityInput): ImportedActivityRecord[] {
    const parsed = JSON.parse(content) as ImportedActivityRecord | ImportedActivityRecord[];
    return Array.isArray(parsed) ? parsed : [parsed];
  }
}
