import { SectionHeader } from "@/components/opos/section-header";
import { Card } from "@/components/ui/card";
import { getRecommendations } from "@/lib/opos/repository";

export default async function OposRecommendationsPage() {
  const recommendations = await getRecommendations();

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Recomanador"
        title="Que repassar ara"
        description="Les recomanacions son explicables: indiquen si el problema es una mostra escassa, un percentatge baix o una confiança insuficient."
      />
      <div className="grid gap-4">
        {recommendations.map((item) => (
          <Card key={item.title}>
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="mt-3 text-sm text-slate-600">{item.reason}</p>
            <p className="mt-3 text-sm font-semibold text-pine">{item.action}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
