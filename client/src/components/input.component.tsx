import { VscKey } from "react-icons/vsc";
import "../misc/InputBox.css";
import { FaUser } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";
import { IoEyeOffOutline } from "react-icons/io5";
import { useState } from "react";
import { IoEyeOutline } from "react-icons/io5";
import { SlLockOpen } from "react-icons/sl";
import { AiOutlineUser } from "react-icons/ai";
import { CiAt } from "react-icons/ci";
import { Link } from "react-router-dom";

interface InputBoxProps {
  name: string;
  type: string;
  id?: string;
  value?: string;
  placeholder: string;
  icon: string;
  className?: string;
  disable?: boolean;
}
const iconMap: { [key: string]: React.ElementType } = {
  FaUser: FaUser,
  MdOutlineMail: MdOutlineMail,
  VscKey: VscKey,
  SlLockOpen: SlLockOpen,
  AiOutlineUser: AiOutlineUser,
  CiAt: CiAt,
};

const InputBox: React.FC<InputBoxProps> = ({
  name,
  type,
  id,
  value,
  placeholder,
  icon,
  disable = false,
}) => {
  const IconComponent = iconMap[icon];
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <div
      className="Box"
      style={{ position: "relative", width: "100%", marginBottom: "1rem" }}
    >
      {icon && (
        <i
          className={icon}
          style={{
            position: "absolute",
            left: "16px",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        ></i>
      )}
      {IconComponent && (
        <IconComponent
          className="input-icon"
          style={{
            position: "absolute",
            left: "16px",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
      )}
      <input
        name={name}
        type={
          type === "password" ? (passwordVisible ? "text" : "password") : type
        }
        placeholder={placeholder}
        defaultValue={value}
        id={id}
        className="input-box"
        disabled={disable}
        style={{ paddingLeft: "48px" }}
      />

      {type === "password" &&
        (passwordVisible ? (
          <IoEyeOutline
            className="input-icon"
            style={{ left: "auto", right: "1rem", cursor: "pointer" }}
            onClick={() => setPasswordVisible((currentVal) => !currentVal)}
          />
        ) : (
          <IoEyeOffOutline
            className="input-icon"
            style={{ left: "auto", right: "1rem", cursor: "pointer" }}
            onClick={() => setPasswordVisible((currentVal) => !currentVal)}
          />
        ))}
    </div>
  );
};

export default InputBox;
