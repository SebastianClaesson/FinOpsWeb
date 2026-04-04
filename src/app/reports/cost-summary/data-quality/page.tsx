"use client";

import { useMemo } from "react";
import { useReport } from "@/components/reports/report-context";
import { getFactUniqueValues } from "@/lib/data/fact-helpers";
import { formatNumber } from "@/lib/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function DataQualityPage() {
  const { filteredFacts, dataQuality } = useReport();

  const stats = useMemo(() => {
    const chargeCategories = getFactUniqueValues(filteredFacts, "ChargeCategory");
    const pricingCategories = getFactUniqueValues(filteredFacts, "PricingCategory");
    const services = getFactUniqueValues(filteredFacts, "ServiceName");
    const regions = getFactUniqueValues(filteredFacts, "RegionName");
    const currencies = [...new Set(filteredFacts.map((r) => r.BillingCurrency).filter(Boolean))].sort();

    return {
      totalRecords: dataQuality.totalRecords,
      chargeCategories,
      pricingCategories,
      services,
      regions,
      currencies,
      checks: [
        {
          name: "Missing resource names",
          count: dataQuality.missingResourceName,
          ok: dataQuality.missingResourceName === 0,
        },
        {
          name: "Missing region",
          count: dataQuality.missingRegion,
          ok: dataQuality.missingRegion === 0,
        },
        {
          name: "Missing service name",
          count: dataQuality.missingService,
          ok: dataQuality.missingService === 0,
        },
        {
          name: "Negative cost records",
          count: dataQuality.negativeCost,
          ok: dataQuality.negativeCost === 0,
        },
        {
          name: "Zero cost records",
          count: dataQuality.zeroCost,
          ok: true,
        },
      ],
    };
  }, [filteredFacts, dataQuality]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(stats.totalRecords)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.services.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Regions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.regions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Currencies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.currencies.join(", ")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality checks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Quality Checks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.checks.map((check) => (
            <div
              key={check.name}
              className="flex items-center justify-between rounded-md border px-4 py-3"
            >
              <div className="flex items-center gap-3">
                {check.ok ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
                <span className="text-sm font-medium">{check.name}</span>
              </div>
              <Badge variant={check.ok ? "outline" : "secondary"}>
                {formatNumber(check.count)} records
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dimension values */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Charge Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.chargeCategories.map((c) => (
                <Badge key={c} variant="outline">
                  {c}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.pricingCategories.map((c) => (
                <Badge key={c} variant="outline">
                  {c}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.services.map((s) => (
                <Badge key={s} variant="outline">
                  {s}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Regions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.regions.map((r) => (
                <Badge key={r} variant="outline">
                  {r}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
