'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useSurveyDashboard } from "@/context/SurveyDashboardContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';

const COLORS = ['#22c55e', '#f59e0b']; // Completed: green, Pending: orange

export function PieGraph() {
  const { chartData, loading } = useSurveyDashboard();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Pie Chart...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const pieChartData = chartData?.pieChartData || {
    untaggedCount: 0,
    totalSurveyCount: 0,
    totalConsumerCount: 0
  };

  // Prepare the data: Completed vs Pending
  const data = [
    { name: 'Completed', value: pieChartData.totalSurveyCount },
    { name: 'Pending', value: pieChartData.totalConsumerCount - pieChartData.totalSurveyCount }
  ];

  const total = pieChartData.totalConsumerCount || 0;
  const completedPercent =
    total > 0 ? ((pieChartData.totalSurveyCount / total) * 100).toFixed(1) : '0.0';
  const pendingPercent =
    total > 0
      ? (((total - pieChartData.totalSurveyCount) / total) * 100).toFixed(1)
      : '0.0';

  return (
    <Card className="w-full max-w-md mx-auto mb-4">
      <CardHeader className="pb-2">
        <CardTitle>Survey Completion</CardTitle>
        <CardDescription>Completed vs Pending Surveys</CardDescription>
      </CardHeader>

      {/* ✅ Labels displayed above the chart */}
      <div className="flex justify-center gap-6 mt-2 mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: COLORS[0] }}
          ></div>
          <span className="text-sm font-medium text-gray-700">
            Completed <span className="text-gray-500">({completedPercent}%)</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: COLORS[1] }}
          ></div>
          <span className="text-sm font-medium text-gray-700">
            Pending <span className="text-gray-500">({pendingPercent}%)</span>
          </span>
        </div>
      </div>

      {/* ✅ Pie chart with no text labels */}
      <CardContent className="flex justify-center items-center">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              labelLine={false}
              label={false} // 👈 removes labels from the pie
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => value.toLocaleString()}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>

      {/* ✅ Summary below */}
      <div className="text-center pb-4">
        <p className="text-sm text-muted-foreground">
          Total Consumers:{" "}
          <span className="font-semibold">{total.toLocaleString()}</span>
        </p>
      </div>
    </Card>
  );
}
