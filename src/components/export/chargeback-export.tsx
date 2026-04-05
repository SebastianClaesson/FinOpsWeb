"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GroupedCost } from "@/lib/data/cost-data";
import { formatCurrency } from "@/lib/utils/format";
import { branding } from "@/lib/config/branding";

interface ChargebackExportProps {
  bySubscription: GroupedCost[];
  byResourceGroup: GroupedCost[];
  dateRange: { start: string; end: string };
  currency: string;
}

function buildTableHTML(
  title: string,
  data: GroupedCost[],
  currency: string
): string {
  const totalEffective = data.reduce((s, r) => s + r.effectiveCost, 0);

  const rows = data
    .map((r) => {
      const pct = totalEffective > 0 ? (r.effectiveCost / totalEffective) * 100 : 0;
      return `<tr>
        <td>${r.name}</td>
        <td style="text-align:right">${formatCurrency(r.effectiveCost, currency)}</td>
        <td style="text-align:right">${formatCurrency(r.billedCost, currency)}</td>
        <td style="text-align:right">${formatCurrency(r.savings, currency)}</td>
        <td style="text-align:right">${pct.toFixed(1)}%</td>
      </tr>`;
    })
    .join("\n");

  return `
    <h2 style="margin-top:24px;margin-bottom:8px;font-size:14px;font-weight:600;">${title}</h2>
    <table>
      <thead>
        <tr>
          <th style="text-align:left">Name</th>
          <th style="text-align:right">Effective Cost</th>
          <th style="text-align:right">Billed Cost</th>
          <th style="text-align:right">Savings</th>
          <th style="text-align:right">% of Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

export function ChargebackExport({
  bySubscription,
  byResourceGroup,
  dateRange,
  currency,
}: ChargebackExportProps) {
  const handleExport = () => {
    const now = new Date().toLocaleString();
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Chargeback Report</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1a1a1a; padding: 32px; font-size: 12px; }
  h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
  .subtitle { font-size: 13px; color: #555; margin-bottom: 4px; }
  .date-range { font-size: 12px; color: #777; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px; }
  th, td { border: 1px solid #d0d0d0; padding: 5px 8px; }
  th { background: #f5f5f5; font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 0.03em; }
  tr:nth-child(even) { background: #fafafa; }
  .footer { margin-top: 24px; font-size: 10px; color: #999; border-top: 1px solid #e0e0e0; padding-top: 8px; }
  @media print { body { padding: 16px; } }
</style></head><body>
  <h1>${branding.companyName}</h1>
  <div class="subtitle">Chargeback Report</div>
  <div class="date-range">${dateRange.start} to ${dateRange.end} &middot; ${currency}</div>

  ${buildTableHTML("Cost by Subscription", bySubscription, currency)}
  ${buildTableHTML("Cost by Resource Group", byResourceGroup, currency)}

  <div class="footer">Generated on ${now} by ${branding.productName}</div>
</body></html>`;

    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
      newWindow.focus();
      newWindow.print();
    }
  };

  return (
    <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleExport}>
      <Printer className="h-3.5 w-3.5" />
      Export PDF
    </Button>
  );
}
