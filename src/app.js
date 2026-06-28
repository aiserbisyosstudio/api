import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

app.use(helmet());
app.use(morgan("dev"));

app.use(
  cors({
    origin: [
      "https://www.aiserbisyosstudio.com",
      "https://aiserbisyosstudio.com",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.use(express.json());

import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import contactRouter from "./routes/contact.route.js";
import planRouter from "./routes/plan.route.js"

app.use("/api/v1/user", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/contact", contactRouter);
app.use("/api/v1/plan", planRouter);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to AI Serbisyos Studio api service...",
  });
});

app.get("/error", (req, res) => {
  try {
    throw new Error("Sample Error");
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

export default app;