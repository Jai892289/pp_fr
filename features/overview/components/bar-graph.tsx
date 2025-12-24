// "use client";

// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
// import { useSurveyDashboard } from "@/context/SurveyDashboardContext"; // <-- your context file

// const BarGraph = () => {
//    const { chartData, loading } = useSurveyDashboard();

//   // Use only barChart data
//   const barData = chartData?.barChart || [];

//   return (
//     <div className="w-full h-120 p-4 bg-white rounded-2xl shadow">
//   <h2 className="text-lg font-semibold mb-3">User Survey Count</h2>
//   <ResponsiveContainer width="100%" height="100%">
//     <BarChart data={barData} barSize={55} barCategoryGap="15%">
//       <CartesianGrid strokeDasharray="3 3" />
//       <XAxis
//         dataKey="fullName"
//         label={{ value: "User Name", position: "insideBottom", offset: -5 }}
//       />
//       <YAxis
//         label={{ value: "Count", angle: -90, position: "insideLeft" }}
//       />
//       <Tooltip />
//       <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
//     </BarChart>
//   </ResponsiveContainer>
// </div>

//   );
// };

// export default BarGraph;



"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useSurveyDashboard } from "@/context/SurveyDashboardContext";

const BarGraph = () => {
  const { chartData, loading } = useSurveyDashboard();

  // Get actual bar data
  const barData = chartData?.barChart || [];

  // Create placeholder if empty
  const displayData =
    barData.length > 0
      ? barData
      : [{ fullName: "No Data", count: 0 }]; // still draws axes/grid

  return (
    <div className="w-full h-full min-h-[250px] p-4 bg-white rounded-2xl shadow flex flex-col">
      <h2 className="text-lg font-semibold mb-3">User Survey Count</h2>

      <div className="flex-1 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData} barSize={55} barCategoryGap="15%">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="fullName"
              label={{
                value: "User Name",
                position: "insideBottom",
                offset: -5,
              }}
            />
            <YAxis
              label={{
                value: "Count",
                angle: -90,
                position: "insideLeft",
              }}
              allowDecimals={false}
            />
            <Tooltip />
            <Bar
              dataKey="count"
              fill="#2563eb"
              radius={[6, 6, 0, 0]}
              isAnimationActive={barData.length > 0}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Overlay 'No Data' message */}
        {barData.length === 0 && !loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-500 text-sm font-medium">No Data Available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarGraph;

