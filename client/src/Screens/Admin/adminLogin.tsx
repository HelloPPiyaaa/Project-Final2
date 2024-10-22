import { useState, useEffect, useRef, useContext } from "react";
import logohead from "../../pic/logo-headV2.png";
import "../../misc/login.css";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../App";
import toast from "react-hot-toast";
<<<<<<< HEAD
import { storeInSession } from "../../common/session";
=======
import {
  storeInSession,
  userInSession,
  userIdInSession,
} from "../../common/session";
>>>>>>> 760079d54e9c588ed8a78b9d2fd7d8391e1100b7

interface LoginPageProps {
  type: string;
}

const Login: React.FC<LoginPageProps> = ({ type }) => {
  const authForm = useRef<HTMLFormElement>(null);
  const API_URL = "http://localhost:3001";
  const navigate = useNavigate();

  const {
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
<<<<<<< HEAD

  const userAuthThroughServer = (
    serverRoute: string,
    formData: { [key: string]: any }
  ) => {
    fetch(API_URL + serverRoute, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            throw new Error(errorData.error || "Error occurred");
          });
        }
        return response.json();
      })
      .then((data) => {
        storeInSession("user", JSON.stringify(data)); // เก็บข้อมูลใน session
        setUserAuth(data); // อัปเดต context ของผู้ใช้

        // นำทางไปยังหน้าที่เหมาะสมตามบทบาท
        if (data.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // ป้องกันไม่ให้หน้ารีเฟรช

    // ส่งข้อมูลฟอร์มไปยัง server
    userAuthThroughServer("/login", { email, password });
  };

  useEffect(() => {
    const toggleBtns = document.querySelectorAll<HTMLAnchorElement>(".toggle");
    const mainElement = document.querySelector<HTMLElement>("main");

    const handleFocus = (inp: HTMLInputElement) => {
      inp.classList.add("active");
    };

    const handleBlur = (inp: HTMLInputElement) => {
      if (inp.value === "") {
        inp.classList.remove("active");
      }
    };

    const handleToggleClick = () => {
      mainElement?.classList.toggle("sign-up-mode");
    };

    toggleBtns.forEach((btn) =>
      btn.addEventListener("click", handleToggleClick)
    );

    const inputs = document.querySelectorAll<HTMLInputElement>(".input-field");
    inputs.forEach((inp) => {
      inp.addEventListener("focus", () => handleFocus(inp));
      inp.addEventListener("blur", () => handleBlur(inp));
    });

    return () => {
      toggleBtns.forEach((btn) =>
        btn.removeEventListener("click", handleToggleClick)
      );
      inputs.forEach((inp) => {
        inp.removeEventListener("focus", () => handleFocus(inp));
        inp.removeEventListener("blur", () => handleBlur(inp));
      });
    };
  }, []);
=======

  const userAuthThroughServer = (
    serverRoute: string,
    formData: { [key: string]: any }
  ) => {
    fetch(API_URL + serverRoute, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            throw new Error(errorData.error || "Error occurred");
          });
        }
        return response.json();
      })
      .then((data) => {
        storeInSession("user", JSON.stringify(data));
        setUserAuth(data);
        userInSession("userId", data.username);
        userIdInSession("adminId", data._id);
        navigate(`/admin/${data._id}`);
      })
      .catch((error) => {
        // Set the error message in the alertMessage state
        setAlertMessage(error.message); // Use the error message
        toast.error(error.message);
      });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAlertMessage(null); // Clear any previous error messages
    userAuthThroughServer("/admin", { email, password });
  };
>>>>>>> 760079d54e9c588ed8a78b9d2fd7d8391e1100b7

  return (
    <div className="login-container">
      <main>
        <div className="box">
          <div className="inner-box">
            <div className="forms-wrap">
              <form
                autoComplete="off"
                className="sign-in-form"
                onSubmit={handleSubmit}
                ref={authForm}
              >
                <div className="logo">
                  <img src={logohead} alt="easyclass" />
                </div>

                <div className="heading">
                  <h2>ยินดีต้อนรับผู้ดูแลระบบ</h2>
                </div>

                <div className="actual-form">
                  <div className="input-wrap">
                    <input
                      type="email"
                      minLength={4}
                      className="input-field"
                      autoComplete="off"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <label className="label-login">อีเมล</label>
                  </div>
                  <div className="input-wrap">
                    <input
                      type="password"
                      minLength={4}
                      className="input-field"
                      autoComplete="off"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <label className="label-login">รหัสผ่าน</label>
                  </div>

<<<<<<< HEAD
=======
                  {alertMessage && (
                    <h3
                      className="error-message"
                      style={{ color: "red", fontSize: "1rem" }}
                    >
                      {alertMessage}
                    </h3>
                  )}

>>>>>>> 760079d54e9c588ed8a78b9d2fd7d8391e1100b7
                  <button type="submit" className="sign-btn">
                    เข้าสู่ระบบ
                  </button>

                  <p className="text">
                    <Link to="/forgot-password">ลืมรหัสผ่าน</Link> ในการเข้าสู่ระบบ
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
