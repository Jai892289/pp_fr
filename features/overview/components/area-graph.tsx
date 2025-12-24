"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useSurveyDashboard } from "@/context/SurveyDashboardContext";

export function AreaGraph() {
  const { chartData, loading } = useSurveyDashboard();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Area Chart...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const areaData = chartData?.areaChartData || [];

  const chartConfig = {
    count: { label: "Surveys", color: "var(--primary)" },
  } satisfies ChartConfig;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Survey Trends</CardTitle>
        <CardDescription>Daily survey counts over time</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="h-full min-h-[250px] w-full"
        >
          <AreaChart data={areaData} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id="fillSurvey" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-count)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-count)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />

            <Area
              dataKey="count"
              type="monotone"
              fill="url(#fillSurvey)"
              stroke="var(--color-count)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
