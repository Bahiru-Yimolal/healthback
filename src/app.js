const express = require("express");
const userRoutes = require("./routes/userRoutes");
const subcityRoutes = require("./routes/subcityRoutes");
const healthCenterRoutes = require("./routes/healthCenterRoutes");
const cityRoutes = require("./routes/cityRoutes");
const communityUnitRoutes = require("./routes/communityUnitRoutes");
const familyRoutes = require("./routes/familyRoutes");
const visitRoutes = require("./routes/visitRoutes");
const referralRoutes = require("./routes/referralRoutes");
const reportRoutes = require("./routes/reportRoutes");
const assessmentRoutes = require("./routes/assessmentsRoutes");
const supervisionRoutes = require("./routes/supervisionRoutes");
const beneficiaryRoutes = require("./routes/beneficiaryRoutes");
const { errorMiddleware } = require("./middlewares/errorMiddleware");
const cors = require("cors");
const { swaggerUi, swaggerSpec } = require("./config/swagger");
const path = require("path");

const i18nMiddleware = require("./middlewares/i18nMiddleware");
const app = express();

app.use(cors());
app.use(express.json());
app.use(i18nMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/users", userRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/subcities", subcityRoutes);
app.use("/api/health-centers", healthCenterRoutes);
app.use("/api/community-units", communityUnitRoutes);
app.use("/api/families", familyRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/supervision", supervisionRoutes);
app.use("/api/beneficiaries", beneficiaryRoutes);

app.use(errorMiddleware);

module.exports = app;
