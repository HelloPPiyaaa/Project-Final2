import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Card, Row, Col } from "react-bootstrap";
import { IoHeart } from "react-icons/io5";
import { FaCommentDots } from "react-icons/fa";
import { fetchBlogById, fetchViews } from "../api/adminProfile";

interface ViewData {
  _id: string;
  month: string;
  year: number;
  blog: string;
  __v: number;
  createdAt: string;
  total_reads: number;
  updatedAt: string;
}

interface MonthlyViewCount {
  month: string;
  viewCount: number;
}

interface YearlyViewCount {
  year: string;
  viewCount: number;
}

const getMonthlyViewCounts = (data: ViewData[]): MonthlyViewCount[] => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthlyViewCounts: MonthlyViewCount[] = months.map((month) => ({
    month,
    viewCount: 0,
  }));
  data.forEach((entry) => {
    const monthIndex = months.indexOf(entry.month);
    if (monthIndex !== -1) {
      monthlyViewCounts[monthIndex].viewCount += entry.total_reads;
    }
  });

  return monthlyViewCounts;
};

const getYearlyViewCounts = (data: ViewData[]): YearlyViewCount[] => {
  const currentYear = new Date().getFullYear();

  const yearsRange = Array.from(
    { length: 5 },
    (_, index) => currentYear - 2 + index
  );
  const yearlyViewCounts: YearlyViewCount[] = yearsRange.map((year) => ({
    year: year.toString(),
    viewCount: 0,
  }));
  data.forEach((entry) => {
    if (typeof entry.year === "number") {
      const yearIndex = yearlyViewCounts.findIndex(
        (y) => y.year === entry.year.toString()
      );
      if (yearIndex !== -1) {
        yearlyViewCounts[yearIndex].viewCount += entry.total_reads;
      }
    }
  });
  return yearlyViewCounts;
};

export default function DashboardUser() {
  const userId = sessionStorage.getItem("userId");
  const [timeRange, setTimeRange] = useState("Month");
  const [getBlog, setGetBlog] = useState<any[]>([]);
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [totalReads, setTotalReads] = useState(0);
  const [totalViewsMonth, setTotalViewsMonth] = useState<any[]>([]);
  const [totalViewsYear, setTotalViewsYear] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const AllPost = await fetchBlogById(userId);
        const view = await fetchViews();
        setGetBlog(AllPost);
        setTotalViewsMonth(getMonthlyViewCounts(view));
        setTotalViewsYear(getYearlyViewCounts(view));
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    calculateTotals(getBlog);
  }, [getBlog]);

  const calculateTotals = (data: any) => {
    let likes = 0;
    let comments = 0;
    let reads = 0;

    data?.forEach((blog: any) => {
      likes += blog.activity.total_likes;
      comments += blog.activity.total_comments;
      reads += blog.activity.total_reads;
    });

    setTotalLikes(likes);
    setTotalComments(comments);
    setTotalReads(reads);
  };

  const monthData = {
    labels: totalViewsMonth.map((e) => e.month),
    datasets: [
      {
        label: "จำนวนผู้เข้าชม",
        data: totalViewsMonth.map((e) => e.viewCount),
        backgroundColor: "rgba(253, 70, 74, 0.6)",
        borderColor: "rgba(253, 70, 74, 1)",
        tension: 0.5,
        fill: true,
      },
    ],
  };

  const yearData = {
    labels: totalViewsYear.map((e) => e.year),
    datasets: [
      {
        label: "จำนวนผู้เข้าชม",
        data: totalViewsYear.map((e) => e.viewCount),
        backgroundColor: "rgba(253, 70, 74, 0.6)",
        borderColor: "rgba(253, 70, 74, 1)",
        tension: 0.5,
        fill: true,
      },
    ],
  };

  const chartData = timeRange === "Month" ? monthData : yearData;

  return (
    <div className="container mt-4">
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>จำนวนการกดถูกใจทั้งหมด</Card.Title>
              <Card.Text>
                <IoHeart color="#fd464a" size={40} /> {totalLikes}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>จำนวนการแสดงความคิดเห็นทั้งหมด</Card.Title>
              <Card.Text>
                <FaCommentDots color="#6fa3cb" size={35} /> {totalComments}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>สถิติการเข้าชมโพสต์</h4>
        <label htmlFor="timeRange">ระยะเวลา</label>
        <select
          id="timeRange"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="form-select"
        >
          <option value="Month">ตลอดทั้งเดือน</option>
          <option value="Year">ตลอดทั้งปี</option>
        </select>
      </div>

      <div>
        <Line
          data={chartData}
          options={{
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: {
                  display: false,
                },
              },
              y: {
                beginAtZero: true,
                grid: {
                  display: false,
                },
              },
            },
          }}
          height={400}
        />
      </div>
    </div>
  );
}
