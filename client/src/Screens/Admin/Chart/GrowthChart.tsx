import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

interface GrowthChartData {
  month: string;
  publishedAt: number;
}

interface GrowthChartProps {
  data: GrowthChartData[];
}

const GrowthChart: React.FC<GrowthChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef && chartRef.current) {
      if (chartInstance.current !== null) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels: data?.map((item) => item.month),
            datasets: [
              {
                label: "ยอดการโพสต์ทั้งหมด",
                data: data?.map((item) => item.publishedAt),
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 2,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      }
    }
  }, [data]);

  return <canvas ref={chartRef} style={{ height: "120px" }} />;
};

export default GrowthChart;
