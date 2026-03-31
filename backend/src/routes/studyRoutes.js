const express = require("express");
const { askQuestion, getHistory } = require("../controllers/studyController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/ask", protect, askQuestion);
router.get("/history", protect, getHistory);

module.exports = router;
