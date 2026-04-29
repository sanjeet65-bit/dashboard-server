import pool from "../config/db.js";
import bcrypt from "bcrypt";
import { ApiResponse } from "../utlis/apiResponse.js";
import { ApiError } from "../utlis/apiError.js";
import { asyncHandler } from "../utlis/asynchandler.js";

export const getProfile = asyncHandler(async (req, res) => {
    try {

        const userId = req.user.UserId

        const [data] = await pool.query(`select logins.*,mgmst.MgName 
                    from logins 
                    left join mis_app.mgmst on mgmst.EmpNo=logins.EmpNo where userid = ?`, [userId])

        return res.json(new ApiResponse(200, data, 'Profile Fetched'))
    }
    catch (err) {

        return res.json(new ApiError(400, 'Unable to Fetch data from DB.', [err]))

    }
})

export const getMenuItems = asyncHandler(async (req, res) => {
    const User = req.user

    const [result] = await pool.query(`select mt.parent,
	    mt.label,
        mt.component,
        mt.path,
        mt.permission_id,
        mt.display_order,
        mt.is_active from menu_items as mt
    left join role_permissions as rp on rp.permission_id=mt.permission_id
    where rp.role_id= ?`, [User.role_id])

    return res.json(new ApiResponse(200, result, 'Sucess'))

})

export const setPassword = asyncHandler(async (req, res) => {

    const UserId = req.user.UserId
    const NewPassword = req.body.NewPassword
    const ConfirmPassword = req.body.ConfirmPassword
    if (!NewPassword || !ConfirmPassword) {
        return res.status(401).json({ message: "Blank Password" });
    }
    if (NewPassword !== ConfirmPassword) {
        return res.status(401).json({ message: "New Password and Confirm Password does not match" });
    }

    const SaltRound = 10
    const HashPassword = await bcrypt.hash(NewPassword, SaltRound)
    const [SetPassword] = await pool.query("update logins set Password = ? where UserId = ?", [HashPassword, UserId])
    if (SetPassword.changedRows = 0) {
        return res.status(401).json({ message: "Error updatind password to db" });
    }
    res.status(200).json({ message: "New Password updated" })

})

export const resetPassword = asyncHandler(async (req, res) => {


    
    console.log(req.body)
    const UserId = req.body.UserId
    const NewPassword = req.body.NewPassword
    const ConfirmPassword = req.body.ConfirmPassword


    if (!NewPassword || !ConfirmPassword) {
        return res.status(401).json(new ApiError(401,[],"Blank password"));
    }

    if (NewPassword !== ConfirmPassword) {
        return res.status(401).json(new ApiError(401,[],"New Password and Confirm Password does not match"));
    }

    const SaltRound = 10
    const HashPassword = await bcrypt.hash(NewPassword, SaltRound)
    const [SetPassword] = await pool.query("update logins set Password = ? where UserId = ?", [HashPassword, UserId])

    if (SetPassword.changedRows = 0) {
        return res.status(401).json({ message: "Error updatind password to db" });
    }

    res.status(200).json(new ApiResponse(200,[],"Password reset successfully"))

})