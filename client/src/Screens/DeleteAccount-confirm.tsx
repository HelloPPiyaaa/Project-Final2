import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
<<<<<<< HEAD
=======
import "../misc/AccountPreferences.css";

>>>>>>> 760079d54e9c588ed8a78b9d2fd7d8391e1100b7

const DeleteAccountModal: React.FC<{
  userId: string | null;
  show: boolean;
  onClose: () => void;
  onDeleteSuccess: () => void;
}> = ({ userId, show, onClose, onDeleteSuccess }) => {
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
<<<<<<< HEAD
  const API_BASE_URL = "http://localhost:3001";
  const navigate = useNavigate();
=======
>>>>>>> 760079d54e9c588ed8a78b9d2fd7d8391e1100b7

  const handleDeleteAccount = async () => {
    try {
      const response = await axios.delete(
<<<<<<< HEAD
        `${API_BASE_URL}/profile/edit-profile/delete/${userId}`,
=======
        `http://localhost:3001/profile/edit-profile/delete/${userId}`,
>>>>>>> 760079d54e9c588ed8a78b9d2fd7d8391e1100b7
        {
          data: { password },
        }
      );

      if (response.data.message === "User deleted successfully") {
        setSuccessMessage("Account deleted successfully!");
        setErrorMessage("");
        onDeleteSuccess();
        localStorage.removeItem("userId");
<<<<<<< HEAD
        navigate("/login");
=======
        sessionStorage.removeItem("userId");
>>>>>>> 760079d54e9c588ed8a78b9d2fd7d8391e1100b7
      } else {
        setErrorMessage(response.data.error);
      }
    } catch (error) {
      setErrorMessage("Error deleting account. Please check your password.");
    }
  };

  return (
<<<<<<< HEAD
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Delete Account</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to delete your account? This action cannot be
          undone.
        </p>
        <Form>
          <Form.Group controlId="password">
            <Form.Label>Enter your password to confirm</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
=======
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>ลบบัญชีผู้ใช้</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีของคุณ
          การดำเนินการนี้ไม่สามารถย้อนกลับได้
        </p>
        <Form>
          <Form.Group controlId="password">
            <Form.Label>กรอกรหัสผ่านของคุณเพื่อยืนยัน</Form.Label>
            <Form.Control
              type="password"
>>>>>>> 760079d54e9c588ed8a78b9d2fd7d8391e1100b7
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          {errorMessage && <p className="text-danger">{errorMessage}</p>}
          {successMessage && <p className="text-success">{successMessage}</p>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
<<<<<<< HEAD
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDeleteAccount}>
          Delete Account
=======
        <Button
          style={{
            backgroundColor: "#333" /* สีพื้นหลัง */,
            color: "white" /* สีข้อความ */,
            borderRadius: "8px" /* มุมโค้ง */,
            padding: "10px 20px" /* ขนาด padding */,
            border: "none" /* ไม่มีเส้นขอบ */,
            textTransform: "none" /* ข้อความไม่เปลี่ยนรูปแบบ */,
          }}
          onClick={handleDeleteAccount}
        >
          ยืนยัน
        </Button>
        <Button variant="secondary" onClick={onClose}>
          ยกเลิก
>>>>>>> 760079d54e9c588ed8a78b9d2fd7d8391e1100b7
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteAccountModal;
