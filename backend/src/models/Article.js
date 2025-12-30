import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    sourceUrl: String,
    author: String,
    date: String,
    references: [String],
    isUpdated: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Article", ArticleSchema);
