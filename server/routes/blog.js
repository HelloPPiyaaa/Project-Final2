const express = require("express");
const { verify } = require("jsonwebtoken");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Blog = require("../models/blog");
const Notifications = require("../models/notifaications");
const Comment = require("../models/comments");
const notifaications = require("../models/notifaications");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token === null) {
    return res.status(401).json({ error: "ไม่มี token การเข้าถึง" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "การเข้าถึง token ไม่ถูกต้อง" });
    }

    req.user = user.id;
    next();
  });
};

router.post("/", verifyJWT, (req, res) => {
  const { nanoid } = require("nanoid");
  let authorId = req.user;
  let { topic, des, banner, tags, content, draft, id } = req.body;

  if (!topic || topic.length === 0) {
    return res.status(403).json({ error: "คุณต้องระบุชื่อบล็อก" });
  }

  if (!draft) {
    if (!des || des.length === 0 || des.length > 200) {
      return res
        .status(403)
        .json({ error: "คุณต้องอธิบายบล็อกต่ำกว่า 200 ตัวอักษร" });
    }

    if (!banner || banner.length === 0) {
      return res
        .status(403)
        .json({ error: "คุณต้องใส่หน้าปกเพื่อเผยแพร่บล็อก" });
    }

    if (!content.blocks.length) {
      return res.status(403).json({ error: "ต้องมีเนื้อหาบล็อกเพื่อเผยแพร่" });
    }

    if (!tags || tags.length === 0 || tags.length > 10) {
      return res
        .status(403)
        .json({ error: "ใส่แท็กในรายการเพื่อเผยแพร่บล็อก สูงสุด 10 แท็ก" });
    }
  }

  tags = tags.map((tag) => tag.toLowerCase());

  let blog_id =
    id ||
    topic
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\s+/g, "-")
      .trim() + nanoid();

  if (id) {
    Blog.findOneAndUpdate(
      { blog_id },
      { topic, des, banner, content, tags, draft: draft ? draft : false }
    )
      .then(() => {
        return res.status(200).json({ id: draft });
      })
      .catch((err) => {
        return res
          .status(500)
          .json({ error: "ไม่สามารถอัปเดตจำนวนโพสต์ทั้งหมดได้" });
      });
  } else {
    let blog = new Blog({
      topic,
      des,
      banner,
      content,
      tags,
      author: authorId,
      blog_id,
      draft: Boolean(draft),
    });

    blog
      .save()
      .then((blog) => {
        let incrementVal = draft ? 0 : 1;
        User.findOneAndUpdate(
          { _id: authorId },
          {
            $inc: { total_posts: incrementVal },
            $push: { blogs: blog._id },
          }
        )
          .then((user) => {
            return res.status(200).json({ id: blog.blog_id });
          })
          .catch((err) => {
            return res
              .status(500)
              .json({ error: "ข้อผิดพลาดในการอัพเดตเลขจำนวนโพสต์" });
          });
      })
      .catch((err) => {
        console.error("Error occurred:", err);
        return res.status(500).json({
          error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
          details: err.message,
        });
      });
  }
});

router.post("/get-blog", (req, res) => {
  let { blog_id, draft, mode } = req.body;

  let incrementVal = mode !== "edit" ? 1 : 0;

  Blog.findOneAndUpdate(
    { blog_id },
    { $inc: { "activity.total_reads": incrementVal } }
  )
    .populate("author", "fullname username profile_picture")
    .select("topic des content banner activity publishedAt blog_id tags")
    .then((blog) => {
      User.findOneAndUpdate(
        { username: blog.author.username },
        { $inc: { total_reads: incrementVal } }
      ).catch((err) => {
        return res.status(500).json({ error: err.message });
      });

      if (blog.draft && !draft) {
        return res.status(500).json({ error: err.message });
      }

      return res.status(200).json({ blog });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

router.post("/like-blog", verifyJWT, (req, res) => {
  let user_id = req.user;

  let { _id, islikedByUser } = req.body;

  let incrementVal = !islikedByUser ? 1 : -1;

  Blog.findOneAndUpdate(
    { _id },
    { $inc: { "activity.total_likes": incrementVal } }
  ).then((blog) => {
    if (!islikedByUser) {
      let like = new Notifications({
        type: "like",
        blog: _id,
        notification_for: blog.author,
        user: user_id,
      });

      like.save().then((notifications) => {
        return res.status(200).json({ liked_by_user: true });
      });
    } else {
      Notifications.findOneAndDelete({ user: user_id, blog: _id, type: "like" })
        .then((data) => {
          return res.status(200).json({ liked_by_user: false });
        })
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });
    }
  });
});

router.post("/save-blog", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { _id, issavedByUser } = req.body;

  // กำหนดค่าเพิ่มหรือลดจำนวน saves
  let incrementVal = !issavedByUser ? 1 : -1;

  Blog.findOneAndUpdate(
    { _id },
    { $inc: { "activity.total_saves": incrementVal } },
    { new: true }
  )
    .then((blog) => {
      if (!blog) {
        return res.status(404).json({ error: "Blog not found" });
      }

      return res.status(200).json({ saved_by_user: !issavedByUser });
    })
    .catch((err) => {
      return res.status(500).json({ error: "Failed to update blog" });
    });
});

router.post("/isliked-by-user", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { _id } = req.body;

  Notifications.exists({ user: user_id, type: "like", blog: _id })
    .then((result) => {
      return res.status(200).json({ result });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

router.post("/add-comment", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { _id, comment, blog_author, replying_to } = req.body;

  if (!comment.length) {
    return res
      .status(403)
      .json({ error: "เขียนอะไรบางอย่างเพื่อแสดงความคิดเห็น" });
  }
  let commentObj = {
    blog_id: _id,
    blog_author,
    comment,
    commented_by: user_id,
  };

  if (replying_to) {
    commentObj.parent = replying_to;
    commentObj.isReply = true;
  }

  new Comment(commentObj).save().then(async (commentFile) => {
    let { comment, commentedAt, children } = commentFile;

    Blog.findOneAndUpdate(
      { _id },
      {
        $push: { comments: commentFile._id },
        $inc: {
          "activity.total_comments": 1,
          "activity.total_parent_comments": replying_to ? 0 : 1,
        },
      }
    ).then((blog) => {
      console.log("แสดงความคิดเห็นแล้ว!");
    });

    let notifaicationObj = {
      type: replying_to ? "reply" : "comment",
      blog: _id,
      notification_for: blog_author,
      user: user_id,
      comment: commentFile._id,
    };

    if (replying_to) {
      notifaicationObj.replied_on_comment = replying_to;

      await Comment.findOneAndUpdate(
        { _id: replying_to },
        { $push: { children: commentFile._id } }
      ).then((replyingToCommentDoc) => {
        notifaicationObj.notification_for = replyingToCommentDoc.commented_by;
      });
    }

    new Notifications(notifaicationObj)
      .save()
      .then((notifaications) => console.log("แจ้งเตือนใหม่!!"));

    return res.status(200).json({
      comment,
      commentedAt,
      _id: commentFile._id,
      user_id,
      children,
    });
  });
});

router.post("/get-blog-comments", (req, res) => {
  let { blog_id, skip } = req.body;

  let maxLimit = 5;

  Comment.find({ blog_id, isReply: false })
    .populate("commented_by", "username fullname profile_picture")
    .skip(skip)
    .limit(maxLimit)
    .sort({
      commentedAt: -1,
    })
    .then((comment) => {
      return res.status(200).json(comment);
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

router.post("/get-replies", (req, res) => {
  let { _id, skip } = req.body;

  let maxLimit = 5;

  Comment.findOne({ _id })
    .populate({
      path: "children",
      option: {
        limit: maxLimit,
        skip: skip,
        sort: { commentedAt: -1 },
      },
      populate: {
        path: "commented_by",
        select: "profile_picture username fulname",
      },
      select: "-blog_id -updatedAt",
    })
    .select("children")
    .then((doc) => {
      return res.status(200).json({ replies: doc.children });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

const deleteComments = (_id) => {
  Comment.findOneAndDelete({ _id })
    .then((comment) => {
      if (comment.parent) {
        Comment.findOneAndUpdate(
          { _id: comment.parent },
          { $pull: { children: _id } }
        )
          .then((data) => console.log("comment delete from parent"))
          .catch((err) => console.log(err));
      }
      Notifications.findOneAndDelete({ comment: _id }).then((notification) =>
        console.log("comment notification deleted")
      );

      Notifications.findOneAndUpdate(
        { reply: _id },
        { $unset: { reply: 1 } }
      ).then((notifications) => console.log("reply notification deleted"));

      Blog.findOneAndUpdate(
        { _id: comment.blog_id },
        {
          $pull: { comments: _id },
          $inc: { "activity.total_comments": -1 },
          "activity.total_parent_comments": comment.parent ? 0 : -1,
        }
      ).then((blog) => {
        if (comment.children.length) {
          comment.children.map((replies) => {
            deleteComments(replies);
          });
        }
      });
    })
    .catch((err) => {
      console.log(err.message);
    });
};

router.post("/delete-comment", verifyJWT, (req, res) => {
  let user_id = req.user;

  let { _id } = req.body;

  Comment.findOne({ _id }).then((comment) => {
    if (
      comment.commented_by.equals(user_id) ||
      comment.blog_author.equals(user_id)
    ) {
      deleteComments(_id);

      return res.status(200).json({ status: "done" });
    } else {
      return res.status(403).json({ error: "คุณไม่สามารถลบความคิดเห็นได้" });
    }
  });
});

let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

router.post("/change-password", verifyJWT, (req, res) => {
  let { currentPassword, newPassword, ChecknewPassword } = req.body;

  if (
    !passwordRegex.test(currentPassword) ||
    !passwordRegex.test(newPassword) ||
    !passwordRegex.test(ChecknewPassword)
  ) {
    return res.status(403).json({
      error:
        "รหัสผ่านควรมีความยาว 6-20 ตัวอักษร พร้อมตัวเลข ตัวพิมพ์เล็ก 1 ตัว ตัวพิมพ์ใหญ่ 1 ตัว",
    });
  }

  if (newPassword !== ChecknewPassword) {
    return res.status(403).json({ error: "รหัสผ่านใหม่ไม่ตรงกัน" });
  }
  User.findOne({ _id: req.user })
    .then((user) => {
      if (user.google_auth) {
        return res.status(403).json({
          error:
            "คุณไม่สามารถเปลี่ยนรหัสผ่านของบัญชีนี้ได้เพราะคุณเข้าสู่ระบบผ่าน Google",
        });
      }

      bcrypt.compare(currentPassword, user.password, (err, result) => {
        if (err) {
          return res.status(500).json({
            error:
              "เกิดข้อผิดพลาดบางอย่างขณะบันทึกรหัสผ่านใหม่ โปรดลองอีกครั้งภายหลัง",
          });
        }

        if (!result) {
          return res.status(403).json({ error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" });
        }

        bcrypt.hash(newPassword, 10, (err, hashed_password) => {
          User.findOneAndUpdate(
            { _id: req.user },
            { password: hashed_password }
          )
            .then((u) => {
              return res.status(200).json({ status: "เปลี่ยนรหัสผ่านแล้ว" });
            })
            .catch((err) => {
              return res.status(500).json({
                error:
                  "เกิดข้อผิดพลาดบางอย่างขณะบันทึกรหัสผ่านใหม่ โปรดลองอีกครั้งภายหลัง",
              });
            });
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "หาผู้ใช้ไม่พบ" });
    });
});

module.exports = router;
