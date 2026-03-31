const express = require("express");
const {
  askQuestion,
  getHistory,
  createResource,
  getResources,
  deleteResource
} = require("../controllers/studyController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/ask", protect, askQuestion);
router.get("/history", protect, getHistory);
router.post("/resources", protect, createResource);
router.get("/resources", protect, getResources);
router.delete("/resources/:id", protect, deleteResource);

module.exports = router;
