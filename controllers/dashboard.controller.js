import { asyncHandler } from "../utlis/asynchandler.js"
import { ApiResponse } from "../utlis/apiResponse.js"
import { ApiError } from "../utlis/apiError.js"
import pool from "../config/db.js"




const saleTrend = asyncHandler(async (req, res) => {

    const { SlDivCd, MgCd } = req.user
    let lastNoOfday = req.body?.lastNoOfday

    if (!lastNoOfday) {

        lastNoOfday = 100

    }

    const query = `select
    SlDivCd,MgCd,InvDt,sum(TotBsVal) as TotBsVal
    FROM invhd WHERE SlDivCd in ('${SlDivCd.split(",").join("','")}') 
    and InvDt>= date_sub(curdate(), interval ${Number(lastNoOfday)} day)
    AND CustCd IN (select CustCd from custac where SlDivCd in ('${SlDivCd.split(",").join("','")}') 
   ${MgCd ? (` and mgcd like '${MgCd}%'`) : ('')}) 
    group by SlDivCd,MgCd,InvDt`



    const q = `select invhd.SlDivCd,custac.MgCd,invhd.InvDt ,sum(invhd.TotBsVal) as TotBsVal from invhd
                left join custac on invhd.CustCd=custac.CustCd and invhd.SlDivCd=custac.SlDivCd and invhd.LocCd=custac.OpLocCd
                where custac.SlDivCd in ('${SlDivCd.split(",").join("','")}')
                and invhd.invdt>date_sub(curdate(), interval ${lastNoOfday} day)
                ${MgCd ? (` and custac.mgcd like '${MgCd}%' `) : (' ')}
                group by invhd.SlDivCd,custac.MgCd,invhd.InvDt`



    const [result] = await pool.query(q)


    return res.json(new ApiResponse(200, result, "Sale Trend"))

})

export { saleTrend }