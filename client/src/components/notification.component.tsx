import { Link, useNavigate } from "react-router-dom";
import { LuFileEdit } from "react-icons/lu";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { removeFromSession } from "../common/session";
import "../misc/dropdown-nav.css";
import AnimationWrapper from "../Screens/page-animation";
import axios from "axios";
import { FaUser } from "react-icons/fa";

const UserNotificationPanel = () => {
  const {
    userAuth: { username },
    setUserAuth,
  } = useContext(UserContext);
  const userId = sessionStorage.getItem("userId");

  const [notifications, setNotifications] = useState<any[]>([]);
  const navigate = useNavigate();
  const API_BASE_URL = "http://localhost:3001";

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/notifications?userId=${userId}`
        );
        setNotifications(response.data);
        console.log("response.data", response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 5000);
    return () => clearInterval(intervalId);
  }, [userId]);

  const handleNotificationClick = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    type: string,
    notificationId: string,
    entityId: string
  ) => {
    e.preventDefault();
    try {
      await axios.patch(
        `http://localhost:3001/notifications/${notificationId}/mark-as-read`
      );
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      navigate(
        type === "follow" ? `/profile/${entityId}` : `/content/${entityId}`
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <AnimationWrapper className="animationwrap" transition={{ duration: 0.2 }}>
      {notifications.map((notification) => {
        return (
          <div className="list-dropdown">
            <div
              className="d-flex"
              style={
                notification.isRead
                  ? { backgroundColor: "transparent" }
                  : {
                      backgroundColor: "rgba(183, 183, 183, .5)",
                      borderRadius: "10px",
                      padding: "5px",
                    }
              }
            >
              <FaUser style={{ fontSize: "20px", marginRight: "15px" }} />
              <p
                className="m-0"
                onClick={(e: any) =>
                  handleNotificationClick(
                    e,
                    notification.type,
                    notification._id,
                    notification.entity
                  )
                }
              >
                {notification.message}
              </p>
            </div>
          </div>
        );
      })}
      {/* <div className="list-dropdown">
        <Link to="/editor" className="link link-list">
          <LuFileEdit />
          <p className="m-0">เขียน</p>
        </Link>
        <Link to={`/user/${username}`} className="link pl-8 ">
          โปรไฟล์
        </Link>

        <Link to={`/dashboard/blogs`} className="link pl-8 ">
          Dashboard
        </Link>

        <Link to={`/settings/edit-profile`} className="link pl-8">
          ตั้งค่า
        </Link>
        <Link to={`/account/preference/${userId}`} className="link pl-8">
          Account Preference
        </Link>
        <Link to={`/settings/edit-profile`} className="link pl-8">
          ช่วยเหลือ
        </Link>
      </div> */}
    </AnimationWrapper>
  );
};

export default UserNotificationPanel;
