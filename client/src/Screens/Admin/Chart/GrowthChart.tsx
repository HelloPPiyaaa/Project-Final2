import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

interface GrowthChartProps {
  data: any[]; // This should be an array of blog objects
}

interface BlogCountByMonth {
  month: string;
  blogCount: number;
}

function transformBlogData(blogs: any[]): BlogCountByMonth[] {
  const monthCount: { [key: string]: number } = {};

  // Check if blogs is defined and is an array
  if (blogs && Array.isArray(blogs)) {
    blogs.forEach((blog) => {
      const date = new Date(blog.publishedAt);
      const monthYear = date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      // Increment the count for the corresponding month
      monthCount[monthYear] = (monthCount[monthYear] || 0) + 1;
    });
  }

  // Create an array of the last 7 months
  const emptyMonths: BlogCountByMonth[] = Array.from({ length: 7 }, (_, i) => {
    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() - i);
    const monthYear = monthDate.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    return { month: monthYear, blogCount: monthCount[monthYear] || 0 };
  });

  return emptyMonths.reverse(); // Reverse to have the most recent months first
}

const GrowthChart: React.FC<GrowthChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [charts, setCharts] = useState<BlogCountByMonth[]>([]); // Initialize with an empty array

  useEffect(() => {
    const transformedData = transformBlogData(data);
    setCharts(transformedData);
  }, [data]); // Use data as a dependency to update charts when data changes

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels: charts.map((item) => item.month), // Map month labels
            datasets: [
              {
                label: "ยอดการโพสต์ทั้งหมด", // Total posts
                data: charts.map((item) => item.blogCount), // Map blog counts
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 2,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  display: false,
                },
              },
              x: {
                grid: {
                  display: false,
                },
              },
            },
          },
        });
      }
    }
  }, [charts]); // Update chart when charts data changes

  return <canvas ref={chartRef} style={{ height: "120px" }} />;
};

export default GrowthChart;
