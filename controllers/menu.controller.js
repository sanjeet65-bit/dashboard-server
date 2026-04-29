import pool from "../config/db.js";
import { ApiResponse } from "../utlis/apiResponse.js";
import { ApiError } from "../utlis/apiError.js";
import { asyncHandler } from "../utlis/asynchandler.js";


const Menu = asyncHandler(async(req,res)=>{
    const User = req.user

    const [result] = await pool.query(`select mt.parent,
	    mt.label,
        mt.component,
        mt.path,
        mt.permission_id,
        mt.display_order,
        mt.is_active from menu_items as mt
    left join role_permissions as rp on rp.permission_id=mt.permission_id
    where rp.role_id= ?`,[User.role_id])

    return res.json(new ApiResponse(200,result,'Sucess'))

})

export {Menu}