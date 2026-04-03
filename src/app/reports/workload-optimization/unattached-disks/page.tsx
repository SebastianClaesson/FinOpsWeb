"use client";

import { ComingSoon } from "@/components/reports/coming-soon";

export default function UnattachedDisksPage() {
  return (
    <ComingSoon
      title="Unattached Disks"
      description="Requires Azure Resource Graph and Azure Advisor integration."
    />
  );
}
