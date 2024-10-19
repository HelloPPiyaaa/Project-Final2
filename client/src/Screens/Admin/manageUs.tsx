import React, { useState, useEffect } from "react";
import { PiUsersThreeFill } from "react-icons/pi";
import { LuView } from "react-icons/lu";
import {
  fetchAdminProfile,
  fetchUsersAPI,
  deleteUserAPI,
  updateUserAPI,
} from "../../api/adminProfile";
import { useNavigate, useParams } from "react-router-dom";
import GenderChart from "./Chart/GenderChart";
import { Button, Modal, Form } from "react-bootstrap";
import axios from "axios";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; // Import eye icons
import DeleteAccountModal from "../DeleteAccount-confirm";
import DeleteAdminAccountModal from "./adminDelete-account";

interface UserProps {
  users: any[];
}

const ManageUser: React.FC<UserProps> = ({ users }) => {
  const { id } = useParams<{ id: string }>();
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fetchUserData, setFetchUserData] = useState<any>([]);

  // State to manage password visibility for each user
  const [passwordVisibility, setPasswordVisibility] = useState<{
    [key: string]: boolean;
  }>({});

  const API_BASE_URL = "http://localhost:3001";
  const navigate = useNavigate();

  const genderData = {
    male: 30,
    female: 20,
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    setSelectedUser(userId);
    setShowDeleteModal(true);
  };

  const handleUpdateUser = async () => {
    if (selectedUser) {
      try {
        await updateUserAPI(selectedUser._id, firstname, email);
        setShowEditModal(false);
      } catch (error) {
        console.error("Error updating user:", error);
        // Handle error (e.g., show notification)
      }
    }
  };

  // Function to toggle password visibility for a specific user
  const togglePasswordVisibility = (userId: string) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    fetchUsers();
    alert("Your account has been deleted.");
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/profile`);
      setFetchUserData(response.data);
      console.log("respone.data", response.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  useEffect(() => {
    console.log("users", users);
    console.log("fetchUserData", fetchUserData);
  }, [fetchUserData]);

  return (
    <div className="manageUser">
      <div className="main1">
        <h1>จัดการบัญชีผู้ใช้</h1>

        <div className="insights">
          <div className="user-all">
            <PiUsersThreeFill className="svg1" />
            <div className="middle">
              <div className="left">
                <h3>ผู้ใช้ทั้งหมด</h3>
                <h1>{users.length}</h1>
              </div>
            </div>
            <small className="text-muted1">Last 24 Hour</small>
          </div>

          <div className="view-all">
            <LuView className="svg2" />
            <div className="middle">
              <div className="left">
                <h3>ผู้ใช้ใหม่</h3>
                <h1>-</h1>
              </div>
            </div>
            <small className="text-muted1">Last 24 Hour</small>
          </div>

          <div className="blogpost-all">
            <div className="middle">
              <GenderChart data={genderData} />
            </div>
          </div>
        </div>

        <div className="recent-order" style={{ marginTop: "1.5rem" }}>
          <h2>รายการ</h2>
          <div className="right">
            <div
              className="activity-analytics"
              style={{
                marginTop: "0.5rem",
                overflowY: "scroll",
                maxHeight: "300px",
              }}
            >
              <table>
                <thead className="pt-5">
                  <tr>
                    <th>Date</th>
                    <th>User Name</th>
                    <th>Email</th>
                    <th>Password</th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    fetchUserData.length > 0 ? (
                      fetchUserData.map((u: any) => (
                        <tr key={u._id}>
                          <td>{new Date(u.joinedAt).toLocaleDateString()}</td>
                          <td>{u.fullname}</td>
                          <td>{u.email}</td>
                          <td className="warning">
                            <span>
                              {passwordVisibility[u._id] ? u.password : "*****"}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(u._id)}
                              style={{
                                border: "none",
                                background: "none",
                                cursor: "pointer",
                              }}
                            >
                              {passwordVisibility[u._id] ? (
                                <AiFillEyeInvisible />
                              ) : (
                                <AiFillEye />
                              )}
                            </button>
                          </td>
                          <td className="primary">
                            <Button onClick={() => handleEditUser(u)}>
                              Edit
                            </Button>
                          </td>
                          <td>
                            <Button onClick={() => handleDeleteUser(u._id)}>
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      users.map((u: any) => (
                        <tr key={u._id}>
                          <td>{new Date(u.joinedAt).toLocaleDateString()}</td>
                          <td>{u.fullname}</td>
                          <td>{u.email}</td>
                          <td className="warning">
                            <span>
                              {passwordVisibility[u._id] ? u.password : "*****"}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(u._id)}
                              style={{
                                border: "none",
                                background: "none",
                                cursor: "pointer",
                              }}
                            >
                              {passwordVisibility[u._id] ? (
                                <AiFillEyeInvisible />
                              ) : (
                                <AiFillEye />
                              )}
                            </button>
                          </td>
                          <td className="primary">
                            <Button onClick={() => handleEditUser(u)}>
                              Edit
                            </Button>
                          </td>
                          <td>
                            <Button onClick={() => handleDeleteUser(u._id)}>
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))
                    )
                  ) : (
                    <tr>
                      <td colSpan={5}>No reports available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formFullname">
              <Form.Label>Fullname</Form.Label>
              <Form.Control
                type="text"
                value={selectedUser?.fullname || ""}
                onChange={(e) => setFirstname(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={selectedUser?.email || ""}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdateUser}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete User Modal */}
      <DeleteAdminAccountModal
        userId={selectedUser}
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default ManageUser;
