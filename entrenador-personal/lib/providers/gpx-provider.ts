import type { ImportedActivityRecord } from "@/lib/domain/types/training";
import type { ActivityProvider, ParseActivityInput } from "@/lib/providers/activity-provider";

export class GpxActivityProvider implements ActivityProvider {
  providerType = "gpx";

  supports(filename: string) {
    return filename.toLowerCase().endsWith(".gpx");
  }

  parse({ content }: ParseActivityInput): ImportedActivityRecord[] {
    const timeMatches = [...content.matchAll(/<time>(.*?)<\/time>/g)];
    const start = timeMatches[0]?.[1] ?? new Date().toISOString();
    const end = timeMatches.at(-1)?.[1] ?? start;
    const durationMin = Math.max(
      1,
      Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000)
    );

    return [
      {
        provider: "gpx",
        date: start.slice(0, 10),
        activityType: "outdoor",
        durationMin,
        rawPayload: {
          start,
          end
        }
      }
    ];
  }
}
