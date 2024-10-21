import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Card, Row, Col } from "react-bootstrap";
import { IoHeart } from "react-icons/io5";
import { FaCommentDots } from "react-icons/fa";
import { fetchBlogById } from "../api/adminProfile";

export default function DashboardUser() {
  const userId = sessionStorage.getItem("userId");
  const [timeRange, setTimeRange] = useState("Month");
  const [getBlog, setGetBlog] = useState<any[]>([]);
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [totalReads, setTotalReads] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const AllPost = await fetchBlogById(userId);
        setGetBlog(AllPost);
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
    labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค."],
    datasets: [
      {
        label: "จำนวนผู้เข้าชม",
        data: [15, 30, 8, 20, 12],
        backgroundColor: "rgba(253, 70, 74, 0.6)",
        borderColor: "rgba(253, 70, 74, 1)",
        tension: 0.5,
        fill: true,
      },
    ],
  };

  const yearData = {
    labels: ["2562", "2563", "2564", "2565", "2566"],
    datasets: [
      {
        label: "จำนวนผู้เข้าชม",
        data: [15, 25, 8, 20, 18],
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
