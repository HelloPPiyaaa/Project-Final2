import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchUserProfile, updateUserProfile } from "../api/profile";
import { IoCamera } from "react-icons/io5";
import { FaUserFriends } from "react-icons/fa";
import { Form, Col, Row, Alert, Container } from "react-bootstrap";
import Footer from "../Navbar/footer";
import { FollowerModal } from "./follower-modal";
import { FollowingModal } from "./following-modal";

const EditProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [coverPic, setCoverPic] = useState<string | ArrayBuffer | null>(null);
  const [profilePicture, setProfilePicture] = useState<
    string | ArrayBuffer | null
  >(null);
  const [gender, setGender] = useState("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const profileData = await fetchUserProfile(id);
          setUserProfile(profileData);
          setEmail(profileData.email);
          setTel(profileData.tel);
          setFirstname(profileData.firstname);
          setLastname(profileData.lastname);
          setDateOfBirth(profileData.date_of_birth);
          setGender(profileData.gender);
          setCoverPic(profileData.cover_pic);
          setProfilePicture(profileData.profile_picture);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchData();
  }, [id]);

  const MAX_IMAGE_WIDTH = 800;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          if (width > MAX_IMAGE_WIDTH) {
            height *= MAX_IMAGE_WIDTH / width;
            width = MAX_IMAGE_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/jpeg");
            setCoverPic(dataUrl);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          if (width > MAX_IMAGE_WIDTH) {
            height *= MAX_IMAGE_WIDTH / width;
            width = MAX_IMAGE_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/jpeg");
            setProfilePicture(dataUrl);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const userData = {
        email,
        tel,
        firstname,
        lastname,
        date_of_birth: dateOfBirth,
        gender,
        cover_pic: coverPic,
        profile_picture: profilePicture,
      };

      const response = await updateUserProfile(id!, userData);

      if (response) {
        setAlertMessage("Profile updated successfully");
      } else {
        setAlertMessage("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setAlertMessage((error as Error).message || "Internal server error");
    }
  };

  return (
    <div>
      <Form className="profile ">
        <div className="profile">
          <Form.Group
            className="coverpic "
            style={{ height: "60vh", borderBottom: "1px solid black" }}
          >
            <div>
              {coverPic && (
                <img
                  className="d-block"
                  src={coverPic.toString()}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "59.8vh",
                    objectFit: "cover",
                    overflow: "hidden",
                  }}
                />
              )}
              <Form.Control
                type="file"
                id="cover_pic"
                name="cover_pic"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              <div className="input-group-append">
                <label htmlFor="cover_pic" className="input-group-text1">
                  <IoCamera />
                </label>
              </div>
            </div>
          </Form.Group>
          <Form.Group className="ex-Pro1">
            <div
              className="profilepic"
              style={{
                width: "230px",
                height: "230px",
                border: "5px solid white",
                background: "white",
                borderRadius: "200px",
              }}
            >
              {profilePicture && (
                <img
                  className="d-block w-100"
                  src={profilePicture.toString()}
                  alt="Profile"
                  style={{
                    objectFit: "cover",
                    overflow: "hidden",
                    height: "227px",
                    display: "flex",
                    justifyContent: "center",
                    borderRadius: "200px",
                  }}
                />
              )}
              <Form.Control
                type="file"
                id="profile_picture"
                name="profile_picture"
                onChange={handleImageChange1}
                style={{ display: "none" }}
              />
              <div className="input-group-append1">
                <label htmlFor="profile_picture" className="input-group-text2">
                  <IoCamera />
                </label>
              </div>
            </div>
          </Form.Group>
        </div>
      </Form>

      <div
        className="detail-profile"
        style={{ marginTop: "9rem", textAlign: "center" }}
      >
        {userProfile && (
          <div>
            <div className="d-flex justify-content-center">
              <h1 style={{ padding: "0 10px 0 10px" }}>
                {userProfile.firstname}
              </h1>
              <h1 style={{ padding: "0 10px 0 10px" }}>
                {userProfile.lastname}
              </h1>
            </div>
          </div>
        )}
      </div>
      <div className="follow">
        {userProfile && (
          <div className="follow-icon">
            <FaUserFriends />
            <FollowerModal userProfile={userProfile} />
          </div>
        )}

        <div className="bar-icon"></div>

        {userProfile && (
          <div className="follow-icon">
            <FaUserFriends />
            <FollowingModal userProfile={userProfile} />
          </div>
        )}
      </div>

      <Container style={{ marginTop: "3rem", marginBottom: "3rem" }}>
        <Form className="Form2">
          {alertMessage && <Alert variant="danger">{alertMessage}</Alert>}
          <h3>แก้ไขข้อมูลโปรไฟล์</h3>
          <Row>
            <Col>
              <Form.Group className="mb-3" controlId="formFirstname">
                <Form.Label>ชื่อ</Form.Label>
                <Form.Control
                  type="text"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3" controlId="formBasicLastname">
                <Form.Label>นามสกุล</Form.Label>
                <Form.Control
                  type="text"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Group className="mb-3" controlId="formBasicUsername">
                <Form.Label>อีเมล</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>เบอร์โทรศัพท์</Form.Label>
                <Form.Control
                  type="tel"
                  value={tel}
                  onChange={(e) => setTel(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Label>เพศ</Form.Label>
              <Form.Select
                aria-label="เลือกเพศ"
                id="gender"
                name="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </Form.Select>
            </Col>
            <Col>
              <Form.Group className="mb-3" controlId="formBasicDate">
                <Form.Label>วันเกิด</Form.Label>
                <Form.Control
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </Form.Group>
            </Col>

            <Row className="accept mt-4">
              <Col style={{ display: "flex", justifyContent: "center" }}>
                <button id="RGbutton" onClick={handleUpdateProfile}>
                  ยืนยัน
                </button>
              </Col>
            </Row>
          </Row>
        </Form>
      </Container>
      <Footer />
    </div>
  );
};

export default EditProfile;
