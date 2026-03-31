const StudyHistory = require("../models/StudyHistory");
const StudyResource = require("../models/StudyResource");
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

async function createResource(req, res) {
  try {
    const { category, subcategory, title, type, url, description } = req.body;

    if (!category || !subcategory || !title || !type) {
      return res.status(400).json({
        message: "Category, subcategory, title, and type are required."
      });
    }

    const resource = await StudyResource.create({
      user: req.user.id,
      category: category.trim(),
      subcategory: subcategory.trim(),
      title: title.trim(),
      type,
      url: (url || "").trim(),
      description: (description || "").trim()
    });

    res.status(201).json({
      message: "Study resource saved successfully.",
      data: resource
    });
  } catch (error) {
    console.error("[study] createResource failed:", error.message);
    res.status(500).json({ message: "Could not save the study resource." });
  }
}

async function getResources(req, res) {
  try {
    const resources = await StudyResource.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.json({
      message: "Study resources fetched successfully.",
      data: resources
    });
  } catch (error) {
    console.error("[study] getResources failed:", error.message);
    res.status(500).json({ message: "Could not fetch study resources." });
  }
}

async function deleteResource(req, res) {
  try {
    const resource = await StudyResource.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!resource) {
      return res.status(404).json({ message: "Study resource not found." });
    }

    res.json({
      message: "Study resource deleted successfully."
    });
  } catch (error) {
    console.error("[study] deleteResource failed:", error.message);
    res.status(500).json({ message: "Could not delete the study resource." });
  }
}

module.exports = { askQuestion, getHistory, createResource, getResources, deleteResource };
