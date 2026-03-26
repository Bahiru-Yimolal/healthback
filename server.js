const dotenv = require("dotenv");
dotenv.config({ path: "./src/config/.env" });
const app = require("./src/app");
const sequelize = require("./src/config/database");
const fs = require("fs");
const path = require("path");

// --- STARTUP KILL SWITCH CHECK ---
const stateFilePath = path.join(__dirname, ".sys_state");
if (fs.existsSync(stateFilePath)) {
  const sysState = fs.readFileSync(stateFilePath, "utf8").trim();
  if (sysState === "0") {
    console.error("CRITICAL: System is in LOCKED state. Exiting...");
    process.exit(1);
  }
}
// ---------------------------------

const PORT = process.env.PORT || 5000;
const http = require("http");
const socketUtil = require("./src/utils/socket");

const server = http.createServer(app);

sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log("Database synced successfully");

    // Sync Permissions from code configuration
    const syncPermissions = require("./src/utils/permissionSync");
    await syncPermissions();

    // Initialize Global Socket
    socketUtil.init(server);
    console.log("Socket.io initialized successfully");

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    require("./src/utils/scherduler");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });
