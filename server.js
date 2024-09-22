const express = require("express");
const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const ApiError = require("./utils/api.error");
const dotenv = require("dotenv").config();
const cors = require("cors");

const globalError = require("./middlewares/error.middleware");
const dbConnection = require("./configs/db.config");

//ROUTES
const authRoutes = require("./routes/auth.routes");
const FieldRoutes = require("./routes/field.routes");
const contactUsRoutes = require("./routes/contactUs.routes");
const questionRoutes = require("./routes/question.routes.js");
const userRoutes = require("./routes/user.routes.js");
const bookRoutes = require("./routes/book.routes.js");
const videosRoutes = require("./routes/video.routes.js");
const consTicketRoutes = require("./routes/cons.tickets.routes.js");
const coursesRoutes = require("./routes/courses.routes.js");
const mentorRoutes = require("./routes/mentor.routes");

app.use(express.json());
app.use(cookieParser());

// DATABASE CONNECTION
dbConnection();

// LOGGING
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`Node: ${process.env.NODE_ENV}`);
}

// CORS
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:5173",
      "https://charity-platform-frontend.onrender.com",
      "https://charity-platform-frontend.vercel.app",
      "*",
    ],
  })
);

//Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/fields", FieldRoutes);
app.use("/api/contact-us", contactUsRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/videos", videosRoutes);
app.use("/api/cons-tickets", consTicketRoutes);
app.use("/api/mentors", mentorRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Global error handling middleware for express
app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});
app.use(globalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`App running running on port ${PORT}`);
});

// Handle rejection outside express
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
