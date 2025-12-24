import { SurveyDashboardProvider } from "@/context/SurveyDashboardContext";
import OverViewLayout from "./overview/layout";
import AreaStats from "./overview/@area_stats/page";
import BarStats from "./overview/@bar_stats/page";
import PieStats from "./overview/@pie_stats/page";
import HourlyStats from "./overview/@hourly_stats/page";

export default function DashboardPage() {
  return (
    <SurveyDashboardProvider>
      <OverViewLayout
        area_stats={<AreaStats />}
        bar_stats={<BarStats />}
        pie_stats={<PieStats />}
        hourly_stats={<HourlyStats />}
        sales={<div>Sales Chart Coming Soon...</div>}
      />
    </SurveyDashboardProvider>
  );
}
