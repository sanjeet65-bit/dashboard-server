import { ApiResponse } from "../utlis/apiResponse.js";
import { ApiError } from "../utlis/apiError.js";
import { asyncHandler } from "../utlis/asynchandler.js";
import pool from "../config/db.js";


const allCustomers = asyncHandler(async (req, res) => {

    const { SlDivCd, MgCd } = req.user;

    const query = `select ac.CustCd,mst.CustName,ac.SlDivCd,ac.MgCd,mg.MgName,mst.IsRecClsd,mst.StopInv,ac.IsRecClsd from custac as ac
        left join custmst as mst on ac.CustCd=mst.CustCd 
        left join mgmst as mg on ac.MgCd=mg.MgCd
        where mst.IsRecClsd=0 and mst.StopInv=0 and ac.IsRecClsd=0 
        and ac.SlDivCd in ('${SlDivCd.split(",").join("','")}') 
        ${MgCd ? (` and ac.mgcd like '${MgCd}%'`) : ('')}`

    const [result] = await pool.query(query)

    return res.json(new ApiResponse(200, result, 'All Active Customer of your division.'))


})

const customer = asyncHandler(async (req, res) => {

    const { CustCd } = req.body;

    if (!CustCd){
        return res.status(404).json(new ApiError(404,[],"Please provide the CustCd code in body"))
    }

    const query = `select ac.CustCd,mst.CustName,ac.SlDivCd,ac.MgCd,mg.MgName,mst.IsRecClsd,mst.StopInv,ac.IsRecClsd from custac as ac
        left join custmst as mst on ac.CustCd=mst.CustCd 
        left join mgmst as mg on ac.MgCd=mg.MgCd
        where ac.CustCd = '${CustCd}'`

    const [result] = await pool.query(query)

    return res.json(new ApiResponse(200, result, 'All Active Customer of your division.'))


})





export { allCustomers, customer }