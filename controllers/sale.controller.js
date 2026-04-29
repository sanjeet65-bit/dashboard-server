import { asyncHandler } from "../utlis/asynchandler.js";
import { ApiResponse } from "../utlis/apiResponse.js";
import { ApiError } from "../utlis/apiError.js";
import { formatDate } from "../utlis/misc.js";

import pool from "../config/db.js";



const sale = asyncHandler(async (req, res) => {
    const { SlDivCd, MgCd } = req.user;
    const now = new Date();
    let { fromdate, todate } = req.body || {};



    // If dates not provided, set defaults
    if (!fromdate) {
        fromdate = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
    }

    if (!todate) {
        todate = formatDate(now);
    }

    const query = `SELECT 
        invhd.InvId,
        invhd.InvDt,
        invhd.SlDivCd,
        invhd.CustCd,
        custmst.CustName,
        invhd.SchmCd,
        custac.MgCd,
        mgmst.MgName,
        invhd.TotCostVal,
        invhd.TotBsVal,
        invhd.TotDsVal,
        invhd.TotTcVal,
        invhd.RndOffVal,
        invhd.TotVal
        FROM invhd 
        left join custac on custac.CustCd = invhd.CustCd and custac.OpLocCd=invhd.LocCd and custac.SlDivCd=invhd.SlDivCd
        left join perp2012.custmst on custmst.CustCd=invhd.CustCd
        left join (select distinct MgCd,MgName from mgmst) as mgmst on mgmst.MgCd=custac.MgCd
        where invhd.SlDivCd in ('${SlDivCd.split(",").join("','")}') 
        and  invdt BETWEEN '${fromdate}' AND '${todate}' 
        and invhd.MgCd <>'I' 
        ${MgCd ? (` and custac.mgcd like '${MgCd}%'`) : ('')}`

    const [result] = await pool.query(query)

    return res.json(new ApiResponse(200, result, "Sale Data"));
});


const salereturn = asyncHandler(async (req, res) => {

    const { SlDivCd, MgCd } = req.user;
    const now = new Date();
    let { fromdate, todate } = req.body || {};

    // If dates not provided, set defaults
    if (!fromdate) {
        fromdate = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
    }

    if (!todate) {
        todate = formatDate(now);
    }

    const query = `SELECT 
        srnhd.SrnId,
        srnhd.SrnDt,
        srnhd.SlDivCd,
        srnhd.CustCd,
        custmst.CustName,
        custac.MgCd,
        mgmst.MgName,
        srnhd.TotCostVal,
        srnhd.TotBsVal,
        srnhd.TotDsVal,
        srnhd.TotTcVal,
        srnhd.RndOffVal,
        srnhd.TotVal
        FROM srnhd 
        left join custac on custac.CustCd = srnhd.CustCd and custac.OpLocCd=srnhd.LocCd and custac.SlDivCd=srnhd.SlDivCd
        left join perp2012.custmst on custmst.CustCd=srnhd.CustCd
        left join (select distinct MgCd,MgName from mgmst) as mgmst on mgmst.MgCd=custac.MgCd
        where 
        srnhd.SlDivCd in ('${SlDivCd.split(",").join("','")}') 
        and  SrnDt BETWEEN '${fromdate}' AND '${todate}' 
        ${MgCd ? (` and custac.mgcd like '${MgCd}%'`) : ('')}`

    const [result] = await pool.query(query)

    return res.json(new ApiResponse(200, result, "Sale Data"));

})


const collection = asyncHandler(async (req, res) => {
    const { SlDivCd, MgCd } = req.user;
    const now = new Date();
    let { fromdate, todate } = req.body || {};
    // If dates not provided, set defaults
    if (!fromdate) {
        fromdate = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
    }
    if (!todate) {
        todate = formatDate(now);
    }



    const query = `This is query`

    res.send(query)



})


const getTarget = asyncHandler(async (req, res) => {

    const { SlDivCd, MgCd } = req.user;
    const now = new Date();
    let { fromdate, todate } = req.body || {};
    // If dates not provided, set defaults
    if (!fromdate) {
        fromdate = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
    }
    if (!todate) {
        todate = formatDate(now);
    }

    const query = `select 
        PlYrId,
        SlDivCd,
        MgCd,
        PlMthId,
        ItemCd,
        BdgQty,
        BdgRt,
        BdgVal
    from mktbdgdt where STR_TO_DATE(CONCAT(PlMthId,'/01'), '%Y/%m/%d') between '${fromdate}' and '${todate}' 
    and SlDivCd in ('${SlDivCd.split(",").join("','")}') 
    ${MgCd ? (` and mgcd like '${MgCd}%'`) : ('')}`

    const [result] = await pool.query(query)

    return res.status(200).json(new ApiResponse(200, result, "Taget data of the month.."))

})




export { sale, salereturn, collection, getTarget };
