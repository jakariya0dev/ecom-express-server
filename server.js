import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import morgan from "morgan";
import helmet from "helmet";

// import routes
import userRouter from "./routes/userRoute.js";

dotenv.config();
const app = express();

// middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());

// routes
app.use("/api/users", userRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

// connect to database and start the server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
