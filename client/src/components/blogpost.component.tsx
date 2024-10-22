import { Link } from "react-router-dom";
import { Post, Author } from "../types/post";
import { FaRegHeart } from "react-icons/fa";
import { getDay } from "../common/date";

interface BlogCardProps {
  content: Post;
  author: Author;
}

const BlogCard: React.FC<BlogCardProps> = ({ content, author }) => {
  const {
    publishedAt,
    tags,
    topic,
    des,
    banner,
    activity: { total_likes },
    blog_id: id,
  } = content;
  // ใช้การตรวจสอบเพื่อหลีกเลี่ยงข้อผิดพลาด
  const {
    fullname = "Unknown Author",
    profile_picture = "",
    username = "Unknown User",
  } = author || {};

  return (
    <Link
      to={`/blog/${id}`}
      className="blog-link d-flex align-items-center mb-4"
      style={{
        borderBottom: "1px solid #ccc",
        paddingBottom: "1.25rem",
        textDecoration: "none",
      }}
    >
      <div className="w-100">
        <div className="d-flex gap-2 align-items-center mb-7">
          <img
            src={profile_picture}
            alt=""
            className=" rounded-circle"
            style={{ height: "24px", width: "24px" }}
          />
          <p
            className="m-0 fw-medium"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: "1",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {fullname} @{username}
          </p>
          <p className="w-auto m-0 fw-medium"> {getDay(publishedAt)}</p>
        </div>

        <h1 className="blog-title mt-3">{topic}</h1>

        <p className="descript-blogpost">{des}</p>

        <div className="d-flex gap-4 mt-3">
          <span className="btn-light py-1 px-4">{tags[0]}</span>
          <span
            className="ml-3 d-flex align-items-center gap-2 "
            style={{ color: "#404040" }}
          >
            <FaRegHeart />
            {total_likes}
          </span>
        </div>
      </div>

      <div
        style={{ aspectRatio: "1/1", height: "7rem", background: "#f0f0f0" }}
      >
        <img
          src={banner}
          alt=""
          className="w-100 h-100"
          style={{ objectFit: "cover", aspectRatio: "1/1" }}
        />
      </div>
    </Link>
  );
};

export default BlogCard;
