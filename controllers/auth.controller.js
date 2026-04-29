import { asyncHandler } from "../utlis/asynchandler.js";
import { ApiResponse } from "../utlis/apiResponse.js";

import jwt from "jsonwebtoken";
import pool from "../config/db.js"
import bcrypt from "bcrypt"

export const login = async (req, res) => {
  const { UserId, Password } = req.body;

  const [user] = await pool.query("select * from logins where UserId = ?", [UserId])
  const [permission] = await pool.query(`select permission_id from role_permissions
  where role_id= ? `, [user[0]?.role_id])

  if (user.length == 0) {
    return res.status(401).json({ message: "User Not Found" });
  }

  if (user.IsActive == 1) {
    return res.status(403).json({ message: "User is not active." })
  }

  if (user.IsLocked == 1) {
    return res.status(403).json({ message: "User locked. Contact to Admin" })
  }

  const isMatch = await bcrypt.compare(Password, user[0]?.Password);

  if (isMatch == false) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  let data = user[0]
  data["permission"] = (permission.map(item => item.permission_id))
  delete data.Password

  const token = jwt.sign(
    { data },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  res.cookie('accessToken', token, {
    httpOnly: true,        // prevents JS access (XSS protection)
    secure: process.env.NODE_ENV === 'production', // only over HTTPS in prod
    sameSite: 'strict',    // CSRF protection
    maxAge: 24 * 60 * 60 * 1000 // 1 hour in milliseconds
  });

  res.cookie('refreshToken', token, {
    httpOnly: true,        // prevents JS access (XSS protection)
    secure: process.env.NODE_ENV === 'production', // only over HTTPS in prod
    sameSite: 'strict',    // CSRF protection
    maxAge: 24 * 60 * 60 * 1000 // 24 hour in milliseconds
  });

  return res.json(new ApiResponse(200, { user: user[0] }, 'Login Successful'));

};


// export const resetPassword = async (req, res) => {

//   const UserId = req.body.UserId
//   const NewPassword = req.body.NewPassword
//   const ConfirmPassword = req.body.ConfirmPassword

//   if (!NewPassword || !ConfirmPassword) {
//     return res.status(401).json({ message: "Blank Password" });
//   }

//   if (NewPassword !== ConfirmPassword) {
//     return res.status(401).json({ message: "New Password and Confirm Password does not match" });
//   }

//   const SaltRound = 10
//   const HashPassword = await bcrypt.hash(NewPassword, SaltRound)
//   const [SetPassword] = await pool.query("update logins set Password = ? where UserId = ?", [HashPassword, UserId])

//   if (SetPassword.changedRows = 0) {
//     return res.status(401).json({ message: "Error updatind password to db" });
//   }

//   res.status(200).json({ message: "New Password updated" })

// }


export const logout = asyncHandler(async (req, res) => {

  res.status(200).clearCookie('accessToken')
  res.status(200).clearCookie('refreshToken')

  return res.json(new ApiResponse(200, [], 'Success'))

})


