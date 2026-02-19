import jwt from "jsonwebtoken";
import User from "../models/User.js"; 

// is logged in
export const isAuthenticated = async (req, res, next) => {
  let token = req.body.accessToken;

  if(!token){
    return res.status(401).json({
      success: false,
      message: "Access token is required"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    if (user.status === "inactive" || user.status === "suspended" || user.status === "blocked") {
      return res.status(401).json({
        success: false,
        message: `Your account has been ${user.status}. Please contact support for more information.`,
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// check user roles
export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized access",
    });
  }
  next();
};
