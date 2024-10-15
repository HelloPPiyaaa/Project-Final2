import React, { useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

interface Report {
  _id: string;
  reason: string;
  verified: boolean;
  status: string;
  createdAt: string;
  reportedBy: {
    _id: string;
    fullname: string;
  };
  post: {
    _id: string;
    user: {
      _id: string;
      fullname: string;
      profile_picture: string;
    };
    image: string;
    topic: string;
    detail: string;
    category: string[];
    contentWithImages: {
      content: string;
      images?: string[];
    }[];
  };
}

interface ReportDetailsModalProps {
  showModal: boolean;
  handleClose: () => void;
  report: Report | null;
  refreshReports: () => void;
}

const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
  showModal,
  handleClose,
  report,
  refreshReports,
}) => {
  const navigate = useNavigate();
  const API_BASE_URL = "http://localhost:3001";

  const verifyReport = async (
    reportId: string,
    isVerified: boolean
  ): Promise<AxiosResponse<any>> => {
    const url = `${API_BASE_URL}/api/report/${reportId}/verify`;

    try {
      const response = await axios.patch(url, {
        verified: isVerified,
      });

      if (response.status !== 200) {
        throw new Error(`Failed to verify report: ${response.statusText}`);
      }

      return response;
    } catch (error: any) {
      console.error("Error verifying report:", error.message);
      throw error;
    }
  };

  useEffect(() => {
    console.log("report", report);
  }, [report]);

  const deletePostAndVerifyReport = async (
    reportId: string,
    postId: string
  ): Promise<any> => {
    const url = `${API_BASE_URL}/api/report/${reportId}/deletePost`;
    const token = Cookies.get("token");

    if (!token) {
      throw new Error("Authentication token is missing");
    }

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status} ${response.statusText} for report ${reportId}`
        );
      }

      return response.json();
    } catch (error: any) {
      console.error("Error deleting post and verifying report:", error.message);
      throw error;
    }
  };

  const handleVerification = async (isVerified: boolean) => {
    if (!report) {
      console.error("No report found");
      return;
    }

    try {
      await verifyReport(report._id, isVerified);
      console.log("Report verified successfully");

      if (!isVerified && report.post && report.post._id) {
        await deletePostAndVerifyReport(report._id, report.post._id);
        console.log("Post deleted successfully");
      }

      refreshReports();
      handleClose();
    } catch (error) {
      console.error("Failed to verify report:", error);
    }
  };

  return (
    <Modal show={showModal} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Report Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {report ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              paddingInline: "1rem",
            }}
          >
            <p>
              <span
                onClick={() => navigate(`/profile/${report.reportedBy._id}`)}
                style={{
                  cursor: "pointer",
                  color: "black",
                  textDecoration: "none",
                }}
              >
                {report.reportedBy.fullname}
              </span>{" "}
              {`ได้รายงานโพสของ`}{" "}
              <span
                onClick={() => navigate(`/profile/${report.post.user._id}`)}
                style={{
                  cursor: "pointer",
                  color: "black",
                  textDecoration: "none",
                }}
              >
                {report.post.user.fullname}
              </span>{" "}
              : {report.reason || "No Title"}
            </p>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div className="profile-photo">
                {/* <img src={report.post.user.profile_picture || ""} alt="" /> */}
              </div>
              <span
                onClick={() => navigate(`/profile/${report.post.user._id}`)}
                style={{
                  cursor: "pointer",
                  color: "black",
                  textDecoration: "none",
                }}
              >
                {report.post.user.fullname}
              </span>
            </span>
            <img
              src={report.post.image}
              alt={report.post.topic}
              style={{ width: "100%", height: "auto", borderRadius: "0.5rem" }}
            />
            <b>{report.post.topic}</b>
            {/* <div>{report.post.category.map((e) => e)}</div> */}
            <p>{report.post.detail}</p>
            {/* {report.post.contentWithImages.map((e: any, idx: number) => {
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <img
                    src={e.images?.[0] || undefined}
                    alt={report.post.topic}
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <p>{e.content}</p>
                </div>
              );
            })} */}
          </div>
        ) : (
          <p>No report selected.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={() => handleVerification(true)}>
          Verified
        </Button>
        <Button variant="danger" onClick={() => handleVerification(false)}>
          Not Verified
        </Button>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReportDetailsModal;
