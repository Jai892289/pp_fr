"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { getChartData } from "@/apicalls/dashboardSetup";
import { io, Socket } from "socket.io-client";

// 🧠 1️⃣ Define the TypeScript interfaces for data
interface AreaChartData {
  date: string;
  count: number;
}

interface HourlyVariationData {
  hour: number;
  total: number;
}

interface BarChartData {
  user_id: number;
  count: number;
  fullName: string;
}

interface PieChartData {
  untaggedCount: number;
  totalSurveyCount: number;
  totalConsumerCount: number;
}

interface SurveyChartResponse {
  areaChartData: AreaChartData[];
  barChart: BarChartData[];
  pieChartData: PieChartData;
  hourlyVariation?: HourlyVariationData[];
}

interface SurveyDashboardContextType {
  chartData: SurveyChartResponse | null;
  loading: boolean;
  refreshData: () => Promise<void>;
}

// 🧠 2️⃣ Create the context
const SurveyDashboardContext = createContext<
  SurveyDashboardContextType | undefined
>(undefined);

// 🧠 3️⃣ Create the provider
export const SurveyDashboardProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [chartData, setChartData] = useState<SurveyChartResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchChartData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getChartData();
      if (response?.data) {
        setChartData(response.data);
      }
    } catch (error) {
      console.error("Error fetching survey dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  useEffect(() => {
    const socket: Socket = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
      transports: ["websocket"], // force WebSocket transport
    });

    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
    });

    socket.on("CHART_UPDATE", (chartData) => {
      console.log("📊 CHART_UPDATE received:", chartData);
      setChartData(chartData.data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SurveyDashboardContext.Provider
      value={{ chartData, loading, refreshData: fetchChartData }}
    >
      {children}
    </SurveyDashboardContext.Provider>
  );
};

// 🧠 4️⃣ Create a helper hook for easy use
export const useSurveyDashboard = () => {
  const context = useContext(SurveyDashboardContext);
  if (!context) {
    throw new Error(
      "useSurveyDashboard must be used within SurveyDashboardProvider"
    );
  }
  return context;
};
