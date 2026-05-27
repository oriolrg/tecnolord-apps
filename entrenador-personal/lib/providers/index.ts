import type { ImportedActivityRecord } from "@/lib/domain/types/training";
import type { ParseActivityInput } from "@/lib/providers/activity-provider";
import { CsvActivityProvider } from "@/lib/providers/csv-provider";
import { GpxActivityProvider } from "@/lib/providers/gpx-provider";
import { JsonActivityProvider } from "@/lib/providers/json-provider";

const providers = [new JsonActivityProvider(), new CsvActivityProvider(), new GpxActivityProvider()];

export function parseImportedActivities(input: ParseActivityInput): ImportedActivityRecord[] {
  const provider = providers.find((candidate) => candidate.supports(input.filename ?? ""));
  if (!provider) {
    throw new Error("Unsupported format. FIT can be added later behind the same ActivityProvider interface.");
  }

  return provider.parse(input);
}
