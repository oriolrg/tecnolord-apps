import type { ImportedActivityRecord } from "@/lib/domain/types/training";
import type { ActivityProvider, ParseActivityInput } from "@/lib/providers/activity-provider";

export class CsvActivityProvider implements ActivityProvider {
  providerType = "csv";

  supports(filename: string) {
    return filename.toLowerCase().endsWith(".csv");
  }

  parse({ content, filename }: ParseActivityInput): ImportedActivityRecord[] {
    const [headerLine, ...rows] = content.trim().split(/\r?\n/);
    const headers = headerLine.split(",").map((item) => item.trim());

    return rows.filter(Boolean).map((row, index) => {
      const values = row.split(",").map((item) => item.trim());
      const record = Object.fromEntries(headers.map((header, i) => [header, values[i]]));

      return {
        provider: "csv",
        externalId: record.externalId ?? `${filename ?? "csv"}-${index}`,
        date: record.date,
        activityType: (record.activityType as ImportedActivityRecord["activityType"]) ?? "outdoor",
        durationMin: Number(record.durationMin ?? 0),
        distanceKm: toOptionalNumber(record.distanceKm),
        elevationGainM: toOptionalNumber(record.elevationGainM),
        avgPace: toOptionalNumber(record.avgPace),
        avgPower: toOptionalNumber(record.avgPower),
        avgHeartRate: toOptionalNumber(record.avgHeartRate),
        maxHeartRate: toOptionalNumber(record.maxHeartRate),
        calories: toOptionalNumber(record.calories),
        rawPayload: record
      };
    });
  }
}

function toOptionalNumber(value?: string) {
  return value ? Number(value) : undefined;
}
