import React, { useContext, useState } from "react";
import { getDay } from "../common/date";
import { UserContext } from "../App";
import toast from "react-hot-toast";
import CommentField from "./comment-field.component";
import { FaRegCommentDots } from "react-icons/fa";
import { BlogContext } from "../Screens/blog.page";
import axios from "axios";
import { API_BASE_URL } from "../api/post";
import { RiDeleteBin6Line } from "react-icons/ri";
import "../misc/blogpage.css";

interface CommentCardProps {
  index: number;
  leftVal: number;
  commentData: {
    comment: string;
    commented_by: {
      profile_picture: string;
      fullname: string;
      username: string;
    };
    commentedAt?: string;
    _id?: string;
    isReplyingLoaded?: boolean;
    childrenLevel: number;
    children?: string[];
  };
}

const CommentCard = ({ index, leftVal, commentData }: CommentCardProps) => {
  let {
    commented_by: {
      profile_picture,
      fullname,
      username: commented_by_username,
    },
    comment,
    _id,
    commentedAt,
    children = [],
  } = commentData;

  let {
    userAuth: { access_token, username },
  } = useContext(UserContext);

  const [isReplying, setReplying] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false); // สถานะของปุ่ม

  const context = useContext(BlogContext);

  if (!context) {
    return null;
  }

  let {
    blog,
    blog: {
      comments,
      activity,
      activity: { total_parent_comments = 0 } = {},
      comments: { results: commentArr } = { results: [] },
      author: { username: blog_author } = {},
    },
    setBlog,
    setTotalParentCommentsLoaded,
  } = context;

  const handleReplyClick = () => {
    if (!access_token) {
      return toast.error("เข้าสู่ระบบก่อนจะตอบกลับ");
    }
    setReplying((preVal) => !preVal);
  };

  const getParentIndex = () => {
    let startingPoint: number | undefined = index - 1;

    try {
      while (
        commentArr[startingPoint].childrenLevel >= commentData.childrenLevel
      ) {
        // while (
        //   startingPoint >= 0 &&
        //   commentArr[startingPoint].childrenLevel >= commentData.childrenLevel
        // ) {
        startingPoint--;
      }
    } catch {
      startingPoint = undefined;
    }

    return startingPoint;
  };

  const removeCommentsCards = (startingPoint: number, isDelete = false) => {
    if (commentArr[startingPoint]) {
      while (
        commentArr[startingPoint].childrenLevel > commentData.childrenLevel
      ) {
        commentArr.splice(startingPoint, 1);

        if (!commentArr[startingPoint]) {
          break;
        }
      }
    }

    if (isDelete) {
      let parentIndex = getParentIndex();

      if (parentIndex !== undefined) {
        commentArr[parentIndex].children = commentArr[
          parentIndex
        ].children.filter((child) => child !== _id);

        if (!commentArr[parentIndex].children.length) {
          commentArr[parentIndex].isReplyingLoaded = false;
        }
      }
      commentArr.splice(index, 1);
    }

    if (commentData.childrenLevel === 0 && isDelete) {
      setTotalParentCommentsLoaded((preVal) => preVal - 1);
    }
    setBlog({
      ...blog,
      comments: { results: commentArr },
      activity: {
        ...activity,
        total_parent_comments:
          total_parent_comments -
          (commentData.childrenLevel === 0 && isDelete ? 1 : 0),
      },
    });
  };

  const hideReplies = () => {
    commentData.isReplyingLoaded = false;
    removeCommentsCards(index + 1);
  };

  const loadReplies = ({ skip = 0, currentIndex = index }) => {
    if (commentArr[currentIndex].children.length) {
      hideReplies();

      axios
        .post(API_BASE_URL + "/create-blog/get-replies", {
          _id: commentArr[currentIndex]._id,
          skip,
        })
        .then(({ data: { replies } }) => {
          commentArr[currentIndex].isReplyingLoaded = true;

          console.log(replies);

          for (let i = 0; i < replies.length; i++) {
            replies[i].childrenLevel =
              commentArr[currentIndex].childrenLevel + 1;

            commentArr.splice(currentIndex + 1 + i + skip, 0, replies[i]);
          }

          setBlog({ ...blog, comments: { ...comments, results: commentArr } });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  // const deleteComment = (e: React.MouseEvent<HTMLButtonElement>) => {
  //   e.currentTarget.setAttribute("disabled", "true");

  //   axios
  //     .post(
  //       API_BASE_URL + "/create-blog/delete-comment",
  //       { _id },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${access_token}`,
  //         },
  //       }
  //     )
  //     .then(() => {
  //       e.currentTarget.removeAttribute("disabled");
  //       removeCommentsCards(index + 1, true);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // };

  // const deleteComment = async (e: React.MouseEvent<HTMLButtonElement>) => {
  //   // ปิดการใช้งานปุ่ม
  //   e.currentTarget.setAttribute("disabled", "true");

  //   console.log("Deleting comment with ID:", _id);

  //   try {
  //     // เรียก API เพื่อลบคอมเมนต์
  //     await axios.post(
  //       `${API_BASE_URL}/create-blog/delete-comment`,
  //       { _id },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${access_token}`,
  //         },
  //       }
  //     );

  //     // อัปเดตคอมเมนต์ใน state
  //     removeCommentsCards(index, true);

  //     // แจ้งผู้ใช้ว่าการลบคอมเมนต์เสร็จสิ้น
  //     alert("Comment deleted successfully.");
  //   } catch (err) {
  //     console.error(err);
  //     // แจ้งผู้ใช้หากเกิดข้อผิดพลาด
  //     alert("Failed to delete comment. Please try again.");
  //   } finally {
  //     // เปิดใช้งานปุ่มอีกครั้งไม่ว่าจะเกิดอะไรขึ้น
  //     e.currentTarget.removeAttribute("disabled");
  //   }
  // };

  const deleteComment = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsDisabled(true); // ปิดการใช้งานปุ่ม

    console.log("Deleting comment with ID:", _id);

    try {
      await axios.post(
        API_BASE_URL + "/create-blog/delete-comment",
        { _id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      removeCommentsCards(index, true);
    } catch (err) {
      console.error("Error deleting comment:", err);
    } finally {
      setIsDisabled(false); // เปิดการใช้งานปุ่มอีกครั้ง
    }
  };

  const LoadmoreRepliesButton = () => {
    let parentIndex = getParentIndex();

    let button = (
      <button
        className="p-2 px-3 d-flex align-items-center gap-2 LoadmoreRepliesButton"
        onClick={() =>
          loadReplies({
            skip: index - (parentIndex ?? 0),
            currentIndex: parentIndex,
          })
        }
      >
        การตอบกลับเพิ่มเติม
      </button>
    );

    if (commentArr[index + 1]) {
      if (
        commentArr[index + 1].childrenLevel < commentArr[index].childrenLevel
      ) {
        if (
          index - (parentIndex ?? 0) <
          commentArr[parentIndex ?? 0].children.length
        ) {
          return button;
        }
      }
    } else {
      if (parentIndex) {
        if (
          index - (parentIndex ?? 0) <
          commentArr[parentIndex ?? 0].children.length
        ) {
          return button
        }
      }
    }
  };

  return (
    <div className="w-100" style={{ paddingLeft: `${leftVal * 10}px` }}>
      <div
        className="my-3 p-3"
        style={{ borderRadius: "0.375rem", border: "1px solid #f0f0f0" }}
      >
        <div className="d-flex gap-3 align-items-center mb-4">
          <img
            src={profile_picture}
            alt=""
            className="rounded-circle"
            style={{ width: "1.5rem", height: "1.5rem" }}
          />

          <p
            className="m-0"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: "1",
              overflow: "hidden",
            }}
          >
            {fullname} @{commented_by_username}
          </p>
          <p className="m-0" style={{ minWidth: "fit-content" }}>
            {getDay(commentedAt || "ไม่ทราบวันที่")}
          </p>
        </div>

        <p className="m-0 ml-3">{comment}</p>

        <div className="d-flex gap-3 align-items-center mt-2">
          {commentData.isReplyingLoaded ? (
            <button
              className="p-2 px-3 d-flex align-items-center gap-2 text-hide"
              onClick={hideReplies}
            >
              <FaRegCommentDots />
              ซ่อนการตอบกลับ
            </button>
          ) : (
            <button
              className="p-2 px-3 d-flex align-items-center gap-2 text-hide"
              onClick={() => loadReplies({ skip: 0 })}
            >
              <FaRegCommentDots />
              {children.length}ตอบกลับ
            </button>
          )}
          <button
            className="text-decoration-underline"
            onClick={handleReplyClick}
          >
            ตอบกลับ
          </button>

          {username === commented_by_username || username === blog_author ? (
            <button
              className="p-2 px-3 btn-delcomment d-flex align-items-center"
              onClick={deleteComment}
            >
              <RiDeleteBin6Line />
            </button>
          ) : (
            ""
          )}
        </div>

        {isReplying ? (
          <div className="mt-4">
            <CommentField
              action="ตอบกลับ"
              index={index}
              replyingTo={_id}
              setReplying={setReplying}
            />
          </div>
        ) : (
          ""
        )}
      </div>

      <LoadmoreRepliesButton />
    </div>
  );
};

export default CommentCard;
