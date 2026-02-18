import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import morgan from "morgan";
import helmet from "helmet";

// import routes
import userRoute from "./routes/userRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import productRoute from "./routes/productRoute.js";
import variantRoute from "./routes/variantRoute.js";
import cartRoute from "./routes/cartRoute.js";
// import orderRoute from "./routes/orderRoute.js";
// import paymentRoute from "./routes/paymentRoute.js";
// import shippingRoute from "./routes/shippingRoute.js";

dotenv.config();
const app = express();

// middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());

// routes
app.use("/api/users", userRoute);

// Admin Dashboard Routes
app.use("/api/categories", categoryRoute);
app.use("/api/products", productRoute);
app.use("/api/variants", variantRoute);
app.use("/api/cart", cartRoute);
// app.use("/api/orders", orderRoute);
// app.use("/api/payments", paymentRoute);
// app.use("/api/shippings", shippingRoute);

// home route
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
