const StudyHistory = require("../models/StudyHistory");
const { generateStudyExplanation } = require("../services/aiService");

async function askQuestion(req, res) {
  try {
    const { question, subject } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question is required." });
    }

    const answer = await generateStudyExplanation(question, subject);

    const savedHistory = await StudyHistory.create({
      user: req.user.id,
      question,
      answer,
      subject: subject || "General"
    });

    res.status(201).json({
      message: "Study answer generated successfully.",
      data: savedHistory
    });
  } catch (error) {
    console.error("[study] askQuestion failed:", error.message);
    res.status(500).json({ message: "Could not process the study question." });
  }
}

async function getHistory(req, res) {
  try {
    const history = await StudyHistory.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.json({
      message: "Study history fetched successfully.",
      data: history
    });
  } catch (error) {
    console.error("[study] getHistory failed:", error.message);
    res.status(500).json({ message: "Could not fetch study history." });
  }
}

module.exports = { askQuestion, getHistory };
