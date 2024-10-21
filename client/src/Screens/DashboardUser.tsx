import React, { useState } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { Card, CardContent, Typography, Grid } from "@mui/material"; // For cards
import { IoHeart } from "react-icons/io5";
import { FaCommentDots } from "react-icons/fa";

export default function DashboardUser() {
  const [timeRange, setTimeRange] = useState("Month"); // Default to months

  // Data for months and years
  const monthData = {
    xAxis: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย."], // Month labels in Thai
    series: [2, 5.5, 2, 8.5, 1.5, 5],
  };

  const yearData = {
    xAxis: [2562, 2563, 2564, 2565, 2566], // Thai years (พ.ศ.)
    series: [15, 15, 8, 18, 12],
  };

  // Update chart data based on selected time range
  const chartData = timeRange === "Month" ? monthData : yearData;

  return (
    <div className="dash-user">
      {/* Cards for Total Patients and Available Staff */}
      <Grid
        container
        spacing={3}
        justifyContent="center"
        style={{ padding: "20px 15%" }}
      >
        {/* Make cards span the full width (or close to it) */}
        <Grid item xs={12} sm={6} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                จำนวนการกดถูกใจทั้งหมด
              </Typography>
              <Typography variant="h4" component="h2">
                <span>
                  <IoHeart color="#fd464a" size={40} />{" "}
                  {/* Icon color and size */}
                </span>{" "}
                3,256
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                จำนวนการแสดงความคิดเห็นทั้งหมด
              </Typography>
              <Typography variant="h4" component="h2">
                <span>
                  <FaCommentDots color="#6fa3cb" size={35} />{" "}
                  {/* Icon color and size */}
                </span>{" "}
                3,256
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Flex container for title and dropdown */}
      <div
        className="header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center", // Vertically aligns items
          marginTop: "20px",
          padding: "2% 15% 0 15%",
        }}
      >
        <h4 style={{ margin: 0 }}>สถิติการเข้าชมโพสต์</h4>
        <FormControl style={{ minWidth: 120 }}>
          <InputLabel>ระยะเวลา</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="ระยะเวลา"
          >
            <MenuItem value="Year">ตลอดทั้งปี</MenuItem>
            <MenuItem value="Month">ตลอดทั้งเดือน</MenuItem>
          </Select>
        </FormControl>
      </div>

      {/* Center the chart */}
      <div
        className="lineChart"
        style={{
          display: "flex",
          justifyContent: "center", // Horizontally center the chart
          alignItems: "center", // Vertically center the chart (if necessary)
          marginTop: "20px",
          height: "400px", // Adjust the height to fit the chart space
        }}
      >
        <LineChart
          xAxis={[{ data: chartData.xAxis }]}
          series={[
            {
              data: chartData.series,
            },
          ]}
          width={1000}
          height={400}
        />
      </div>
    </div>
  );
}
