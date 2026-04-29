import { ApiResponse } from "../utlis/apiResponse.js";
import { ApiError } from "../utlis/apiError.js";
import { asyncHandler } from "../utlis/asynchandler.js";
import pool from "../config/db.js";

export const getDoctorMst = asyncHandler(async (req, res) => {

    const { UserId, SlDivCd, MgCd } = req.user;

    let query;

    if (SlDivCd && !MgCd) {
        query = `select 
            docmst.SldivCd,
            docmst.MgCd,
            mgmst.MgName,
            docmst.DoctCd,
            docmst.HqMstId,
            hqmst.HeadQrt,
            docmst.DoctName,
            docmst.DocQualification,
            docmst.Speciality,
            docmst.AddLine1,
            docmst.AddLine2,
            docmst.AddLine3,
            docmst.City,
            docmst.Pincode,
            docmst.Telno,
            docmst.Mobile,
            docmst.Email,
            docmst.IsUpdated
            from docmst
            left join ( select distinct SlDivCd,MgCd,Mgname from mis_app.mgmst) mgmst on docmst.mgcd =mgmst.mgcd 
            LEFT JOIN mis_app.hqmst ON hqmst.HqMstId=docmst.HqMstId
            where isupdated = 0 and docmst.SlDivCd in (${SlDivCd.split(',').map(cd => `'${cd.trim()}'`).join(',')})
            order by MgName,DoctName;`;
    }

    if (SlDivCd && MgCd) {
        query = `select 
        docmst.MgCd,
        docmst.SldivCd,
        docmst.DoctCd,
        mgmst.MgName,
        docmst.HqMstId,
        hqmst.HeadQrt,
        docmst.DoctName,
        docmst.DocQualification,
        docmst.Speciality,
        docmst.AddLine1,
        docmst.AddLine2,
        docmst.AddLine3,
        docmst.City,
        docmst.Pincode,
        docmst.Telno,
        docmst.Mobile,
        docmst.Email,
        docmst.IsUpdated
        from docmst
        left join mis_app.mgmst as mgmst on docmst.mgcd=mgmst.mgcd and docmst.HqMstId=mgmst.HqMstId
        LEFT JOIN mis_app.hqmst ON hqmst.HqMstId=docmst.HqMstId
        where isupdated = 0 and docmst.SlDivCd = '${SlDivCd}' and docmst.MgCd like '${MgCd}%'
        ${MgCd.length == 7 ? ` and mgmst.EmpNo='${UserId}'` : ''}
        order by MgName,DoctName`;
    }

    const [result] = await pool.query(query)
    if (result.length === 0) {
        throw new ApiError(404, "No doctors found");
    }
    res.json(new ApiResponse(200, result, "Doctors fetched successfully"));
});

export const getDoctorMstById = asyncHandler(async (req, res) => {

    const { SlDivCd, MgCd } = req.user;
    const { DoctCd } = req.params || {};

    let query;

    if (SlDivCd && !MgCd) {
        query = `select * from docmst where isupdated = 0 and SlDivCd in (${SlDivCd.split(',').map(cd => `'${cd.trim()}'`).join(',')}) and DoctCd = '${DoctCd}'`;
    }

    if (SlDivCd && MgCd) {
        query = `select * from docmst where isupdated = 0 and SlDivCd = '${SlDivCd}' and MgCd like '${MgCd}%' and DoctCd = '${DoctCd}'`;
    }

    const [result] = await pool.query(query);

    if (result.length === 0) {
        return res.status(404).json(new ApiError(404, [], "Doctor not found"));
    }

    res.json(new ApiResponse(200, result, "Doctor fetched successfully"));
});

export const updateDoctorMst = asyncHandler(async (req, res) => {

    const { UserId, SlDivCd, MgCd } = req.user;

    const valOrNull = (v) => (v && v.trim() !== "" ? `'${v}'` : "NULL");

    const { DoctCd, DocQualification, Speciality, AddLine1, AddLine2, AddLine3, City, Pincode, Telno, Mobile, Email } = req.body;

    let query;

    if (SlDivCd && !MgCd) {
        query = `update docmst set DocQualification = '${DocQualification}', 
        Speciality = ${valOrNull(Speciality)}, 
        AddLine1 = ${valOrNull(AddLine1)}, 
        AddLine2 = ${valOrNull(AddLine2)}, 
        AddLine3 = ${valOrNull(AddLine3)}, 
        City = ${valOrNull(City)}, 
        Pincode = ${valOrNull(Pincode)}, 
        Telno = ${valOrNull(Telno)}, 
        Mobile = ${valOrNull(Mobile)}, 
        email = ${valOrNull(Email)}, 
        isupdated = 1, 
        MstUpdBy = '${UserId}' 
        where SlDivCd in (${SlDivCd.split(',').map(cd => `'${cd.trim()}'`).join(',')}) and DoctCd = '${DoctCd}'`;
    }
    if (SlDivCd && MgCd) {
        query = `update docmst set DocQualification = '${DocQualification}', 
        Speciality = ${valOrNull(Speciality)}, 
        AddLine1 = ${valOrNull(AddLine1)}, 
        AddLine2 = ${valOrNull(AddLine2)}, 
        AddLine3 = ${valOrNull(AddLine3)}, 
        City = ${valOrNull(City)}, 
        Pincode = ${valOrNull(Pincode)}, 
        Telno = ${valOrNull(Telno)}, 
        Mobile = ${valOrNull(Mobile)}, 
        email = ${valOrNull(Email)}, 
        isupdated = 1, 
        MstUpdBy = '${UserId}' 
        where SlDivCd = '${SlDivCd}' and MgCd like '${MgCd}%' and DoctCd = '${DoctCd}'`;
    }


    const [emailValidate] = await pool.query("select count (*) as count from docmst where Email = ? and doctCd != ?", [Email,DoctCd])


    if (emailValidate[0].count > 0) {
        return res.status(400).json(new ApiError(400, [], "Email already exists"))
    }

    const [phoneValidate] = await pool.query("select count (*) as count from docmst where Mobile = ? and doctCd != ?", [Mobile,DoctCd])

    if (phoneValidate[0].count > 0) {
        return res.status(400).json(new ApiError(400, [], "MobileNo already exists"))
    }

    const [result] = await pool.query(query);

    if (result.affectedRows === 0) {
        return res.status(404).json(new ApiError(404, [], "Doctor not found or already updated"));
    }

    res.json(new ApiResponse(200, [], "Doctor updated successfully"));
});
