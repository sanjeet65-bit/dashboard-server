import { asyncHandler } from "../utlis/asynchandler.js";
import { ApiResponse } from "../utlis/apiResponse.js";
import { ApiError } from "../utlis/apiError.js";
import pool from "../config/db.js";
import { formatDate } from "../utlis/misc.js";
import fs from 'fs'
import csv from 'csv-parser'
import { application } from "express";


export const getYrQt = asyncHandler(async (req, res) => {

    const [result] = await pool.query("select * from incentive.incentivehd order by YrId desc")

    res.status(200).json(new ApiResponse(200, result, "Get Year Qtr on generated incentive"))

})


export const getPlans = asyncHandler(async (req, res) => {
    const { YrId, QtrId } = req?.query

    if (!YrId || !QtrId) {

        const [result] = await pool.execute(`select 
            SlDivCd,
            concat(YrId,'-',QtrId) as Quarter,
            Plan,
            IndexOrder,
            FromDt,
            ToDt,
            Title,
            SubTitle,
            Config,
            Forecast,
            Disbursement
            from incentive.incentive_plan order by YrId,QtrId,IndexOrder`
        );

        return res.status(200).json(new ApiResponse(200, result, "All Plans"))
    }

    const [result] = await pool.query("select * from incentive.q_i_planmst where YrId = ? and Qtr = ? order by YrId,Qtr,OrderIndex", [YrId, QtrId])

    if (result.length == 0) {
        return res.status(400).json(new ApiError(400, [], `No Plans for the YrId = ${YrId} and Qtr = ${QtrId}`))
    }

    res.status(200).json(new ApiResponse(200, result, "Plans for this Qtr."))

})


export const getExtScheme = asyncHandler(async (req, res) => {

    let { SlDivCd, MgCd } = req.user
    const yrid = req.body?.yrid
    const qtr = req.body?.qtr

    if (!yrid || !qtr) {
        return res.json(new ApiError(401, [], 'Please provide the {yrid} {qtr}..'))
    }

    const query = `call getExtaScheme('${SlDivCd}','${MgCd}','${yrid}','${qtr}')`


    const [result] = await pool.query(query)

    res.json(new ApiResponse(200, result, 'Additional scheme value..'))
})

export const getSaleReturn = asyncHandler(async (req, res) => {

    let { SlDivCd, MgCd } = req.user
    const yrid = req.body?.yrid
    const qtr = req.body?.qtr

    if (!yrid || !qtr) {
        return res.json(new ApiError(401, [], 'Please provide the {yrid} {qtr}..'))
    }


    const query = `call getSaleReturn('${SlDivCd}','${MgCd}','${yrid}','${qtr}')`


    const [result] = await pool.query(query)

    res.json(new ApiResponse(200, result, 'Additional scheme value..'))
})

export const getNrvRaw = asyncHandler(async (req, res) => {

    console.log(req.params)
    const { SlDivCd, MgCd } = req.user
    const { YrId, QtrId } = req?.query

    if (!YrId || !QtrId) {
        return res.status(400).json(new ApiError(400, [], "Please provide the prams YrId & QtrId "))
    }

    const query = `select * from incentive.q_nrvraw where Quarter= '${YrId}-${QtrId}' 
    and SlDivCd in ('${SlDivCd.split(",").join("','")}') 
    ${MgCd ? (` and MgCd like '${MgCd}%'`) : ('')}`


    const [result] = await pool.query(query)

    res.status(200).json(new ApiResponse(200, result, "NRV fetched."))

})


export const getIncentiveMahaMahurat = asyncHandler(async (req, res) => {

    const { SlDivCd, MgCd } = req.user
    const { YrId, QtrId } = req?.query

    if (!YrId || !QtrId) {
        return res.status(400).json(new ApiError(400, [], "Please provide the YrId & QtrId "))
    }


    const query = `
            select 
            a.SlDivCd,
            a.Quarter,
            a.MonthId,
            a.MgCd,
            b.MgName,
            round(a.AchievedTill9th,2) as AchievedTill9th,
            round(a.TotalAchived,2) as TotalAchived,
            round(a.Target,2) as Target,
            if(a.Target!=0 and a.AchievedTill9th>=a.Target,1,0) as TargetFlag,
            round(if(a.Target!=0 and a.AchievedTill9th>=a.Target,a.AchievedTill9th*3/100,0),2) as Incentive
            from incentive.q_mahamahurat as a
            left Join (select distinct SlDivCd,MgCd,MgName from greythr.mgmst) as b on a.SlDivCd=b.SlDivCd and a.MgCd=b.MgCd
            where Quarter= concat('${YrId}','-', '${QtrId}') 
            and a.SlDivCd in ('${SlDivCd.split(",").join("','")}') and a.MgCd<>'I' 
            ${MgCd ? (` and a.MgCd like '${MgCd}%'`) : ('')}
                `

    const [result] = await pool.query(query)

    res.status(200).json(new ApiResponse(200, result, "Plan One"))


})

export const getIncentivePlanOne = asyncHandler(async (req, res) => {

    const { SlDivCd, MgCd } = req.user
    const { YrId, QtrId } = req?.query
    const { MonthId } = req?.query

    if (!YrId || !QtrId) {
        return res.status(400).json(new ApiError(400, [], "Please provide the prams YrId & QtrId "))
    }

    const query = `
        select
        a.SlDivCd,
        a.Quarter,
        a.MonthId,
        a.MgCd,
        b.MgName,
        a.LYNrv,
        a.CYNrv,
        a.CYTarget,
        a.LYTarget
        from incentive.q_plan1  as a
        left join (select distinct SlDivCd,MgCd,MgName from perp2012.mgmst) as b on a.MgCd=b.MgCd and a.SlDivCd=b.SlDivCd
        where Quarter= concat('${YrId}','-', '${QtrId}')
        and a.SlDivCd in ('${SlDivCd.split(",").join("','")}') 
        and a.MgCd<>'I'
        ${MgCd ? (` and a.MgCd like '${MgCd}%'`) : ('')}`


    console.log(query)

    const [result] = await pool.query(query)

    res.status(200).json(new ApiResponse(200, result, "Plan One"))


})

export const getIncentivePlanTwo = asyncHandler(async (req, res) => {

    const { SlDivCd, MgCd } = req.user
    const { YrId, QtrId } = req?.query

    if (!YrId || !QtrId) {
        return res.status(400).json(new ApiError(400, [], "Please provide the prams YrId & QtrId "))
    }

    const query = `
            select a.SlDivCd,a.Quarter,a.MgCd,b.MgName,
                sum(LYNrv) as LYNrv,
                sum(CYNrv) as CYNrv,
                sum(CYTarget) as CYTarget,
                sum(LYTarget) as LYTarget,
                sum(LYNrv)>sum(LYTarget) as LYTrgtFlg,
                sum(CYNrv)>sum(CYTarget) as CYTrgtFlg,
                if(sum(LYNrv)>sum(LYTarget),sum(LYNrv)*0.90,sum(LYNrv)) as BaseValue,
                if(sum(CYNrv)>if(sum(LYNrv)>sum(LYTarget),sum(LYNrv)*0.90,sum(LYNrv)) , sum(CYNrv)-if(sum(LYNrv)>sum(LYTarget),sum(LYNrv)*0.90,sum(LYNrv)),0) as IncrmentalValue,
                (if(sum(CYNrv)>if(sum(LYNrv)>sum(LYTarget),sum(LYNrv)*0.90,sum(LYNrv)) , sum(CYNrv)-if(sum(LYNrv)>sum(LYTarget),sum(LYNrv)*0.90,sum(LYNrv)),0))*10/100 as Incentive
                from incentive.q_plan1 as a
                left Join (select distinct SlDivCd,MgCd,MgName from greythr.mgmst) as b on a.SlDivCd=b.SlDivCd and a.MgCd=b.MgCd

                    where Quarter= concat('${YrId}','-', '${QtrId}')
                    and a.SlDivCd in ('${SlDivCd.split(",").join("','")}') 
                    and a.MgCd<>'I' 
                    ${MgCd ? (` and a.MgCd like '${MgCd}%'`) : ('')}


                group by SlDivCd,Quarter,MgCd`






    const [result] = await pool.query(query)

    res.status(200).json(new ApiResponse(200, result, "Plan One"))


})

export const getIncentivePlanThree = asyncHandler(async (req, res) => {

    const { SlDivCd, MgCd } = req.user
    const { YrId, QtrId } = req?.query

    if (!YrId || !QtrId) {
        return res.status(400).json(new ApiError(400, [], "Please provide the prams YrId & QtrId "))
    }

    const query = `
                    select 
                    a.SlDivCd,
                    a.Quarter,
                    a.MgCd,
                    b.MgName,
                    a.MonthId,
                    a.NetSale,
                    a.NrvVal,
                    a.Target
                    from incentive.q_plan3 as a 
                    left Join (select distinct SlDivCd,MgCd,MgName from greythr.mgmst) as b on a.SlDivCd=b.SlDivCd and a.MgCd=b.MgCd
                    
                    where a.Quarter= concat('${YrId}','-', '${QtrId}')
                    and a.SlDivCd in ('${SlDivCd.split(",").join("','")}') 
                    and a.MgCd<>'I' 
                    ${MgCd ? (` and a.MgCd like '${MgCd}%'`) : ('')}`



    const [result] = await pool.query(query)

    res.status(200).json(new ApiResponse(200, result, "Plan One"))


})


export const getIncentivePlanFour = asyncHandler(async (req, res) => {

    const { SlDivCd, MgCd } = req.user
    const { YrId, QtrId } = req?.query

    if (!YrId || !QtrId) {
        return res.status(400).json(new ApiError(400, [], "Please provide the prams YrId & QtrId "))
    }


    const query = `select a.SlDivCd,
                    a.Quarter,
                    a.MgCd,
                    b.MgName,
                    a.MonthId,
                    a.MidMonthNetSale,
                    a.NetSale,
                    a.MidMonthNrv,
                    a.NrvVal,
                    a.Target,
                    a.MidMthAchivdPrcnt,
                    a.TrgtFlag,
                    a.Incentive 
                    from incentive.q_plan4 as a
                    left Join (select distinct SlDivCd,MgCd,MgName from greythr.mgmst) as b on a.SlDivCd=b.SlDivCd and a.MgCd=b.MgCd
                    where a.Quarter= concat('${YrId}','-', '${QtrId}')
                    and a.SlDivCd in ('${SlDivCd.split(",").join("','")}') 
                    and a.MgCd<>'I' 
                    ${MgCd ? (` and a.MgCd like '${MgCd}%'`) : ('')}`



    const [result] = await pool.query(query)

    res.status(200).json(new ApiResponse(200, result, "Incentive Plan Four Raw Data."))

})


export const getFinal = asyncHandler(async (req, res) => {
    const results = [];

    await new Promise((resolve, reject) => {
        fs.createReadStream('D:/IPL/alliplserver/Dashboard/Server/BONEVA/final.csv')
            .pipe(csv())
            .on('data', (row) => {
                results.push(row);
            })
            .on('end', () => {
                resolve();
            })
            .on('error', (err) => {
                reject(err);
            });
    });

    return res.json(new ApiResponse(200, results, 'Success'));
});









