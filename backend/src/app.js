const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const studyRoutes = require("./routes/studyRoutes");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*"
  })
);
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/health", (req, res) => {
  res.json({
    message: "AI Study Assistant API is running.",
    provider: process.env.GEMINI_API_KEY ? "gemini" : "fallback",
    database: process.env.USE_MEMORY_DB === "true" ? "memory" : "mongodb"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/study", studyRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.get("/:page(login|signup|dashboard|history).html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", `${req.params.page}.html`));
});

app.use((err, req, res, next) => {
  console.error("[app] Unhandled error:", err);
  res.status(500).json({
    message: "Something went wrong on the server."
  });
});

module.exports = app;
