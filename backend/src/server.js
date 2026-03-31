const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[server] Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("[server] Failed to start server:", error.message);
    process.exit(1);
  });
