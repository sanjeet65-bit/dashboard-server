import { ApiResponse } from "../utlis/apiResponse.js";
import { ApiError } from "../utlis/apiError.js";
import { asyncHandler } from "../utlis/asynchandler.js";
import pool from "../config/db.js";



export const getAllUsers = asyncHandler(async (req, res) => {
    const { SlDivCd, MgCd } = req.user || {};

    const query = "Select * from logins";

    const [result] = await pool.query(query)

    return res.json(new ApiResponse(200, result, "All users "))
});


export const getAllRoles = asyncHandler(async (req, res) => {

    const [result] = await pool.query('select * from rolemst')

    return res.json(new ApiResponse(200, result, "Roles Master"))
})


export const getAllPermissions = asyncHandler(async (req, res) => {

    const [result] = await pool.query('select * from permissionmst')

    return res.json(new ApiResponse(200, result, "Permissions Master"))
})


export const getUserById = asyncHandler(async (req, res) => {
    const { UserId } = req.params || {}

    if (!UserId) {
        return res.json(new ApiError(401, [], "Please Provide the UserId.."))
    }

    const query = `Select * from Logins where UserId='${UserId}'`

    const [result] = await pool.query(query)


    if (result.length == 0) {
        return res.json(new ApiError(401, [], 'UserId not Found..'))
    }

    return res.json(new ApiResponse(200, result))



})


export const getRolePermissionById = asyncHandler(async (req, res) => {

    const roleId = req.params.roleid;

    const [result] = await pool.query('select * from role_permissions WHERE role_id = ? ', [roleId])

    return res.json(new ApiResponse(200, result, "Role Permission Master"))
})


export const addUser = asyncHandler(async (req, res) => {
    const {
        UserId,
        EmpNo,
        UserName,
        Password,
        role_id,
        SlDivCd,
        MgCd,
    } = req?.body || {};

    if (!UserId || !EmpNo || !UserName || !Password || !role_id) {
        return res.json(new ApiError(400, [], "Please provide all required fields."));
    }

    // Check if user already exists
    const [existingUser] = await pool.query(
        `SELECT * FROM Logins WHERE UserId = ?`,
        [UserId]
    );


    if (existingUser.length > 0) {
        return res.status(409).json(
            new ApiError(409, [], "User with same UserId already exists.")
        );
    }

    const query = `
        INSERT INTO Logins (
            UserId, EmpNo, UserName, Password, role_id, SlDivCd, MgCd
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
        UserId,
        EmpNo,
        UserName,
        Password,
        role_id,
        SlDivCd || null,
        MgCd || null,
    ]);

    return res.json(new ApiResponse(200, result, "User added successfully."));

});


export const addRole = asyncHandler(async (req, res) => {
    const { role_id, description } = req?.body || {};


    if (!role_id) {
        return res.json(new ApiError(400, [], "Please provide the role_id."));
    }

    // Check if role already exists
    const [existingRole] = await pool.query(
        `SELECT * FROM rolemst WHERE role_Id = ?`,
        [role_id]
    );

    if (existingRole.length > 0) {
        return res.status(409).json(
            new ApiError(409, [], "Role with same role_id already exists.")
        );
    }

    const query = `
        INSERT INTO rolemst (role_Id,description)
        VALUES (?,?)
    `;

    const [result] = await pool.query(query, [role_id, description || null]);

    return res.json(new ApiResponse(200, result, "Role added successfully."));
});


export const updateUser = asyncHandler(async (req, res) => {
    const {
        UserId,
        UserName,
        role_id,
        SlDivCd,
        MgCd,
        IsLocked,
        IsActive,
    } = req?.body || {};

    if (!UserId) {
        return res.json(new ApiError(400, [], "Please provide the UserId."));
    }

    const query = `
        UPDATE Logins SET
            username = ?,
            role_id = ?,
            SlDivCd = ?,
            MgCd = ?,
            IsLocked = ?,
            IsActive = ?,
            LastModified = NOW()
        WHERE UserId = ?
    `;

    const [result] = await pool.query(query, [
        UserName,
        role_id,
        SlDivCd,
        MgCd,
        IsLocked,
        IsActive,
        UserId,
    ]);

    if (result.affectedRows === 0) {
        return res.json(new ApiError(404, [], "UserId not found."));
    }

    return res.json(
        new ApiResponse(200, result, "User updated successfully.")
    );
});


export const updateRolePermission = asyncHandler(async (req, res) => {
    const { role_id, permission_id } = req?.body || {};
    
    if (!role_id || !Array.isArray(permission_id)) {
        return res.status(400).json(new ApiError(400, [], "Please provide the role_id and permissions array."));
    }

    if (role_id === 'ADMIN') {
        return res.status(403).json(new ApiError(403, [], "CAN NOT UPDATE ADMIN"));
    }

    // Start a transaction
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        // Delete existing permissions for the role
        await connection.query('DELETE FROM role_permissions WHERE role_id = ?', [role_id]);
        // Insert new permissions
        const insertValues = permission_id.map(permission_id => [role_id, permission_id]);
        if (insertValues.length > 0) {
            await connection.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ?', [insertValues]);
        }
        await connection.commit();
        return res.status(200).json(new ApiResponse(200, null, "Role permissions updated successfully."));
    } catch (error) {
        await connection.rollback();
        return res.status(500).json(new ApiError(500, [], "An error occurred while updating role permissions."));
    } finally {
        connection.release();
    }

});


export const deleteUser = asyncHandler(async (req, res) => {
    const { UserId } = req.params || {};

    if (!UserId) {
        return res.json(new ApiError(400, [], "Please provide the UserId."));
    }

    const query = `DELETE FROM Logins WHERE UserId = ?`;

    const [result] = await pool.query(query, [UserId]);

    if (result.affectedRows === 0) {
        return res.json(new ApiError(404, [], "UserId not found."));
    }

    return res.json(new ApiResponse(200, result, "User deleted successfully."));
});


export const deleteRole = asyncHandler(async (req, res) => {
    const { roleid } = req.params || {};

    if (!roleid) {
        return res.json(new ApiError(400, [], "Please provide the roleid."));
    }

    if (roleid === 'ADMIN') {
        return res.json(new ApiError(403, [], "Cannot delete admin role."));
    }

    const query = `DELETE FROM rolemst WHERE role_Id = ?`;

    const [result] = await pool.query(query, [roleid]);

    if (result.affectedRows === 0) {
        return res.json(new ApiError(404, [], "Role not found."));
    }

    return res.json(new ApiResponse(200, result, "Role deleted successfully."));
});