import React, { useEffect, useState, useCallback } from "react";
import {
  getPosts,
  deletePostById,
  savePost,
  likePost,
  deleteSave,
  addReport,
} from "../api/post";
import { Post } from "../types/post";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Dropdown,
  Modal,
  Spinner,
  ToggleButton,
  ButtonGroup,
  Badge,
} from "react-bootstrap";
import { TfiMoreAlt } from "react-icons/tfi";
import "../misc/feeds.css";
import { GoHeartFill } from "react-icons/go";
import { IoStatsChart } from "react-icons/io5";
import { IoBookmark } from "react-icons/io5";
import { HiOutlinePlus } from "react-icons/hi2";
import { Form } from "react-bootstrap";

const radios = [
  { name: "Newest", value: "1" },
  { name: "Oldest", value: "2" },
  { name: "Most Popular", value: "3" },
];

const Feeds = () => {
  const navigate = useNavigate();
  const [feeds, setFeeds] = useState<Post[]>([]);
  const [sortedFeeds, setSortedFeeds] = useState<Post[]>([]);
  const [radioValue, setRadioValue] = useState("1");
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleClickselectPost = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const userId = localStorage.getItem("userId");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPosts();
      setFeeds(res);
    } catch (e) {
      console.error("Failed to fetch posts:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const savedPosts = feeds.map((feed) => {
      const isSaved = localStorage.getItem(`saved_${feed._id}`) === "true";
      return { ...feed, isSaved };
    });

    setSortedFeeds(savedPosts);
  }, [feeds]);

  useEffect(() => {
    const sorted = [...feeds];
    if (radioValue === "1") {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (radioValue === "2") {
      sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (radioValue === "3") {
      sorted.sort((a, b) => b.likes.length - a.likes.length);
    }

    // อัปเดต isSaved ใน sortedFeeds ก่อนตั้งค่า
    const updatedSortedFeeds = sorted.map((feed) => {
      const isSaved = localStorage.getItem(`saved_${feed._id}`) === "true";
      return { ...feed, isSaved };
    });

    setSortedFeeds(updatedSortedFeeds);
  }, [feeds, radioValue]);

  const handleClickCard = (id: string) => {
    navigate(`/content/${id}`);
  };

  const handleShowModal = (id: string) => {
    setPostIdToDelete(id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (postIdToDelete) {
      try {
        await deletePostById(postIdToDelete);
        setFeeds((prevFeeds) =>
          prevFeeds.filter((feed) => feed._id !== postIdToDelete)
        );
      } catch (e) {
        console.error(e);
      } finally {
        setShowModal(false);
      }
    }
  };

  const handleSavePost = async (id: string) => {
    if (!userId) {
      console.error("User ID is null");
      return;
    }

    try {
      const post = feeds.find((feed) => feed._id === id);
      if (!post) {
        console.error("Post not found");
        return;
      }

      const isSaved = post.saves.some((save: any) => save.user === userId);

      // ทำการบันทึกหรือลบโพสต์ตามสถานะการบันทึก
      if (isSaved) {
        await deleteSave(id);
        localStorage.removeItem(`saved_${id}`);
      } else {
        await savePost(id);
        localStorage.setItem(`saved_${id}`, "true");
      }

      // อัปเดต state ของ feeds
      setFeeds((prevFeeds) =>
        prevFeeds.map((feed) =>
          feed._id === id
            ? {
                ...feed,
                saves: isSaved
                  ? feed.saves.filter((save: any) => save.user !== userId) // ลบการบันทึก
                  : [...feed.saves, { user: userId } as any], // เพิ่มการบันทึก
                isSaved: !isSaved, // สลับสถานะ isSaved
              }
            : feed
        )
      );
    } catch (e) {
      console.error("Failed to save or unsave post:", e);
    }
  };

  const handleLike = async (id: string): Promise<void> => {
    try {
      await likePost(id as string);
      fetchPosts();
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "วิชาเสรี":
        return "category-วิชาเสรี";
      case "ข่าวสาร/ประชาสัมพันธ์":
        return "category-ข่าวสารประชาสัมพันธ์";
      case "น้องใหม่":
        return "category-น้องใหม่";
      case "ลงทะเบียนเรียน":
        return "category-ลงทะเบียนเรียน";
      case "กีฬา":
        return "category-กีฬา";
      case "ทั่วไป":
        return "category-ทั่วไป";
      case "รีวิวมข":
        return "category-รีวิวมข";
      default:
        return "";
    }
  };

  const handleClickPost = () => {
    navigate(`/posts`);
  };

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPostId, setReportPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");

  const handleShowReportModal = (id: string) => {
    setReportPostId(id);
    setShowReportModal(true);
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setReportPostId(null);
    setReportReason("");
  };

  const handleReportPost = async () => {
    if (reportPostId && reportReason) {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          throw new Error("User is not logged in.");
        }

        const response = await addReport(reportPostId, reportReason, userId);

        if (response && response.status === 201) {
          alert("Report submitted successfully!");
        } else {
          alert("Failed to submit the report.");
        }

        handleCloseReportModal();
      } catch (error) {
        console.error("Failed to report post:", error);
        alert("An error occurred while submitting the report.");
      }
    } else {
      console.log("Please enter a reason for the report.");
    }
  };

  return (
    <div className="blogs">
      <section className="trending-post" id="trending">
        <div className="center-text">
          <h2>
            Our Trending <span>Post</span>
          </h2>
          <div className="add-post">
            <HiOutlinePlus
              onClick={handleClickselectPost}
              style={{ fontSize: "50px" }}
            />

            <Dropdown
              show={dropdownOpen}
              onToggle={() => setDropdownOpen(false)}
            >
              <Dropdown.Menu
                style={{
                  position: "fixed",
                  bottom: "5.5rem",
                  color: "#cb6ce6",
                  right: "30px",
                }}
              >
                <Dropdown.Item href="#/action-1" onClick={handleClickPost}>
                  บล็อกทั่วไป
                </Dropdown.Item>
                <Dropdown.Item href="#/action-2">Action 2</Dropdown.Item>
                <Dropdown.Item href="#/action-3">Action 3</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
        <div>
          <ButtonGroup className="mb-2">
            {radios.map((radio, idx) => (
              <ToggleButton
                key={idx}
                id={`radio-${idx}`}
                type="radio"
                variant="secondary"
                name="radio"
                value={radio.value}
                checked={radioValue === radio.value}
                onChange={(e) => setRadioValue(e.currentTarget.value)}
              >
                {radio.name}
              </ToggleButton>
            ))}
          </ButtonGroup>
        </div>
        {loading ? (
          <div className="text-center mt-5">
            <Spinner animation="border" style={{ color: "#cb6ce6" }} />
          </div>
        ) : (
          <div className="blog">
            {sortedFeeds.map((feed, idx) => (
              <div className="row" key={idx} style={{ position: "relative" }}>
                <div className="select-detail">
                  <TfiMoreAlt
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown((prev) =>
                        prev === feed._id ? null : feed._id
                      );
                    }}
                  />
                  {showDropdown === feed._id && (
                    <Dropdown
                      show={showDropdown === feed._id}
                      style={{
                        position: "absolute",
                        right: "200px",
                        top: "20px",
                      }}
                    >
                      <Dropdown.Menu variant="dark">
                        {userId === feed.user._id && (
                          <>
                            <Dropdown.Item
                              onClick={() => navigate(`/editpost/${feed._id}`)}
                            >
                              แก้ไขโพสต์
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => handleShowModal(feed._id)}
                            >
                              ลบโพสต์
                            </Dropdown.Item>
                          </>
                        )}
                        <Dropdown.Item
                          onClick={() => handleShowReportModal(feed._id)}
                        >
                          รายงานปัญหา
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
                </div>
                <div className="row2" onClick={() => handleClickCard(feed._id)}>
                  <img src={feed.image} alt="" />
                  <div className="user-name d-flex align-items-center justify-content-between mt-2">
                    <div className="user-feed d-flex align-items-center">
                      <img
                        src={
                          feed?.user?.profile_picture ||
                          "default_profile_picture.jpg"
                        }
                        alt="Profile"
                        style={{ margin: "0.5rem 0.5rem 0.5rem 0 " }}
                      />
                      <h6 style={{ fontSize: "16px" }}>
                        {feed?.user?.username || "Unknown User"}
                      </h6>
                    </div>
                    <div className="stat-icon">
                      <IoStatsChart style={{ fontSize: "16px" }} />
                    </div>
                  </div>
                  <div className="detail-blog">
                    <h4>{feed.topic}</h4>
                    <div style={{ marginBottom: "10px" }}>
                      {feed.category?.map((category) => (
                        <span
                          key={category}
                          className={`category ${getCategoryBadgeClass(
                            category
                          )}`}
                          style={{ marginRight: "5px" }}
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                    <p>
                      {feed.contentWithImages
                        ?.map((cwi) => cwi.content)
                        .join("\n")}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "10px",
                      }}
                    >
                      <Badge bg="light" text="dark">
                        <GoHeartFill
                          style={{ marginRight: "5px", fontSize: "16px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(feed._id);
                          }}
                          color={
                            feed.likes.find((l) => l.user === userId)
                              ? "red"
                              : "black"
                          }
                        />
                        {feed.likes.length}
                      </Badge>

                      <Badge bg="light" text="dark">
                        <IoBookmark
                          style={{
                            marginRight: "5px",
                            fontSize: "16px",
                            color: feed.isSaved ? "#cb6ce6" : "black",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSavePost(feed._id);
                          }}
                        />
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>ยืนยันการลบโพสต์</Modal.Title>
          </Modal.Header>
          <Modal.Body>คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              ยกเลิก
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              ลบโพสต์
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Report modal */}
        <Modal show={showReportModal} onHide={handleCloseReportModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>รายงานปัญหา</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Check
                  type="radio"
                  label="เนื้อหาไม่เหมาะสม"
                  name="reportReason"
                  value="เนื้อหาไม่เหมาะสม"
                  onChange={(e) => setReportReason(e.target.value)}
                  checked={reportReason === "เนื้อหาไม่เหมาะสม"}
                />
                <Form.Check
                  type="radio"
                  label="เนื้อหามีการกลั่นแกล้งหรือคุกคาม"
                  name="reportReason"
                  value="เนื้อหามีการกลั่นแกล้งหรือคุกคาม"
                  onChange={(e) => setReportReason(e.target.value)}
                  checked={reportReason === "เนื้อหามีการกลั่นแกล้งหรือคุกคาม"}
                />
                <Form.Check
                  type="radio"
                  label="เนื้อหามีการขายหรือส่งเสริมสินค้าต้องห้าม"
                  name="reportReason"
                  value="เนื้อหามีการขายหรือส่งเสริมสินค้าต้องห้าม"
                  onChange={(e) => setReportReason(e.target.value)}
                  checked={
                    reportReason === "เนื้อหามีการขายหรือส่งเสริมสินค้าต้องห้าม"
                  }
                />
                <Form.Check
                  type="radio"
                  label="ข้อมูลเท็จ"
                  name="reportReason"
                  value="ข้อมูลเท็จ"
                  onChange={(e) => setReportReason(e.target.value)}
                  checked={reportReason === "ข้อมูลเท็จ"}
                />
                <Form.Check
                  type="radio"
                  label="การแอบอ้างบุคคลอื่น"
                  name="reportReason"
                  value="การแอบอ้างบุคคลอื่น"
                  onChange={(e) => setReportReason(e.target.value)}
                  checked={reportReason === "การแอบอ้างบุคคลอื่น"}
                />
                <Form.Check
                  type="radio"
                  label="สแปม"
                  name="reportReason"
                  value="สแปม"
                  onChange={(e) => setReportReason(e.target.value)}
                  checked={reportReason === "สแปม"}
                />
              </Form.Group>
            </Form>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseReportModal}>
              ยกเลิก
            </Button>
            <Button variant="danger" onClick={handleReportPost}>
              รายงานปัญหา
            </Button>
          </Modal.Footer>
        </Modal>
      </section>
    </div>
  );
};

export default Feeds;
