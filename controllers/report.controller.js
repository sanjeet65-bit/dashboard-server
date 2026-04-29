import { ApiResponse } from "../utlis/apiResponse.js";
import { ApiError } from "../utlis/apiError.js";
import { asyncHandler } from "../utlis/asynchandler.js";
import pool from "../config/db.js";


export const getAllReports = asyncHandler(async (req, res) => {


    const [rows] = await pool.query(`SELECT MAP.role_id,MAP.report_id,RPS.description FROM REPORT_MAPPING AS MAP
                                    LEFT JOIN REPORTS RPS ON RPS.REPORT_ID=MAP.REPORT_ID
                                    WHERE MAP.ROLE_ID = ?`, [req.user.role_id]);


    res.json(new ApiResponse(200, rows, "All reports fetched successfully"));
});


export const getRmWiseReport = asyncHandler(async (req, res) => {

    const { SlDivCd, MgCd } = req.user;


    const query = `select * from jpl_warehouse.report_RMF01 where SlDivCd in ('${SlDivCd.split(",").join("','")}')
    ${MgCd ? (` and mgcd like '${MgCd}%'`) : ('')}`

    const [result] = await pool.execute(query);
    if (result.length === 0) {
        throw new ApiError(404, "Report not found");
    }
    res.json(new ApiResponse(200, result, "Report fetched successfully"));
});





