"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <Construction className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="max-w-md text-center text-sm text-muted-foreground">
          {description ??
            "This report is under development. It requires additional data sources that will be available in a future release."}
        </p>
      </CardContent>
    </Card>
  );
}
