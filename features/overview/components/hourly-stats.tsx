"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

export function HourlyGraph() {
    const { chartData, loading } = useSurveyDashboard();

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Loading Hourly Chart...</CardTitle>
                </CardHeader>
            </Card>
        );
    }

    const hourlyData = chartData?.hourlyVariation || [];

    // Convert hours to readable labels ("2 PM")
    const formattedData = hourlyData.map((d) => ({
        ...d,
        label: `${(d.hour % 12) || 12} ${d.hour < 12 ? "AM" : "PM"}`,
    }));

    const chartConfig = {
        total: { label: "Surveys", color: "var(--primary)" },
    } satisfies ChartConfig;

    return (
        <Card className="@container/card">
            <CardHeader>
                <CardTitle>Hourly QR Scan Report</CardTitle>
                <CardDescription>Survey activity across 24 hours</CardDescription>
            </CardHeader>

            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="h-full min-h-[250px] w-full"
                >
                    <BarChart data={formattedData} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            interval={0}
                            angle={-40}
                            textAnchor="end"
                            height={50}
                        />
                        <YAxis tickLine={false} axisLine={false} />

                        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />

                        <Bar
                            dataKey="total"
                            fill="var(--color-total)"
                            radius={[6, 6, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>

            <CardFooter></CardFooter>
        </Card>
    );
}
