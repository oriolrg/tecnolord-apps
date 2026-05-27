import { headers } from "next/headers";
import { OposNav } from "@/components/opos/opos-nav";

export default function OposLayout({ children }: { children: React.ReactNode }) {
  const currentPath = headers().get("x-current-path") ?? "/opos";

  return (
    <div className="space-y-6">
      <OposNav currentPath={currentPath} />
      {children}
    </div>
  );
}
