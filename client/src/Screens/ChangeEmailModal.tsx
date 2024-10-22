import React from "react";
<<<<<<< HEAD
=======
import "../misc/AccountPreferences.css";
>>>>>>> 760079d54e9c588ed8a78b9d2fd7d8391e1100b7
import { Modal, Button } from "react-bootstrap";

interface ChangeEmailModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (email: string) => void;
<<<<<<< HEAD
=======
  oldEmail: string;
>>>>>>> 760079d54e9c588ed8a78b9d2fd7d8391e1100b7
}

const ChangeEmailModal: React.FC<ChangeEmailModalProps> = ({
  show,
  onClose,
  onSave,
<<<<<<< HEAD
=======
  oldEmail,
>>>>>>> 760079d54e9c588ed8a78b9d2fd7d8391e1100b7
}) => {
  const [email, setEmail] = React.useState("");

  const handleSave = () => {
    if (email) {
      onSave(email);
      setEmail("");
    } else {
      alert("Please enter a valid email.");
    }
  };

  return (
<<<<<<< HEAD
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Change Email</Modal.Title>
=======
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>เปลี่ยนอีเมล</Modal.Title>
>>>>>>> 760079d54e9c588ed8a78b9d2fd7d8391e1100b7
      </Modal.Header>
      <Modal.Body>
        <input
          type="email"
          placeholder="Enter new email"
<<<<<<< HEAD
          value={email}
=======
          value={email || oldEmail}
>>>>>>> 760079d54e9c588ed8a78b9d2fd7d8391e1100b7
          onChange={(e) => setEmail(e.target.value)}
          className="form-control"
        />
      </Modal.Body>
      <Modal.Footer>
<<<<<<< HEAD
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
=======
      <Button
          style={{
            backgroundColor: "#333" /* สีพื้นหลัง */,
            color: "white" /* สีข้อความ */,
            borderRadius: "8px" /* มุมโค้ง */,
            padding: "10px 20px" /* ขนาด padding */,
            border: "none" /* ไม่มีเส้นขอบ */,
            textTransform: "none" /* ข้อความไม่เปลี่ยนรูปแบบ */,
          }}onClick={handleSave}>
          ยืนยัน
        </Button>
        <Button variant="secondary" onClick={onClose}>
         ยกเลิก
        </Button>
        
>>>>>>> 760079d54e9c588ed8a78b9d2fd7d8391e1100b7
      </Modal.Footer>
    </Modal>
  );
};

export default ChangeEmailModal;
