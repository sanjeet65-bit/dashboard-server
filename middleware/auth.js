import jwt from "jsonwebtoken"
import { ApiResponse } from "../utlis/apiResponse.js";
import { ApiError } from "../utlis/apiError.js";


export function auth(req, res, next) {
  let token;

  // 1️⃣ Try cookie
  if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  // 2️⃣ Fallback to Authorization header
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.json(new ApiError(401, [], "Token Expired.."));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.data;
    next();
  } catch (err) {
    return res.json(new ApiError(401, [], 'Unauthorized'));
  }
}



export function verifyme(req, res) {
  let token;
  // 1️⃣ Try cookie
  if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  // 2️⃣ Fallback to Authorization header
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.json(new ApiResponse(200, decoded.data, 'success'))
  } catch (err) {
    // return res.status(401).json({ message: "Invalid or expired token", success: false });
    res.json(new ApiError(400))
  }
}

