import { DaySessionClient } from "@/components/calendar/day-session-client";
import { trainingPlan } from "@/lib/data/mock-plan";

export default function DayPage({ params }: { params: { date: string } }) {
  const fallbackSession = trainingPlan.days.find((item) => item.date === params.date);
  return <DaySessionClient date={params.date} fallbackSession={fallbackSession} />;
}
