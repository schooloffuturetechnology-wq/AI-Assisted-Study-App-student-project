const mongoose = require("mongoose");

const studyHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      trim: true,
      default: "General"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("StudyHistory", studyHistorySchema);
