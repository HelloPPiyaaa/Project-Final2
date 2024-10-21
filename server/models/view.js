const mongoose = require("mongoose");

const viewSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    total_reads: {
      type: Number,
      default: 0,
    },
    month: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

viewSchema.statics.incrementViewCount = async function (blogId) {
  const currentMonth = new Date().toLocaleString("default", { month: "short" });
  const currentYear = new Date().getFullYear();

  const view = await this.findOneAndUpdate(
    { blog: blogId, month: currentMonth, year: currentYear },
    { $inc: { total_reads: 1 } },
    { new: true, upsert: true }
  );

  return view;
};

const View = mongoose.model("View", viewSchema);

module.exports = View;
