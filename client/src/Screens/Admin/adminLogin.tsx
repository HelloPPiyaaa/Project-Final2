import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../App";
import toast from "react-hot-toast";
import { storeInSession } from "../../common/session";
import logohead from "../../pic/logo-headV2.png";
import "../../misc/login.css";

interface LoginPageProps {
  type: string;
}

const Login: React.FC<LoginPageProps> = ({ type }) => {
  const API_URL = "http://localhost:3001";
  const navigate = useNavigate();

  const {
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    event.preventDefault();
    userAuthThroughServer("/login", { email, password });
  };

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
              >
                <div className="logo">
                  <img src={logohead} alt="easyclass" />
                </div>

                <div className="heading">
                  <h4>Admin Login</h4>
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
                    <label className="label-login">Email</label>
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
                    <label className="label-login">Password</label>
                  </div>

                  <button type="submit" className="sign-btn">
                    Login
                  </button>

                  <p className="text">
                    <Link to="/forgot-password">Forgot password</Link>{" "}
                    
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
